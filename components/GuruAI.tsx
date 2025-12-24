
import React, { useState, useEffect, useRef } from 'react';
import { LotteryType, AISuggestion } from '../types';
import { LOTTERY_CONFIGS } from '../constants';
import { aiService, GuruUsage } from '../services/aiService';
import { gameService } from '../services/gameService';
import { firebaseService } from '../services/firebaseService';
import { adService } from '../services/adService';
import { TrevoIcon } from '../App';

export const GuruAI: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [guruText, setGuruText] = useState("");
  const [activeLottery, setActiveLottery] = useState<LotteryType | null>(null);
  const [usage, setUsage] = useState<GuruUsage>(aiService.getUsage());
  const [showAutoSaveToast, setShowAutoSaveToast] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    firebaseService.logEvent('ai_guru_screen_open');
  }, []);

  const handleGenerate = async (customPrompt?: string) => {
    if (usage.remaining <= 0) return;
    
    const textToSubmit = customPrompt || prompt;
    if (!textToSubmit.trim() || loading) return;
    
    setLoading(true);
    setSuggestions([]);
    setGuruText("");
    setPrompt(""); 
    setShowAutoSaveToast(false);
    
    try {
      const result = await aiService.generateWithGuruAI(textToSubmit);
      
      if (result.error === "LIMIT_REACHED") {
        setGuruText("Sua energia mística esgotou por agora...");
      } else {
        setSuggestions(result.suggestions);
        setGuruText(result.guruMessage);
        
        if (result.detectedLottery) {
          setActiveLottery(result.detectedLottery);
          
          // Salvamento Automático
          result.suggestions.forEach(sug => {
            gameService.saveGame({
              lottery: result.detectedLottery!,
              numbers: sug.numbers,
              extras: sug.extras,
              price: sug.price,
              mode: 'ai'
            });
          });
          
          setShowAutoSaveToast(true);
          setTimeout(() => setShowAutoSaveToast(false), 4000);
        }
        
        setUsage(aiService.getUsage());
      }
      
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (e) {
      setGuruText("O Guru está em profunda meditação... Tente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockMore = async () => {
    setLoading(true);
    const success = await adService.showRewardedAd();
    if (success) {
      // Refresh usage from server (adService already granted +1 credit server-side)
      const updated = await aiService.loadUsageFromServer();
      setUsage(updated);
      setGuruText("Energia restaurada! Você ganhou +1 consulta.");
    }
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const quickPrompts = [
    { text: "Me dê números para a Mega hoje", icon: "💎" },
    { text: "Quais dezenas estão 'quentes' na Lotofácil?", icon: "🔥" },
    { text: "Palpite baseado no meu sonho com ouro", icon: "✨" }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#020617] transition-colors overflow-hidden">
      {/* Toast de Salvamento */}
      {showAutoSaveToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300 px-6 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl flex items-center gap-3">
          <span className="text-lg">✨</span>
          Guru salvou estes palpites nos Meus Jogos
        </div>
      )}

      {/* Header - Energia do Guru */}
      <div className="px-6 py-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-lg">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Conexão Mística</h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧙‍♂️</span>
              <h1 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">Guru Nossa Loto</h1>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Energia: {usage.remaining}/10</span>
            <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
              <div 
                className={`h-full transition-all duration-1000 ${usage.remaining > 3 ? 'bg-indigo-500' : 'bg-red-500 animate-pulse'}`}
                style={{ width: `${(usage.remaining / 10) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8 no-scrollbar">
        {/* Empty State / Welcome */}
        {!guruText && suggestions.length === 0 && (
          <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in fade-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"></div>
              <span className="text-7xl relative">🔮</span>
            </div>
            <div className="space-y-2 px-6">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Como posso te ajudar hoje?</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed uppercase">
                Pergunte sobre estatísticas, peça palpites baseados em sonhos ou deixe que eu escolha o seu próximo prêmio.
              </p>
            </div>
          </div>
        )}

        {/* Mensagem do Guru */}
        {guruText && (
          <div className="flex items-start gap-3 animate-in fade-in slide-in-from-left-6 duration-500">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 shrink-0">
              <span className="text-lg">🧙‍♂️</span>
            </div>
            <div className="bg-white dark:bg-slate-800 text-slate-700 dark:text-indigo-100 rounded-3xl rounded-tl-none p-5 shadow-xl border border-indigo-100 dark:border-indigo-500/20 max-w-[85%] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-2 opacity-10">
                 <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C20.1216 16 21.017 16.8954 21.017 18V21C21.017 22.1046 20.1216 23 19.017 23H16.017C14.9124 23 14.017 22.1046 14.017 21Z"/><path d="M3 21L3 18C3 16.8954 3.89543 16 5 16H8C9.10457 16 10 16.8954 10 18V21C10 22.1046 9.10457 23 8 23H5C3.89543 23 3 22.1046 3 21Z"/><path d="M12 2L12 12"/></svg>
               </div>
               <p className="text-xs font-bold leading-relaxed italic">"{guruText}"</p>
            </div>
          </div>
        )}

        {/* Sugestões do Guru */}
        {suggestions.map((sug, idx) => (
          <div 
            key={idx} 
            className="group bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 shadow-2xl border border-slate-100 dark:border-slate-700/50 animate-in slide-in-from-bottom-8 duration-700 overflow-hidden relative"
            style={{ animationDelay: `${idx * 150}ms` }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16"></div>
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black text-white ${activeLottery ? LOTTERY_CONFIGS[activeLottery].color : 'bg-slate-500'} shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform`}>
                  #{idx + 1}
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Palpite Consagrado</h4>
                  <p className="text-[9px] font-bold text-indigo-500 uppercase">{activeLottery ? LOTTERY_CONFIGS[activeLottery].name : ''}</p>
                </div>
              </div>
              <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                ⚡ Salvo
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 mb-6">
              {sug.numbers.map(n => (
                <div key={n} className={`${activeLottery ? LOTTERY_CONFIGS[activeLottery].color : 'bg-slate-500'} text-white w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shadow-xl border-b-4 border-black/20 transform hover:-translate-y-1 transition-transform`}>
                  {n.toString().padStart(2, '0')}
                </div>
              ))}
              {sug.extras?.trevos?.map((t: number) => (
                <TrevoIcon key={t} number={t} size="sm" />
              ))}
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/80 p-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-700/50">
              <p className="text-[9px] text-slate-400 font-black uppercase mb-2 tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Visão do Guru
              </p>
              <p className="text-[11px] text-slate-600 dark:text-indigo-200/70 leading-relaxed font-medium italic">"{sug.explanation}"</p>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
               <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase">Valor estimado: {formatCurrency(sug.price)}</span>
               <div className="flex -space-x-2">
                 <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-indigo-500 flex items-center justify-center text-[8px] text-white">✨</div>
                 <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-purple-500 flex items-center justify-center text-[8px] text-white">🍀</div>
               </div>
            </div>
          </div>
        ))}

        {/* Limit Reached UI */}
        {usage.remaining <= 0 && !loading && (
          <div className="bg-slate-900 dark:bg-indigo-950 rounded-[3rem] p-10 text-center text-white shadow-2xl animate-in zoom-in duration-500 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent"></div>
            <div className="relative z-10">
              <span className="text-6xl mb-6 block drop-shadow-lg">🪫</span>
              <h3 className="text-lg font-black mb-3 uppercase tracking-tighter">Energia Esgotada</h3>
              <p className="text-indigo-200 text-[10px] mb-8 font-medium leading-relaxed uppercase tracking-wider px-4">
                O Guru precisa descansar. Assista a um vídeo para restaurar sua conexão agora!
              </p>
              <button 
                onClick={handleUnlockMore}
                className="w-full bg-white text-indigo-900 font-black py-5 rounded-[2rem] shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3"
              >
                <span className="text-lg">📺</span>
                Restaurar Energia
              </button>
            </div>
          </div>
        )}

        <div ref={scrollRef} className="h-10"></div>
      </div>

      {/* Input Area */}
      <div className={`p-4 pb-28 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-opacity ${usage.remaining <= 0 ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex overflow-x-auto gap-3 no-scrollbar mb-5 px-2">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleGenerate(qp.text)}
              className="whitespace-nowrap px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-500 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-2 shrink-0 active:scale-90"
            >
              <span>{qp.icon}</span>
              {qp.text}
            </button>
          ))}
        </div>

        <div className="relative flex items-center px-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            disabled={usage.remaining <= 0}
            placeholder={usage.remaining > 0 ? "Envie sua mensagem ao Guru..." : "Aguardando restauração..."}
            className="w-full bg-slate-100 dark:bg-slate-800/80 border-2 border-transparent focus:border-indigo-500/50 rounded-[2rem] py-5 pl-7 pr-16 text-xs font-bold text-slate-800 dark:text-white transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
          <button 
            onClick={() => handleGenerate()}
            disabled={loading || !prompt.trim() || usage.remaining <= 0}
            className="absolute right-4 w-12 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 active:scale-90 disabled:opacity-20 transition-all"
          >
            {loading ? (
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
