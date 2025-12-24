
import React, { useState, useEffect, useMemo } from 'react';
import { LotteryType, AISuggestion } from '../types';
import { LOTTERY_CONFIGS, LOTTERY_RULES, TEAMS, MONTHS } from '../constants';
import { gameService } from '../services/gameService';
import { firebaseService } from '../services/firebaseService';
import { TrevoIcon } from '../App';

export const GameGenerator: React.FC = () => {
  const lotteries = Object.values(LotteryType);
  const [activeLottery, setActiveLottery] = useState<LotteryType>(LotteryType.MEGA_SENA);
  const [picks, setPicks] = useState(6);
  const [trevos, setTrevos] = useState(2);
  const [quantity, setQuantity] = useState(3);
  const [extra, setExtra] = useState("");
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAutoSaveToast, setShowAutoSaveToast] = useState(false);

  const rule = useMemo(() => LOTTERY_RULES[activeLottery], [activeLottery]);
  const config = useMemo(() => LOTTERY_CONFIGS[activeLottery], [activeLottery]);

  const currentUnitPrice = useMemo(() => {
    return gameService.calculatePrice(activeLottery, picks, rule.hasTrevos ? trevos : undefined);
  }, [activeLottery, picks, trevos, rule.hasTrevos]);

  useEffect(() => {
    setPicks(rule.minPicks);
    setTrevos(rule.minTrevos || 2);
    setExtra("");
    setSuggestions([]);
  }, [activeLottery, rule]);

  const handleGenerate = () => {
    setLoading(true);
    setShowAutoSaveToast(false);
    const newSuggestions: AISuggestion[] = [];

    for (let i = 0; i < quantity; i++) {
      const generated = gameService.generateRandom(activeLottery, picks);
      
      const suggestion = {
        numbers: generated.numbers!,
        extras: generated.extras,
        explanation: "Gerado pelo algoritmo de surpresinha otimizada.",
        price: generated.price || 0
      };
      
      newSuggestions.push(suggestion);
      
      gameService.saveGame({
        lottery: activeLottery,
        numbers: suggestion.numbers,
        extras: suggestion.extras,
        price: suggestion.price,
        mode: 'auto'
      });
    }

    // Simular carregamento para efeito de "sorteio"
    setTimeout(() => {
      setSuggestions(newSuggestions);
      setLoading(false);
      setShowAutoSaveToast(true);
      firebaseService.logEvent('bet_generate_manual', { lottery: activeLottery, picks, quantity });
      setTimeout(() => setShowAutoSaveToast(false), 4000);
      
      // Scroll suave para os resultados
      window.scrollTo({ top: 500, behavior: 'smooth' });
    }, 800);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50 dark:bg-slate-900 pb-32 transition-colors">
      {/* Toast flutuante moderno */}
      {showAutoSaveToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-500 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl flex items-center gap-3">
          <span className="text-base">📥</span>
          Jogos salvos em "Meus Jogos"
        </div>
      )}

      {/* Header da Tela */}
      <div className="px-6 pt-8 pb-4">
        <h2 className="text-sm font-black text-indigo-500 uppercase tracking-[0.3em] mb-1">Fábrica de Sorte</h2>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">Configure seu Jogo</h1>
      </div>

      <div className="px-4 space-y-6">
        {/* Seletor de Loteria Estilizado */}
        <section className="space-y-3">
          <label className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecione a Modalidade</label>
          <div className="flex overflow-x-auto gap-4 no-scrollbar px-2 py-2">
            {lotteries.map(lot => {
              const isActive = activeLottery === lot;
              return (
                <button
                  key={lot}
                  onClick={() => setActiveLottery(lot)}
                  className={`relative flex flex-col items-center justify-center min-w-[120px] p-4 rounded-[2rem] transition-all duration-500 border-2
                    ${isActive 
                      ? `${LOTTERY_CONFIGS[lot].color} border-transparent text-white shadow-xl shadow-indigo-500/20 scale-105` 
                      : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}
                >
                  {isActive && <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center text-[8px] text-indigo-600 shadow-sm animate-bounce">✓</div>}
                  <span className="text-[11px] font-black uppercase tracking-tighter text-center leading-tight">
                    {LOTTERY_CONFIGS[lot].name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Configurações em Grid */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-8">
            
            {/* Pick Selector */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Dezenas</h4>
                  <p className="text-[9px] text-slate-300 dark:text-slate-500 font-bold uppercase">Mín {rule.minPicks} • Máx {rule.maxPicks}</p>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(currentUnitPrice)} / jogo</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-2 rounded-3xl border border-slate-100 dark:border-slate-700">
                <button onClick={() => setPicks(Math.max(rule.minPicks, picks - 1))} className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-xl font-black active:scale-90 transition-transform text-slate-800 dark:text-slate-100">－</button>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">{picks}</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Números</span>
                </div>
                <button onClick={() => setPicks(Math.min(rule.maxPicks, picks + 1))} className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-xl font-black active:scale-90 transition-transform text-slate-800 dark:text-slate-100">＋</button>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-700/50">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantos Jogos Gerar?</h4>
              <div className="grid grid-cols-5 gap-2">
                {[1, 3, 5, 8, 10].map(val => (
                  <button 
                    key={val}
                    onClick={() => setQuantity(val)}
                    className={`h-12 rounded-2xl text-xs font-black transition-all border-2
                      ${quantity === val 
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-lg scale-105' 
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-400'}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Extras (Trevos / Time / Mês) */}
            {(rule.hasTeam || rule.hasMonth || rule.hasTrevos) && (
              <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-700/50">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configurações Extras</h4>
                <div className="grid grid-cols-1 gap-3">
                  {rule.hasTrevos && (
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl">
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight">Trevos (Milionária)</span>
                      <div className="flex items-center gap-4">
                        <button onClick={() => setTrevos(Math.max(rule.minTrevos || 2, trevos - 1))} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center font-black">－</button>
                        <span className="font-black text-sm text-indigo-600">{trevos}</span>
                        <button onClick={() => setTrevos(Math.min(rule.maxTrevos || 6, trevos + 1))} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center font-black">＋</button>
                      </div>
                    </div>
                  )}
                  {(rule.hasTeam || rule.hasMonth) && (
                    <div className="space-y-2">
                      <select 
                        value={extra}
                        onChange={(e) => setExtra(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-xs font-black uppercase tracking-widest appearance-none outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value="">{rule.hasTeam ? "🎲 Time Aleatório" : "🎲 Mês Aleatório"}</option>
                        {(rule.hasTeam ? TEAMS : MONTHS).map(item => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* CTA Final */}
            <div className="pt-4">
              <button 
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full relative overflow-hidden group py-6 rounded-[2rem] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3
                  ${loading ? 'bg-slate-100 dark:bg-slate-700' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}
              >
                {/* Shine effect animation */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                
                {loading ? (
                  <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="text-xl">✨</span>
                    <span className="font-black uppercase tracking-[0.2em] text-xs">Gerar Jogos Agora</span>
                  </>
                )}
              </button>
              <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-4 opacity-50">
                Os jogos gerados serão salvos em sua biblioteca
              </p>
            </div>
          </div>
        </div>

        {/* Galeria de Jogos Gerados (Visual de Bilhete) */}
        {suggestions.length > 0 && (
          <div className="space-y-6 pt-4 animate-in fade-in duration-1000">
            <h3 className="text-center text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-4">Bilhetes Impressos</h3>
            <div className="space-y-6">
              {suggestions.map((sug, idx) => (
                <div key={idx} className="relative bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl overflow-hidden animate-in slide-in-from-bottom-8 duration-700 border border-slate-100 dark:border-slate-700/50" style={{ animationDelay: `${idx * 150}ms` }}>
                  {/* Ticket Header (Perforated Effect) */}
                  <div className={`p-6 text-white ${config.color} relative overflow-hidden`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Sugestão #{idx + 1}</p>
                        <h4 className="text-2xl font-black uppercase tracking-tighter">{config.name}</h4>
                      </div>
                      <div className="bg-white/20 p-2 rounded-2xl text-xl">🍀</div>
                    </div>
                  </div>

                  {/* Picote do bilhete */}
                  <div className="flex justify-between -mt-3 relative z-10 px-6">
                     <div className="w-6 h-6 bg-slate-50 dark:bg-slate-900 rounded-full -ml-9"></div>
                     <div className="flex-1 border-t-2 border-dashed border-slate-100 dark:border-slate-700/50 my-3"></div>
                     <div className="w-6 h-6 bg-slate-50 dark:bg-slate-900 rounded-full -mr-9"></div>
                  </div>

                  {/* Conteúdo do Bilhete */}
                  <div className="p-6 pt-2 space-y-6">
                    {activeLottery === LotteryType.SUPER_SETE && sug.extras?.superSeteColumns ? (
                      <div className="grid grid-cols-7 gap-1">
                        {sug.extras.superSeteColumns.map((col: number[], cIdx: number) => (
                          <div key={cIdx} className="flex flex-col items-center gap-1.5">
                            <span className="text-[8px] font-black text-slate-400 uppercase">C{cIdx+1}</span>
                            <div className="flex flex-col gap-1">
                              {col.map((num, nIdx) => (
                                <div key={nIdx} className={`${config.color} text-white w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shadow-lg border-b-2 border-black/20`}>{num}</div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2.5 justify-center">
                        {sug.numbers.map(n => (
                          <div key={n} className={`${config.color} text-white w-11 h-11 rounded-full flex items-center justify-center text-sm font-black shadow-xl border-b-4 border-black/20 transform hover:-translate-y-1 transition-transform`}>
                            {n.toString().padStart(2, '0')}
                          </div>
                        ))}
                        {sug.extras?.trevos?.map((t: number) => (
                          <TrevoIcon key={`t-${t}`} number={t} size="sm" />
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-700/50">
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Especial Selecionado</p>
                        <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase truncate">
                          {sug.extras?.team || sug.extras?.month || "---"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Custo da Aposta</p>
                        <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(sug.price)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center py-4">
               <button 
                 onClick={() => { setSuggestions([]); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                 className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
               >
                 Limpar resultados e refazer
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
