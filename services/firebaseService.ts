
import { RemoteConfig, UserPreferences, ADMOB_CONFIG } from '../types';

/**
 * Firebase Service - Produção
 * Centraliza toda a integração com o ecossistema Google Firebase.
 */
export const firebaseService = {
  private_installId: localStorage.getItem('nossaloto_install_id') || `id_${Math.random().toString(36).substr(2, 9)}`,

  async init() {
    if (!localStorage.getItem('nossaloto_install_id')) {
      localStorage.setItem('nossaloto_install_id', this.private_installId);
    }
    
    console.log('[Firebase] Inicializando serviços para com.companyname.appjogosloteria');
    this.logEvent('app_open', { install_id: this.private_installId });
    
    // Simulação de inicialização do SDK AdMob
    console.log(`[AdMob] Inicializando SDK com App ID: ${ADMOB_CONFIG.appId}`);
    
    // Inscrição automática em tópicos
    this.subscribeToTopic('alerts_global');
  },

  async fetchRemoteConfig(): Promise<RemoteConfig> {
    this.logBreadcrumb('Iniciando fetch do Remote Config');
    try {
      // Em produção, isso usaria o SDK: remoteConfig().fetchAndActivate()
      // Valores default locais integrados
      const defaults: RemoteConfig = {
        min_version_code: 1,
        maintenance_enabled: false,
        maintenance_message: "Sistema em manutenção programada pela Caixa.",
        ads_enabled: true,
        global_message_enabled: false,
        global_message_text: "",
        ai_enabled: true,
        ai_daily_limit: 10,
        ai_provider_mode: 'cloud'
      };

      // Simulação de valores vindos do servidor
      const remoteValues = {
        min_version_code: 1,
        maintenance_enabled: false,
        ads_enabled: true,
        global_message_enabled: true,
        global_message_text: "Resultados da Mega-Sena atualizados! Confira o novo prêmio."
      };

      const finalConfig = { ...defaults, ...remoteValues };
      this.logEvent('remote_config_fetched', { status: 'success' });
      return finalConfig;
    } catch (error) {
      this.logError(error, 'Erro ao buscar Remote Config');
      this.logEvent('remote_config_fetched', { status: 'fail' });
      throw error;
    }
  },

  async saveUserPreferences(prefs: UserPreferences) {
    this.logBreadcrumb('Salvando preferências no Firestore');
    try {
      // Simulação: db.collection('users').doc(installId).set(prefs, {merge: true})
      console.log(`[Firestore] Documento atualizado para ${this.private_installId}:`, prefs);
      this.logEvent('settings_saved', { theme: prefs.theme, notifications: prefs.notificationsEnabled });
    } catch (error) {
      this.logError(error, 'Erro ao salvar no Firestore');
    }
  },

  async subscribeToTopic(topic: string) {
    console.log(`[FCM] Inscrito no tópico: ${topic}`);
    this.logEvent('fcm_topic_subscribe', { topic });
  },

  // Fix: Added missing subscribeToNotifications method called in Settings.tsx
  async subscribeToNotifications() {
    console.log('[FCM] Notificações habilitadas no Firebase');
    this.logEvent('fcm_notification_subscribe');
  },

  // Fix: Added missing unsubscribeFromNotifications method called in Settings.tsx
  async unsubscribeFromNotifications() {
    console.log('[FCM] Notificações desabilitadas no Firebase');
    this.logEvent('fcm_notification_unsubscribe');
  },

  async getFCMToken(): Promise<string> {
    const token = `fcm_token_${this.private_installId}`; // Simulação de token real
    console.log(`[FCM] Token gerado: ${token}`);
    return token;
  },

  // --- Simulated server-side storage for AI credits ---
  // In a real implementation this would be Firestore/Realtime DB keyed by Firebase UID.
  _serverStorageKey: 'nossaloto_server_db',

  _getServerDb(): Record<string, any> {
    try {
      const raw = localStorage.getItem(this._serverStorageKey) || '{}';
      return JSON.parse(raw);
    } catch (e) {
      return {};
    }
  },

  _setServerDb(db: Record<string, any>) {
    localStorage.setItem(this._serverStorageKey, JSON.stringify(db));
  },

  // Returns a stable user id: if you integrate Firebase Auth, replace with firebase uid
  getUserId(): string {
    return this.private_installId;
  },

  async getAiCredits(): Promise<{ remaining: number; totalUsed: number }> {
    const uid = this.getUserId();
    const db = this._getServerDb();
    const record = db[uid] || null;
    if (record) return { remaining: record.remaining || 0, totalUsed: record.totalUsed || 0 };
    return { remaining: 0, totalUsed: 0 };
  },

  async setAiCredits(remaining: number, totalUsed = 0) {
    const uid = this.getUserId();
    const db = this._getServerDb();
    db[uid] = { remaining, totalUsed };
    this._setServerDb(db);
    this.logEvent('ai_credits_set', { uid, remaining, totalUsed });
  },

  async grantAiCredit(amount = 1) {
    const uid = this.getUserId();
    const db = this._getServerDb();
    const rec = db[uid] || { remaining: 0, totalUsed: 0 };
    rec.remaining = (rec.remaining || 0) + amount;
    db[uid] = rec;
    this._setServerDb(db);
    this.logEvent('ai_credit_granted', { uid, amount, newRemaining: rec.remaining });
    return rec;
  },

  async consumeAiCredit() {
    const uid = this.getUserId();
    const db = this._getServerDb();
    const rec = db[uid] || { remaining: 0, totalUsed: 0 };
    if ((rec.remaining || 0) <= 0) {
      return { ok: false, remaining: 0 };
    }
    rec.remaining = rec.remaining - 1;
    rec.totalUsed = (rec.totalUsed || 0) + 1;
    db[uid] = rec;
    this._setServerDb(db);
    this.logEvent('ai_credit_consumed', { uid, newRemaining: rec.remaining });
    return { ok: true, remaining: rec.remaining };
  },

  // --- ANALYTICS ---
  logEvent(name: string, params?: Record<string, any>) {
    console.log(`[Analytics] Evento: ${name}`, params || '');
    // Em produção: analytics().logEvent(name, params)
  },

  logScreenView(screenName: string) {
    this.logEvent('screen_view', { screen_name: screenName });
  },

  // --- CRASHLYTICS ---
  logError(error: any, context?: string) {
    console.error(`[Crashlytics] Erro: ${context || 'Exceção não capturada'}`, error);
    // Em produção: crashlytics().recordError(error)
    this.logEvent('app_error', { context, message: error?.message || String(error) });
  },

  logBreadcrumb(message: string) {
    console.log(`[Crashlytics Breadcrumb]: ${message}`);
    // Em produção: crashlytics().log(message)
  }
};
