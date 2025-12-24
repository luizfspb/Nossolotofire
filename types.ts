
export enum LotteryType {
  MEGA_SENA = 'megasena',
  LOTOFACIL = 'lotofacil',
  QUINA = 'quina',
  LOTOMANIA = 'lotomania',
  TIMEMANIA = 'timemania',
  DUPLA_SENA = 'duplasena',
  SUPER_SETE = 'supersete',
  DIA_DE_SORTE = 'diadesorte',
  MAIS_MILIONARIA = 'maismilionaria'
}

export interface RateioPremio {
  descricaoFaixa: string;
  faixa: number;
  numeroDeGanhadores: number;
  valorPremio: number;
}

export interface LotteryResult {
  tipo: string;
  numero: number;
  dataApuracao: string;
  listaDezenas: string[];
  listaTrevo?: string[];
  trevosSorteados?: string[];
  valorEstimadoProximoConcurso: number;
  acumulado: boolean;
  proximoConcurso: number;
  dataProximoConcurso: string;
  localSorteio: string;
  nomeMunicipioUFSorteio?: string;
  valorArrecadado: number;
  listaRateioPremio: RateioPremio[];
  nomeTimeCoracaoMesSorte?: string;
  nomeTimeCoracao?: string;
  nomeMesSorte?: string;
  listaDezenasSegundoSorteio?: string[];
  dezenasSorteadasOrdemSorteio?: string[];
}

export interface RemoteConfig {
  min_version_code: number;
  maintenance_enabled: boolean;
  maintenance_message: string;
  ads_enabled: boolean;
  global_message_enabled: boolean;
  global_message_text: string;
  ai_enabled: boolean;
  ai_daily_limit: number;
  ai_provider_mode: 'local_only' | 'cloud';
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserPreferences {
  theme: ThemeMode;
  notificationsEnabled: boolean;
  vibrationEnabled: boolean;
  language: string;
  fcmToken?: string;
  installId: string;
}

export interface SavedGame {
  id: string;
  lottery: LotteryType;
  numbers: number[];
  extras?: {
    trevos?: number[];
    team?: string;
    month?: string;
    superSeteColumns?: number[][];
  };
  price: number;
  mode: 'manual' | 'auto' | 'ai';
  createdAt: number;
  updatedAt: number;
}

export interface LotteryRule {
  minPicks: number;
  maxPicks: number;
  range: number;
  hasTeam?: boolean;
  hasMonth?: boolean;
  hasTrevos?: boolean;
  minTrevos?: number;
  maxTrevos?: number;
}

export type AISuggestionStyle = 'random' | 'frequency' | 'balanced' | 'trend';

export interface AISuggestion {
  numbers: number[];
  extras?: any;
  explanation: string;
  price: number;
}

export const ADMOB_CONFIG = {
  appId: process.env.VITE_ADMOB_APP_ID || "ca-app-pub-3940256099942544~3347511713",
  banner: process.env.VITE_ADMOB_BANNER_ID || "ca-app-pub-3940256099942544/6300978111",
  interstitial: process.env.VITE_ADMOB_INTERSTITIAL_ID || "ca-app-pub-3940256099942544/1033173712",
  rewarded: process.env.VITE_ADMOB_REWARDED_ID || "ca-app-pub-3940256099942544/5224354917",
  native: process.env.VITE_ADMOB_NATIVE_ID || "ca-app-pub-3940256099942544/2247696110"
};
