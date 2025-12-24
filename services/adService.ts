
import { ADMOB_CONFIG } from '../types';
import { firebaseService } from './firebaseService';

/**
 * AdService - Gerenciamento de blocos AdMob
 */
export const adService = {
  private_interstitialLoaded: false,

  async loadInterstitial() {
    firebaseService.logBreadcrumb(`Carregando Intersticial ID: ${ADMOB_CONFIG.interstitial}`);
    setTimeout(() => {
      this.private_interstitialLoaded = true;
      console.log('[AdMob] Intersticial carregado.');
    }, 1500);
  },

  async showInterstitial(context: string) {
    if (this.private_interstitialLoaded) {
      console.log(`[AdMob] Exibindo Intersticial: ${context}`);
      firebaseService.logEvent('ad_interstitial_show', { context });
      this.private_interstitialLoaded = false;
      this.loadInterstitial();
      return true;
    }
    return false;
  },

  /**
   * Simula a exibição de um anúncio premiado utilizando o ID configurado
   */
  async showRewardedAd(): Promise<boolean> {
    console.log(`[AdMob] Carregando vídeo premiado ID: ${ADMOB_CONFIG.rewarded}...`);
    firebaseService.logEvent('ad_rewarded_request');
    
    // Simula o tempo do vídeo (2 segundos para demo)
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        console.log('[AdMob] Vídeo premiado concluído. Recompensa concedida.');
        firebaseService.logEvent('ad_rewarded_complete');
        try {
          // Concede 1 crédito AI ao usuário (server-side simulated)
          await firebaseService.grantAiCredit(1);
        } catch (e) {
          console.error('Erro ao conceder crédito AI:', e);
        }
        resolve(true);
      }, 2000);
    });
  }
};
