
import { GoogleGenAI, Type } from "@google/genai";
import { LotteryType, AISuggestion } from '../types';
import { gameService } from './gameService';
import { firebaseService } from './firebaseService';

const USAGE_STORAGE_KEY = 'nossaloto_guru_usage';
const INITIAL_FREE_LIMIT = 5;

export interface GuruUsage {
  remaining: number;
  totalUsed: number;
}

export const aiService = {
  getUsage(): GuruUsage {
    // First, try to read server-side persisted credits (recommended)
    try {
      // Note: firebaseService is a simulated wrapper — in production this would call Firestore
      // We perform a synchronous read via getAiCredits (async) by returning default and letting
      // callers call `loadUsageFromServer()` when appropriate. For simplicity here, read local.
      const raw = localStorage.getItem(USAGE_STORAGE_KEY);
      if (!raw) return { remaining: INITIAL_FREE_LIMIT, totalUsed: 0 };
      return JSON.parse(raw);
    } catch (e) {
      return { remaining: INITIAL_FREE_LIMIT, totalUsed: 0 };
    }
  },

  async loadUsageFromServer(): Promise<GuruUsage> {
    try {
      const credits = await firebaseService.getAiCredits();
      if (credits.totalUsed === 0 && credits.remaining === 0) {
        // first-time user on server: initialize with INITIAL_FREE_LIMIT
        await firebaseService.setAiCredits(INITIAL_FREE_LIMIT, 0);
        return { remaining: INITIAL_FREE_LIMIT, totalUsed: 0 };
      }
      // save locally for quick reads
      const data: GuruUsage = { remaining: credits.remaining, totalUsed: credits.totalUsed };
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(data));
      return data;
    } catch (e) {
      console.warn('Failed to load usage from server, falling back to local', e);
      return this.getUsage();
    }
  },

  updateUsage(remaining: number, incrementTotal = false) {
    const current = this.getUsage();
    const newData: GuruUsage = {
      remaining,
      totalUsed: incrementTotal ? current.totalUsed + 1 : current.totalUsed
    };
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(newData));
    // also persist to server best-effort
    try {
      firebaseService.setAiCredits(newData.remaining, newData.totalUsed);
    } catch (e) {
      console.warn('Failed to persist usage to server', e);
    }
    return newData;
  },

  async generateWithGuruAI(
    userPrompt: string
  ): Promise<{ suggestions: AISuggestion[]; guruMessage: string; detectedLottery?: LotteryType; error?: string }> {
    
    // ensure we have server-synced usage
    const usage = await this.loadUsageFromServer().catch(() => this.getUsage());
    if (usage.remaining <= 0) {
      return { suggestions: [], guruMessage: "", error: "LIMIT_REACHED" };
    }

    firebaseService.logEvent('ai_guru_request', { prompt_length: userPrompt.length });
    
    // Fix: Using process.env.API_KEY exclusively as per guidelines and removing hardcoded fallback.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemInstruction = `
      Você é o "Guru Nossa Loto", o maior especialista em Loterias da Caixa Econômica Federal.
      Sua missão é gerar palpites matematicamente plausíveis, respeitando as regras técnicas.
      Responda sempre em JSON.
    `;

    try {
      const response = await ai.models.generateContent({
        // Fix: Using gemini-3-pro-preview for complex reasoning tasks.
        model: 'gemini-3-pro-preview',
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedLottery: { type: Type.STRING, enum: Object.values(LotteryType) },
              guruMessage: { type: Type.STRING },
              games: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    numbers: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                    explanation: { type: Type.STRING },
                    extras: {
                      type: Type.OBJECT,
                      properties: {
                        trevos: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                        team: { type: Type.STRING },
                        month: { type: Type.STRING },
                        superSeteColumns: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } }
                      }
                    }
                  },
                  required: ["numbers", "explanation"]
                }
              }
            },
            required: ["detectedLottery", "guruMessage", "games"]
          }
        }
      });

      // Fix: Accessing .text property directly from the response.
      const result = JSON.parse(response.text.trim());
      
      // Decrementa uso após sucesso (server-side)
      try {
        const resp = await firebaseService.consumeAiCredit();
        if (resp.ok) {
          this.updateUsage(resp.remaining, true);
        } else {
          // fallback to local decrement
          this.updateUsage(usage.remaining - 1, true);
        }
      } catch (e) {
        // fallback local
        this.updateUsage(usage.remaining - 1, true);
      }

      const suggestions: AISuggestion[] = result.games.map((g: any) => ({
        numbers: g.numbers.sort((a: number, b: number) => a - b),
        extras: g.extras || {},
        explanation: g.explanation,
        price: gameService.calculatePrice(result.detectedLottery, g.numbers.length, g.extras?.trevos?.length)
      }));

      return {
        suggestions,
        guruMessage: result.guruMessage,
        detectedLottery: result.detectedLottery as LotteryType
      };
    } catch (e: any) {
      firebaseService.logError(e, 'GuruAI Failure');
      return {
        suggestions: [],
        guruMessage: "Os astros estão desalinhados... Tente novamente mais tarde.",
        error: "API_ERROR"
      };
    }
  }
};
