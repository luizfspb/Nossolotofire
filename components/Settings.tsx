
import React, { useState, useEffect } from 'react';
import { UserPreferences, ThemeMode, RemoteConfig } from '../types';
import { firebaseService } from '../services/firebaseService';

interface SettingsProps {
  config: RemoteConfig | null;
  onThemeChange: (mode: ThemeMode) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ config, onThemeChange, onOpenPrivacy, onOpenTerms }) => {
  const [prefs, setPrefs] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('nossaloto_prefs');
    return saved ? JSON.parse(saved) : {
      theme: 'system',
      notificationsEnabled: false,
      vibrationEnabled: true,
      language: 'pt-BR'
    };
  });

  const [installId] = useState(() => localStorage.getItem('nossaloto_install_id') || `id_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    localStorage.setItem('nossaloto_prefs', JSON.stringify(prefs));
    onThemeChange(prefs.theme);
    firebaseService.saveUserPreferences(prefs);
  }, [prefs, onThemeChange]);

  const toggleNotifications = async () => {
    if (!prefs.notificationsEnabled) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          await firebaseService.subscribeToNotifications();
          setPrefs(prev => ({ ...prev, notificationsEnabled: true }));
        } else {
          alert("Permissão de notificação negada.");
        }
      }
    } else {
      await firebaseService.unsubscribeFromNotifications();
      setPrefs(prev => ({ ...prev, notificationsEnabled: false }));
    }
  };

  const sendDiagnostic = () => {
    firebaseService.logEvent('diagnostic_sent', { installId });
    firebaseService.logBreadcrumb('User manually triggered diagnostic');
    alert(`Diagnóstico enviado!\nID: ${installId}`);
  };

  const restoreDefaults = () => {
    if (confirm("Deseja restaurar as configurações padrão e limpar o cache?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 pb-24 transition-colors">
      <div className="p-4 space-y-4">
        {/* Seção Preferências */}
        <section className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Preferências</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Tema</span>
              <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                {(['light', 'dark', 'system'] as ThemeMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setPrefs(prev => ({ ...prev, theme: mode }))}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                      prefs.theme === mode 
                        ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm' 
                        : 'text-slate-400'
                    }`}
                  >
                    {mode === 'light' ? 'Claro' : mode === 'dark' ? 'Escuro' : 'Auto'}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={restoreDefaults}
              className="w-full text-left py-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
            >
              Restaurar padrões
            </button>
          </div>
        </section>

        {/* Seção Notificações */}
        <section className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Notificações</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Avisar novos concursos</p>
              <p className="text-[10px] text-slate-400 font-medium italic">Receba alertas assim que o sorteio sair.</p>
            </div>
            <button 
              onClick={toggleNotifications}
              className={`w-12 h-6 rounded-full transition-colors relative ${prefs.notificationsEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${prefs.notificationsEnabled ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
        </section>

        {/* Seção Anúncios */}
        <section className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Anúncios</h3>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Status</span>
            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${config?.ads_enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {config?.ads_enabled ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          <button 
            disabled 
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-400 font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-not-allowed"
          >
            Remover Anúncios <span className="text-[8px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">EM BREVE</span>
          </button>
        </section>

        {/* Seção Informações Legais */}
        <section className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Informações Legais</h3>
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-800">
              <p className="text-[10px] text-amber-800 dark:text-amber-200 leading-relaxed font-medium">
                <strong>Aviso:</strong> Este aplicativo não possui vínculo com a Caixa Econômica Federal. Sugestões de IA não garantem prêmios.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={onOpenPrivacy} className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest text-center py-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl hover:bg-indigo-100 transition-colors">Política de Privacidade</button>
              <button onClick={onOpenTerms} className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest text-center py-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl hover:bg-indigo-100 transition-colors">Termos de Uso</button>
            </div>
          </div>
        </section>

        {/* Seção Diagnóstico */}
        <section className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Diagnóstico</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase mb-1">ID Anônimo</p>
              <code className="text-xs font-mono text-slate-500 dark:text-slate-400">{installId}</code>
            </div>
            <button 
              onClick={sendDiagnostic}
              className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-slate-200 dark:shadow-none"
            >
              Enviar Diagnóstico
            </button>
          </div>
        </section>

        <div className="text-center py-4">
          <p className="text-[10px] text-slate-300 dark:text-slate-600 font-bold uppercase tracking-[0.2em]">Nossa Loto v1.0.0</p>
        </div>
      </div>
    </div>
  );
};
