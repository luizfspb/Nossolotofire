
import { LotteryType, LotteryRule } from './types';

export const APP_VERSION_CODE = 1;

export const LOTTERY_CONFIGS: Record<LotteryType, { name: string; color: string; endpoint: string }> = {
  [LotteryType.MEGA_SENA]: { name: 'Mega-Sena', color: 'bg-green-600', endpoint: 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena' },
  [LotteryType.LOTOFACIL]: { name: 'Lotofácil', color: 'bg-purple-700', endpoint: 'https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil' },
  [LotteryType.QUINA]: { name: 'Quina', color: 'bg-blue-800', endpoint: 'https://servicebus2.caixa.gov.br/portaldeloterias/api/quina' },
  [LotteryType.LOTOMANIA]: { name: 'Lotomania', color: 'bg-orange-500', endpoint: 'https://servicebus2.caixa.gov.br/portaldeloterias/api/lotomania' },
  [LotteryType.TIMEMANIA]: { name: 'Timemania', color: 'bg-yellow-400 text-black', endpoint: 'https://servicebus2.caixa.gov.br/portaldeloterias/api/timemania' },
  [LotteryType.DUPLA_SENA]: { name: 'Dupla Sena', color: 'bg-red-800', endpoint: 'https://servicebus2.caixa.gov.br/portaldeloterias/api/duplasena' },
  [LotteryType.SUPER_SETE]: { name: 'Super Sete', color: 'bg-lime-500 text-black', endpoint: 'https://servicebus2.caixa.gov.br/portaldeloterias/api/supersete' },
  [LotteryType.DIA_DE_SORTE]: { name: 'Dia de Sorte', color: 'bg-amber-600', endpoint: 'https://servicebus2.caixa.gov.br/portaldeloterias/api/diadesorte' },
  [LotteryType.MAIS_MILIONARIA]: { name: '+Milionária', color: 'bg-indigo-900', endpoint: 'https://servicebus2.caixa.gov.br/portaldeloterias/api/maismilionaria' }
};

export const LOTTERY_RULES: Record<LotteryType, LotteryRule> = {
  [LotteryType.MEGA_SENA]: { minPicks: 6, maxPicks: 20, range: 60 },
  [LotteryType.LOTOFACIL]: { minPicks: 15, maxPicks: 20, range: 25 },
  [LotteryType.QUINA]: { minPicks: 5, maxPicks: 15, range: 80 },
  [LotteryType.LOTOMANIA]: { minPicks: 50, maxPicks: 50, range: 100 },
  [LotteryType.TIMEMANIA]: { minPicks: 10, maxPicks: 10, range: 80, hasTeam: true },
  [LotteryType.DUPLA_SENA]: { minPicks: 6, maxPicks: 15, range: 50 },
  [LotteryType.SUPER_SETE]: { minPicks: 7, maxPicks: 21, range: 10, hasTrevos: false },
  [LotteryType.DIA_DE_SORTE]: { minPicks: 7, maxPicks: 15, range: 31, hasMonth: true },
  [LotteryType.MAIS_MILIONARIA]: { minPicks: 6, maxPicks: 12, range: 50, hasTrevos: true, minTrevos: 2, maxTrevos: 6 }
};

export const PRICES: Partial<Record<LotteryType, Record<number, number>>> = {
  [LotteryType.MEGA_SENA]: { 6: 5, 7: 35, 8: 140, 9: 420, 10: 1050, 11: 2310, 12: 4620, 13: 8580, 14: 15015, 15: 25025, 16: 40040, 17: 61880, 18: 92820, 19: 135660, 20: 193800 },
  [LotteryType.LOTOFACIL]: { 15: 3, 16: 48, 17: 408, 18: 2448, 19: 11628, 20: 46512 },
  [LotteryType.QUINA]: { 5: 2.5, 6: 15, 7: 52.5, 8: 140, 9: 315, 10: 630, 11: 1155, 12: 1980, 13: 3217.5, 14: 5005, 15: 7507.5 },
  [LotteryType.LOTOMANIA]: { 50: 3 },
  [LotteryType.TIMEMANIA]: { 10: 3.5 },
  [LotteryType.DUPLA_SENA]: { 6: 2.5, 7: 17.5, 8: 70, 9: 210, 10: 525, 11: 1155, 12: 2310, 13: 4290, 14: 7507.5, 15: 12512.5 },
  [LotteryType.DIA_DE_SORTE]: { 7: 2.5, 8: 20, 9: 90, 10: 300, 11: 825, 12: 1980, 13: 4290, 14: 8580, 15: 16087.5 },
  [LotteryType.SUPER_SETE]: { 
    7: 3, 8: 6, 9: 12, 10: 24, 11: 48, 12: 96, 13: 192, 14: 384, 
    15: 576, 16: 864, 17: 1296, 18: 1944, 19: 2916, 20: 4374, 21: 6561 
  }
};

export const MILIONARIA_PRICES: Record<number, Record<number, number>> = {
  6: { 2: 6, 3: 18, 4: 36, 5: 60, 6: 90 },
  7: { 2: 42, 3: 126, 4: 252, 5: 420, 6: 630 },
  8: { 2: 168, 3: 504, 4: 1008, 5: 1680, 6: 2520 },
  9: { 2: 504, 3: 1512, 4: 3024, 5: 5040, 6: 7560 },
  10: { 2: 1260, 3: 3780, 4: 7560, 5: 12600, 6: 18900 },
  11: { 2: 2772, 3: 8316, 4: 16632, 5: 27720, 6: 41580 },
  12: { 2: 5544, 3: 16632, 4: 33264, 5: 55440, 6: 83160 }
};

export const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
export const TEAMS = ["Flamengo", "Palmeiras", "São Paulo", "Corinthians", "Santos", "Grêmio", "Internacional", "Cruzeiro", "Atlético-MG", "Vasco", "Fluminense", "Botafogo", "Bahia", "Sport", "Fortaleza", "Ceará", "Coritiba", "Athletico-PR", "Goiás", "Vitória"];
