
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LotteryType, LotteryResult, RemoteConfig, ThemeMode } from './types';
import { APP_VERSION_CODE, LOTTERY_CONFIGS } from './constants';
import { lotteryService } from './services/lotteryService';
import { firebaseService } from './services/firebaseService';
import { geminiService } from './services/geminiService';
import { adService } from './services/adService';
import { gameService } from './services/gameService';
import { LotteryCard } from './components/LotteryCard';
import { AdBanner } from './components/AdBanner';
import { GameGenerator } from './components/GameGenerator';
import { GuruAI } from './components/GuruAI';
import { Settings } from './components/Settings';
import { SavedGames } from './components/SavedGames';

type Screen = 'results' | 'generator' | 'mygames' | 'ai' | 'settings' | 'privacy' | 'terms';

export const TrevoIcon: React.FC<{ number: string | number; size?: 'sm' | 'md' | 'lg' }> = ({ number, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-[11px]',
    lg: 'w-12 h-12 text-[13px]'
  };

  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center animate-in zoom-in duration-300`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        <path d="M50 50 L50 90" stroke="#1e1b4b" strokeWidth="8" strokeLinecap="round" />
        <path 
          d="M50 50c0-25-35-25-35 0s35 25 35 0c0-25 35-25 35 0s-35 25-35 0c25 0 25 35 0 35s-25-35 0-35c-25 0-25-35 0-35s25 35 0 25" 
          fill="#facc15" 
          stroke="#1e1b4b" 
          strokeWidth="4" 
        />
      </svg>
      <span className="relative z-10 font-black text-indigo-950 mt-[-4px] drop-shadow-sm">{number}</span>
    </div>
  );
};

const LegalScreen: React.FC<{ title: string; content: React.ReactNode; onBack: () => void }> = ({ title, content, onBack }) => (
  <div className="flex flex-col h-full bg-white dark:bg-slate-900 animate-in slide-in-from-right duration-300">
    <header className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
      <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h2 className="font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase text-sm">{title}</h2>
    </header>
    <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-600 dark:text-slate-300 pb-24">
      {content}
    </div>
  </div>
);

// Fix: Defined PrivacyContent to provide text for the privacy screen
const PrivacyContent = (
  <div className="space-y-4">
    <section>
      <h3 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest mb-2">Compromisso com sua Privacidade</h3>
      <p className="text-sm leading-relaxed">O app <strong>Nossa Loto</strong> prioriza sua privacidade. Não coletamos dados pessoais como nome, e-mail ou telefone. Todas as suas apostas salvas e configurações de tema permanecem exclusivamente no seu dispositivo (Local Storage).</p>
    </section>
    
    <section>
      <h3 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest mb-2">Firebase & Analytics</h3>
      <p className="text-sm leading-relaxed">Utilizamos tecnologias do Google Firebase para monitorar a estabilidade do sistema e entender tendências de uso de forma anônima. Isso nos ajuda a saber quais loterias são mais populares para melhorar o serviço.</p>
    </section>
    
    <section>
      <h3 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest mb-2">Publicidade e Cookies</h3>
      <p className="text-sm leading-relaxed">Exibimos anúncios via Google AdMob para manter o app gratuito. O Google pode utilizar identificadores de publicidade anônimos para exibir anúncios que sejam do seu interesse.</p>
    </section>
  </div>
);

// Fix: Defined TermsContent to provide text for the terms screen
const TermsContent = (
  <div className="space-y-4">
    <section>
      <h3 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest mb-2">1. Natureza do Serviço</h3>
      <p className="text-sm leading-relaxed">O <strong>Nossa Loto</strong> é um aplicativo independente de auxílio ao apostador. Não possuímos vínculo oficial com a Caixa Econômica Federal. Não realizamos jogos em nome do usuário nem recebemos pagamentos de apostas.</p>
    </section>
    
    <section>
      <h3 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest mb-2">2. Isenção de Responsabilidade</h3>
      <p className="text-sm leading-relaxed">Os palpites gerados por algoritmos ou pela Inteligência Artificial (GuruAI) são meramente sugestivos e baseados em probabilidades estatísticas ou lógica computacional. Não garantimos vitória em nenhum sorteio.</p>
    </section>
    
    <section>
      <h3 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest mb-2">3. Jogo Responsável</h3>
      <p className="text-sm leading-relaxed">Loterias devem ser encaradas como entretenimento. Jogue com responsabilidade e apenas o que puder perder. Se precisar de ajuda, procure órgãos de apoio ao jogo responsável.</p>
    </section>
  </div>
);

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('results');
  const [config, setConfig] = useState<RemoteConfig | null>(null);
  const [results, setResults] = useState<Record<string, LotteryResult>>({});
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLottery, setSelectedLottery] = useState<LotteryType | null>(null);
  const [currentContestDetail, setCurrentContestDetail] = useState<LotteryResult | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Memoizados para UI
  const jackpotTotal = useMemo(() => {
    return Object.values(results).reduce((acc, res) => acc + (res.valorEstimadoProximoConcurso || 0), 0);
  }, [results]);

  const heroLottery = useMemo(() => {
    const sorted = Object.entries(results).sort((a, b) => b[1].valorEstimadoProximoConcurso - a[1].valorEstimadoProximoConcurso);
    return sorted.length > 0 ? (sorted[0][0] as LotteryType) : null;
  }, [results]);

  const applyTheme = useCallback((mode: ThemeMode) => {
    const root = window.document.documentElement;
    const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await firebaseService.init();
        const remoteConfig = await firebaseService.fetchRemoteConfig();
        setConfig(remoteConfig);
        if (remoteConfig.ads_enabled) {
          adService.loadInterstitial();
        }
        const initialResults = await lotteryService.getAllLatest();
        setResults(initialResults);
        const savedPrefs = localStorage.getItem('nossaloto_prefs');
        if (savedPrefs) {
          const { theme } = JSON.parse(savedPrefs);
          applyTheme(theme);
        } else {
          applyTheme('system');
        }
      } catch (err) {
        firebaseService.logError(err, 'Falha crítica no boot');
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const savedPrefs = localStorage.getItem('nossaloto_prefs');
      const theme = savedPrefs ? JSON.parse(savedPrefs).theme : 'system';
      if (theme === 'system') applyTheme('system');
    };
    mediaQuery.addEventListener('change', handleChange);
    window.addEventListener('focus', checkForNewContests);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('focus', checkForNewContests);
    };
  }, [applyTheme]);

  const checkForNewContests = async () => {
    try {
      const latest = await lotteryService.getAllLatest();
      setResults(latest);
    } catch (e) {
      console.warn("Silent check failed", e);
    }
  };

  const refreshResults = async () => {
    setIsRefreshing(true);
    firebaseService.logEvent('refresh_results_manual');
    try {
      const updatedResults = await lotteryService.getAllLatest();
      setResults(updatedResults);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLotterySelect = (type: LotteryType) => {
    firebaseService.logEvent('lottery_card_click', { type });
    setSelectedLottery(type);
    setCurrentContestDetail(results[type]);
    setAiInsight(null);
    setAiLoading(false);
  };

  const navigateContest = async (direction: 'prev' | 'next') => {
    if (!selectedLottery || !currentContestDetail || modalLoading) return;
    const currentNumber = currentContestDetail.numero;
    const targetNumber = direction === 'prev' ? currentNumber - 1 : currentNumber + 1;
    if (direction === 'next' && targetNumber > results[selectedLottery].numero) return;
    if (targetNumber < 1) return;
    setModalLoading(true);
    setAiInsight(null);
    firebaseService.logEvent('contest_navigation', { type: selectedLottery, direction, target: targetNumber });
    try {
      const result = await lotteryService.getContestResult(selectedLottery, targetNumber);
      setCurrentContestDetail(result);
    } catch (err) {
      alert("Não foi possível carregar este concurso.");
    } finally {
      setModalLoading(false);
    }
  };

  const generateInsight = async () => {
    if (!selectedLottery || !currentContestDetail) return;
    setAiLoading(true);
    setAiInsight(null);
    firebaseService.logEvent('ai_insight_request_modal', { type: selectedLottery, contest: currentContestDetail.numero });
    try {
      const insight = await geminiService.getLotteryInsights(
        LOTTERY_CONFIGS[selectedLottery].name, 
        currentContestDetail
      );
      setAiInsight(insight);
    } catch (err) {
      setAiInsight("Erro ao consultar a IA.");
    } finally {
      setAiLoading(false);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  }, []);

  if (config?.maintenance_enabled) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-8 text-center text-white z-50">
        <div>
          <div className="mb-6 bg-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black mb-4 uppercase tracking-tighter">Manutenção</h1>
          <p className="text-slate-400 font-medium leading-relaxed">{config.maintenance_message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen pb-20 relative flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors text-slate-900 dark:text-slate-100">
      {currentScreen !== 'privacy' && currentScreen !== 'terms' && (
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z" />
              </svg>
            </div>
            <h1 className="font-black text-slate-800 dark:text-slate-100 tracking-tighter uppercase text-sm">Nossa Loto</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={refreshResults} disabled={isRefreshing} className={`p-2 rounded-full text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-700 transition-all active:scale-90 ${isRefreshing ? 'animate-spin' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </header>
      )}

      <main className="flex-1 overflow-y-auto no-scrollbar">
        {currentScreen === 'results' ? (
          <div className="p-4 space-y-2">
            {/* Boas-vindas e Sumário */}
            {!loading && (
              <div className="px-2 py-4 animate-in fade-in duration-700">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">{greeting}, Apostador!</h2>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
                    {formatCurrency(jackpotTotal)}
                  </h3>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Acumulados</span>
                </div>
              </div>
            )}

            {config?.global_message_enabled && (
              <div className="bg-indigo-600 rounded-2xl p-4 mb-6 flex items-center gap-4 shadow-xl shadow-indigo-500/20 text-white animate-in slide-in-from-top-4 duration-500">
                <div className="bg-white/20 p-2 rounded-xl text-xl">📢</div>
                <p className="text-[11px] font-bold leading-relaxed">{config.global_message_text}</p>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin shadow-inner"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Consultando a sorte...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Hero Card */}
                {heroLottery && results[heroLottery] && (
                  <LotteryCard 
                    type={heroLottery} 
                    result={results[heroLottery]} 
                    onSelect={handleLotterySelect} 
                    isHero={true}
                  />
                )}

                {/* Outros Cards */}
                {Object.entries(LOTTERY_CONFIGS).map(([key, _]) => {
                  const type = key as LotteryType;
                  const result = results[type];
                  if (!result || type === heroLottery) return null;
                  return <LotteryCard key={type} type={type} result={result} onSelect={handleLotterySelect} />;
                })}
              </div>
            )}
            <AdBanner enabled={!!config?.ads_enabled} />
          </div>
        ) : currentScreen === 'generator' ? (
          <GameGenerator />
        ) : currentScreen === 'ai' ? (
          <GuruAI />
        ) : currentScreen === 'mygames' ? (
          <SavedGames results={results} />
        ) : currentScreen === 'settings' ? (
          <Settings 
            config={config} 
            onThemeChange={applyTheme} 
            onOpenPrivacy={() => setCurrentScreen('privacy')}
            onOpenTerms={() => setCurrentScreen('terms')}
          />
        ) : currentScreen === 'privacy' ? (
          <LegalScreen title="Privacidade" content={PrivacyContent} onBack={() => setCurrentScreen('settings')} />
        ) : (
          <LegalScreen title="Termos de Uso" content={TermsContent} onBack={() => setCurrentScreen('settings')} />
        )}
      </main>

      {/* Navegação e Modais permanecem com a mesma lógica mas com refinamentos visuais menores se necessário */}
      {currentScreen !== 'privacy' && currentScreen !== 'terms' && (
        <>
          {selectedLottery && currentContestDetail && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md p-4 flex items-end sm:items-center justify-center">
              <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-8 duration-500 overflow-hidden flex flex-col max-h-[90vh]">
                <div className={`p-6 text-white relative ${LOTTERY_CONFIGS[selectedLottery].color}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-black text-2xl uppercase tracking-tighter">{LOTTERY_CONFIGS[selectedLottery].name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm font-bold">
                        <button onClick={() => navigateContest('prev')} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg disabled:opacity-30">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <span>Concurso {currentContestDetail.numero}</span>
                        <button onClick={() => navigateContest('next')} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg disabled:opacity-30">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <button onClick={() => { setSelectedLottery(null); setCurrentContestDetail(null); }} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {modalLoading ? (
                  <div className="flex-1 flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Números Sorteados</p>
                        {currentContestDetail.acumulado && <span className="text-[9px] font-black uppercase text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded">Acumulou</span>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentContestDetail.listaDezenas.map((dz, idx) => (
                          <div key={idx} className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white shadow-lg ${LOTTERY_CONFIGS[selectedLottery].color}`}>
                            {dz}
                          </div>
                        ))}
                        {(currentContestDetail.trevosSorteados || currentContestDetail.listaTrevo) && (
                          (currentContestDetail.trevosSorteados || currentContestDetail.listaTrevo || []).map((tr: any, idx: number) => {
                            const digits = String(tr).replace(/\D/g, '');
                            const num = digits ? Number(digits) : NaN;
                            if (!Number.isFinite(num)) return null;
                            return (
                              <div key={`modal-tr-${idx}`} className="w-10 h-10 rounded-full bg-yellow-400 text-indigo-950 flex items-center justify-center font-black shadow-lg border-b-2 border-indigo-900/20">
                                {String(num).padStart(2, '0')}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {currentContestDetail.listaDezenasSegundoSorteio && (
                      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Segundo Sorteio</p>
                        <div className="flex flex-wrap gap-2">
                          {currentContestDetail.listaDezenasSegundoSorteio.map((dz, idx) => (
                            <div key={idx} className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-white shadow-lg opacity-80 ${LOTTERY_CONFIGS[selectedLottery].color}`}>
                              {dz}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {((currentContestDetail.nomeTimeCoracaoMesSorte || currentContestDetail.nomeTimeCoracao || currentContestDetail.nomeMesSorte || "").trim().length > 0) && (
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <p className="text-[9px] text-slate-400 font-black uppercase mb-1 tracking-widest">Sorteio Especial</p>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase">
                          {(currentContestDetail.nomeTimeCoracaoMesSorte || currentContestDetail.nomeTimeCoracao || currentContestDetail.nomeMesSorte || "").trim()}
                        </p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Premiação detalhada</p>
                      <div className="space-y-2">
                        {currentContestDetail.listaRateioPremio?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-700 dark:text-slate-200">{item.descricaoFaixa}</span>
                              <span className="text-[9px] text-slate-400 font-bold uppercase">{item.numeroDeGanhadores} {item.numeroDeGanhadores === 1 ? 'ganhador' : 'ganhadores'}</span>
                            </div>
                            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(item.valorPremio)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button 
                        onClick={generateInsight} 
                        disabled={aiLoading}
                        className="w-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"
                      >
                        {aiLoading ? <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div> : "✨ Gerar Insight do GuruAI"}
                      </button>
                      {aiInsight && (
                        <div className="bg-indigo-600 text-white p-5 rounded-2xl shadow-lg animate-in fade-in zoom-in duration-300">
                           <p className="text-xs font-medium leading-relaxed italic">"{aiInsight}"</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Local Sorteio</p>
                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{currentContestDetail.localSorteio}</p>
                        <p className="text-[8px] text-slate-400">{currentContestDetail.nomeMunicipioUFSorteio}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Arrecadação</p>
                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{formatCurrency(currentContestDetail.valorArrecadado)}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                  <button onClick={() => { setSelectedLottery(null); setCurrentContestDetail(null); setCurrentScreen('generator'); }} className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-4 rounded-2xl shadow-xl text-xs uppercase tracking-widest">Gerar Jogo</button>
                  <button onClick={() => { setSelectedLottery(null); setCurrentContestDetail(null); }} className="px-6 bg-white dark:bg-slate-700 text-slate-400 font-bold py-4 rounded-2xl border border-slate-200 text-xs uppercase tracking-widest">Fechar</button>
                </div>
              </div>
            </div>
          )}

          <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700 px-1 py-3 flex justify-around items-center z-40 max-w-md mx-auto">
            <button onClick={() => setCurrentScreen('results')} className={`flex flex-col items-center gap-1 flex-1 transition-colors ${currentScreen === 'results' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
              <div className={`p-1 rounded-lg transition-all ${currentScreen === 'results' ? 'bg-indigo-600/10' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
              </div>
              <span className="text-[8px] font-black uppercase tracking-tighter">Resultados</span>
            </button>
            <button onClick={() => setCurrentScreen('generator')} className={`flex flex-col items-center gap-1 flex-1 transition-colors ${currentScreen === 'generator' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
              <div className={`p-1 rounded-lg transition-all ${currentScreen === 'generator' ? 'bg-indigo-600/10' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" /></svg>
              </div>
              <span className="text-[8px] font-black uppercase tracking-tighter">Gerador</span>
            </button>
            <button onClick={() => setCurrentScreen('mygames')} className={`flex flex-col items-center gap-1 flex-1 transition-colors ${currentScreen === 'mygames' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
              <div className={`p-1 rounded-lg transition-all ${currentScreen === 'mygames' ? 'bg-indigo-600/10' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" /></svg>
              </div>
              <span className="text-[8px] font-black uppercase tracking-tighter">Meus Jogos</span>
            </button>
            <button onClick={() => setCurrentScreen('ai')} className={`flex flex-col items-center gap-1 flex-1 transition-colors ${currentScreen === 'ai' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
              <div className="relative p-1 rounded-lg transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-ping"></span>
              </div>
              <span className="text-[8px] font-black uppercase tracking-tighter">GuruAI</span>
            </button>
            <button onClick={() => setCurrentScreen('settings')} className={`flex flex-col items-center gap-1 flex-1 transition-colors ${currentScreen === 'settings' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
              <div className={`p-1 rounded-lg transition-all ${currentScreen === 'settings' ? 'bg-indigo-600/10' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest">Ajustes</span>
            </button>
          </nav>
        </>
      )}
    </div>
  );
};

export default App;
