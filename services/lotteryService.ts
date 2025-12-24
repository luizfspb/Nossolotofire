
import { LotteryType, LotteryResult } from '../types';
import { LOTTERY_CONFIGS } from '../constants';

const CACHE_KEY_PREFIX = 'nossaloto_cache_';

export const lotteryService = {
  async getLatestResult(type: LotteryType): Promise<LotteryResult> {
    const config = LOTTERY_CONFIGS[type];
    
    try {
      const response = await fetch(config.endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      this.saveToCache(type, data);
      return data;
    } catch (error) {
      console.warn(`Failed to fetch ${type}, attempting to load from cache...`, error);
      const cached = this.loadFromCache(type);
      if (cached) return cached;
      throw error;
    }
  },

  /**
   * Busca um resultado específico por número de concurso
   */
  async getContestResult(type: LotteryType, contestNumber: number): Promise<LotteryResult> {
    const config = LOTTERY_CONFIGS[type];
    const url = `${config.endpoint}/${contestNumber}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Contest not found');
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch contest ${contestNumber} for ${type}`, error);
      throw error;
    }
  },

  saveToCache(type: LotteryType, data: LotteryResult) {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${type}`, JSON.stringify(data));
  },

  loadFromCache(type: LotteryType): LotteryResult | null {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${type}`);
    return cached ? JSON.parse(cached) : null;
  },

  async getAllLatest(): Promise<Record<LotteryType, LotteryResult>> {
    const types = Object.values(LotteryType);
    const results: Partial<Record<LotteryType, LotteryResult>> = {};

    const promises = types.map(type => 
      this.getLatestResult(type as LotteryType)
        .then(res => ({ type, res }))
        .catch(err => ({ type, err }))
    );

    const outcomes = await Promise.all(promises);
    
    outcomes.forEach(outcome => {
      if ('res' in outcome) {
        results[outcome.type as LotteryType] = outcome.res;
      }
    });

    return results as Record<LotteryType, LotteryResult>;
  }
};
