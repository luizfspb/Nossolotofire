
import { LotteryType, SavedGame, SavedGame as IGame, LotteryResult } from '../types';
import { LOTTERY_RULES, PRICES, MILIONARIA_PRICES, TEAMS, MONTHS, LOTTERY_CONFIGS } from '../constants';
import { firebaseService } from './firebaseService';

const STORAGE_KEY = 'nossaloto_saved_games';

// Fallback para ambientes onde crypto.randomUUID não está disponível
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const gameService = {
  getSavedGames(lottery?: LotteryType): IGame[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    const games: IGame[] = raw ? JSON.parse(raw) : [];
    return lottery ? games.filter(g => g.lottery === lottery) : games;
  },

  saveGame(game: Omit<IGame, 'id' | 'createdAt' | 'updatedAt'>): IGame {
    const games = this.getSavedGames();
    const newGame: IGame = {
      ...game,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    games.unshift(newGame);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    
    firebaseService.logEvent('bet_save', { lottery: game.lottery, mode: game.mode });
    return newGame;
  },

  deleteGame(id: string) {
    const games = this.getSavedGames();
    const filtered = games.filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    firebaseService.logEvent('bet_delete', { gameId: id });
  },

  deleteAllGames() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    firebaseService.logEvent('bet_delete_all');
  },

  calculatePrice(lottery: LotteryType, picksCount: number, trevosCount?: number): number {
    try {
      if (lottery === LotteryType.MAIS_MILIONARIA) {
        return MILIONARIA_PRICES[picksCount]?.[trevosCount || 2] || 0;
      }
      return PRICES[lottery]?.[picksCount] || 0;
    } catch (e) {
      firebaseService.logError(e);
      return 0;
    }
  },

  async shareResult(result: LotteryResult, type?: LotteryType) {
    const lotteryKey = type || (result.tipo?.toLowerCase().replace('_', '') as LotteryType);
    const config = LOTTERY_CONFIGS[lotteryKey] || { name: 'Loteria', color: '' };
    
    const text = `⭐ Resultado ${config.name}\nConcurso: ${result.numero}\nData: ${result.dataApuracao}\n\nNúmeros: ${result.listaDezenas.join(' - ')}\n${result.listaTrevo ? `Trevos: ${result.listaTrevo.join(' - ')}\n` : ''}${result.acumulado ? '🚨 ACUMULOU!' : ''}\n\nConfira mais no app Nossa Loto!`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: `Resultado ${config.name}`, text });
      } catch (e) {
        console.error("Error sharing", e);
        this.fallbackCopy(text);
      }
    } else {
      this.fallbackCopy(text);
    }
  },

  async shareGame(game: SavedGame) {
    const config = LOTTERY_CONFIGS[game.lottery];
    let numbersText = game.numbers.map(n => n.toString().padStart(2, '0')).join(' - ');
    
    if (game.lottery === LotteryType.SUPER_SETE && game.extras?.superSeteColumns) {
      numbersText = game.extras.superSeteColumns.map((col, i) => `Col ${i+1}: [${col.join(',')}]`).join('\n');
    }

    const text = `🍀 Meu Jogo para ${config.name}\n\n${numbersText}\n${game.extras?.trevos ? `Trevos: ${game.extras.trevos.join(' - ')}\n` : ''}${game.extras?.team ? `Time: ${game.extras.team}\n` : ''}${game.extras?.month ? `Mês: ${game.extras.month}\n` : ''}\nValor: R$ ${game.price.toFixed(2)}\nGerado no app Nossa Loto!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `Meu Jogo ${config.name}`, text });
      } catch (e) {
        this.fallbackCopy(text);
      }
    } else {
      this.fallbackCopy(text);
    }
  },

  fallbackCopy(text: string) {
    try {
      navigator.clipboard.writeText(text);
      alert("Resultado copiado para a área de transferência!");
    } catch (err) {
      alert("Não foi possível compartilhar ou copiar o resultado.");
    }
  },

  generateRandom(lottery: LotteryType, totalPicks?: number): Partial<IGame> {
    const rule = LOTTERY_RULES[lottery];
    const nPicks = totalPicks || rule.minPicks;
    
    let numbers: number[] = [];
    let extras: any = {};

    if (lottery === LotteryType.SUPER_SETE) {
      const columns: number[][] = Array.from({ length: 7 }, () => []);
      for (let i = 0; i < 7; i++) {
        columns[i].push(Math.floor(Math.random() * 10));
      }
      let remaining = nPicks - 7;
      let colIdx = 0;
      const maxPerCol = nPicks <= 14 ? 2 : 3;
      while (remaining > 0) {
        if (columns[colIdx].length < maxPerCol) {
           let nextNum = Math.floor(Math.random() * 10);
           while (columns[colIdx].includes(nextNum)) {
             nextNum = Math.floor(Math.random() * 10);
           }
           columns[colIdx].push(nextNum);
           remaining--;
        }
        colIdx = (colIdx + 1) % 7;
      }
      extras.superSeteColumns = columns;
      numbers = columns.flat(); 
    } else {
      while (numbers.length < nPicks) {
        const n = Math.floor(Math.random() * rule.range) + 1;
        if (!numbers.includes(n)) numbers.push(n);
      }
      numbers.sort((a, b) => a - b);
    }
    
    if (rule.hasTrevos) {
      const trevos: number[] = [];
      const minT = rule.minTrevos || 2;
      while (trevos.length < minT) {
        const t = Math.floor(Math.random() * (rule.maxTrevos || 6)) + 1;
        if (!trevos.includes(t)) trevos.push(t);
      }
      extras.trevos = trevos.sort((a,b) => a-b);
    }
    
    if (rule.hasTeam) extras.team = TEAMS[Math.floor(Math.random() * TEAMS.length)];
    if (rule.hasMonth) extras.month = MONTHS[Math.floor(Math.random() * MONTHS.length)];

    const price = this.calculatePrice(lottery, nPicks, extras.trevos?.length);

    return {
      lottery,
      numbers,
      extras,
      price,
      mode: 'auto'
    };
  }
};
