
import { GoogleGenAI } from "@google/genai";
import { LotteryType, LotteryResult } from "../types";

export const geminiService = {
  async ensureApiKey() {
    try {
      if (!(await window.aistudio.hasSelectedApiKey())) {
        await window.aistudio.openSelectKey();
      }
    } catch (e) {
      console.warn("Falha ao verificar/abrir seletor de chave:", e);
    }
  },

  async getLotteryInsights(type: string, lastResult: LotteryResult) {
    await this.ensureApiKey();
    // Re-initializing GoogleGenAI right before the call to pick up the most recent API key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Você é um especialista em estatística de loterias brasileiras para o app "Nossa Loto".
      Analise o último resultado da ${type}:
      Concurso: ${lastResult.numero}
      Dezenas: ${lastResult.listaDezenas.join(', ')}
      ${lastResult.listaTrevo || lastResult.trevosSorteados ? `Trevos: ${(lastResult.trevosSorteados || lastResult.listaTrevo || []).join(', ')}` : ''}

      Com base nisso, forneça um breve insight (máximo 100 palavras) em português sobre o comportamento estatístico (curiosidade, frequência ou paridade) e sugira 3 números da "sorte" inspirados na numerologia do dia.
      Seja claro que isso não é garantia de ganho.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      // Directly accessing the .text property of GenerateContentResponse.
      return response.text || "Não foi possível gerar insights no momento.";
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      console.error("Gemini AI error:", error);
      
      // Robust error detection for API key/billing issues.
      if (errorMsg.includes("403") || errorMsg.includes("PERMISSION_DENIED") || errorMsg.includes("404") || errorMsg.includes("Requested entity was not found")) {
        return "Erro de Configuração: Sua chave API pode estar restrita ou o projeto não possui faturamento ativo. Por favor, verifique sua chave API nos Ajustes.";
      }
      
      return "O assistente de IA está pensando... tente novamente mais tarde.";
    }
  }
};
