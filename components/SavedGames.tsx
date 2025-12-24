
import React, { useState, useEffect, useMemo } from 'react';
import { SavedGame, LotteryType, LotteryResult } from '../types';
import { LOTTERY_CONFIGS } from '../constants';
import { gameService } from '../services/gameService';
import { firebaseService } from '../services/firebaseService';
// trevo icon replaced by yellow badge for clarity

interface SavedGamesProps {
  results: Record<string, LotteryResult>;
}

export const SavedGames: React.FC<SavedGamesProps> = ({ results }) => {
  const [games, setGames] = useState<SavedGame[]>([]);
  const [activeTab, setActiveTab] = useState<LotteryType | 'ALL'>('ALL');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    loadGames();
    firebaseService.logScreenView('saved_games');
  }, []);

  const loadGames = () => {
    const saved = gameService.getSavedGames();
    setGames(saved);
  };

  const groupedGames = useMemo(() => {
    const groups: Record<string, SavedGame[]> = {};
    games.forEach(g => {
      if (!groups[g.lottery]) groups[g.lottery] = [];
      groups[g.lottery].push(g);
    });
    return groups;
  }, [games]);

  const activeLotteries = useMemo(() => Object.keys(groupedGames) as LotteryType[], [groupedGames]);

  const handleDelete = (id: string) => {
    if (window.confirm("Deseja realmente excluir este jogo?")) {
      gameService.deleteGame(id);
      loadGames();
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm("ATENÇÃO: Deseja apagar todos os seus jogos salvos permanentemente?")) {
      gameService.deleteAllGames();
      loadGames();
      setActiveTab('ALL');
    }
  };

  const checkHits = (game: SavedGame) => {
    const result = results[game.lottery];
    if (!result) return { hits: 0, total: 0, matching: [] as number[], extraHit: false };

    let hits = 0;
    const matching: number[] = [];
    const drawNumbers = result.listaDezenas.map(Number);
    
    if (game.lottery === LotteryType.SUPER_SETE) {
      if (game.extras?.superSeteColumns) {
        game.extras.superSeteColumns.forEach((col, i) => {
          const drawInCol = Number(result.listaDezenas[i]);
          if (col.includes(drawInCol)) {
            hits++;
            matching.push(drawInCol); 
          }
        });
      }
      return { hits, total: 7, matching, extraHit: false };
    }

    game.numbers.forEach(n => {
      if (drawNumbers.includes(n)) {
        hits++;
        matching.push(n);
      }
    });

    let extraHit = false;
    if (game.lottery === LotteryType.MAIS_MILIONARIA) {
      const drawTrevos = (result.trevosSorteados || result.listaTrevo || [])
        .map((t: any) => {
          const digits = String(t).replace(/\D/g, '');
          return digits ? Number(digits) : NaN;
        })
        .filter((n: number) => Number.isFinite(n));
      const trevoHits = game.extras?.trevos?.filter((t: number) => drawTrevos.includes(t)).length || 0;
      return { hits, total: 6, matching, trevoHits, extraHit: trevoHits > 0 };
    }

    if (game.lottery === LotteryType.TIMEMANIA) {
      extraHit = game.extras?.team?.toLowerCase() === result.nomeTimeCoracaoMesSorte?.toLowerCase();
    }
    if (game.lottery === LotteryType.DIA_DE_SORTE) {
      extraHit = game.extras?.month?.toLowerCase() === result.nomeTimeCoracaoMesSorte?.toLowerCase();
    }

    return { hits, total: drawNumbers.length, matching, extraHit };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const displayedGames = activeTab === 'ALL' ? games : groupedGames[activeTab] || [];

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 pb-24 transition-colors">
      <div className="bg-indigo-600 dark:bg-indigo-950 text-white p-6 rounded-b-[2.5rem] shadow-xl">
        <h2 className="text-2xl font-black flex items-center gap-3">
          <span className="text-3xl">📂</span> Meus Jogos
        </h2>
        <p className="text-indigo-100 text-xs font-medium opacity-80 mt-1">
          {games.length} {games.length === 1 ? 'palpite registrado' : 'palpites registrados'} • Comparando com o último concurso
        </p>
      </div>

      <div className="flex overflow-x-auto gap-2 px-4 py-4 no-scrollbar items-center">
        <button 
          onClick={() => setActiveTab('ALL')} 
          className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'ALL' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' : 'bg-white text-slate-400 dark:bg-slate-800 border border-slate-100 dark:border-slate-700'}`}
        >
          Todos
        </button>
        {activeLotteries.map(lot => (
          <button 
            key={lot} 
            onClick={() => setActiveTab(lot)} 
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === lot ? `${LOTTERY_CONFIGS[lot].color} text-white shadow-md` : 'bg-white text-slate-400 dark:bg-slate-800 border border-slate-100 dark:border-slate-700'}`}
          >
            <span className="w-2 h-2 rounded-full bg-white/40"></span>
            {LOTTERY_CONFIGS[lot].name}
          </button>
        ))}
      </div>

          {games.length > 0 && (
            <div className="px-4 mb-2">
              {!selectionMode ? (
                <button
                  onClick={() => setSelectionMode(true)}
                  className={`w-full py-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all`}
                >
                  Excluir jogos
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const allIds = games.map(g => g.id);
                      const allSelected = allIds.length === selectedIds.length;
                      setSelectedIds(allSelected ? [] : allIds);
                    }}
                    className="flex-1 py-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm"
                  >
                    {selectedIds.length === games.length ? 'Desmarcar todos' : 'Selecionar todos'}
                  </button>
                  <button
                    onClick={async () => {
                      if (selectedIds.length === 0) return;
                      if (!confirm(`Deseja excluir ${selectedIds.length} jogo(s) selecionado(s)?`)) return;
                      for (const id of selectedIds) {
                        try { await gameService.deleteGame(id); } catch (e) { console.error(e); }
                      }
                      setSelectedIds([]);
                      setSelectionMode(false);
                      loadGames();
                    }}
                    disabled={selectedIds.length === 0}
                    className={`flex-1 py-3 ${selectedIds.length === 0 ? 'bg-slate-200 text-slate-400' : 'bg-red-500 text-white'} rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm`}
                  >
                    Excluir selecionados
                  </button>
                  <button
                    onClick={() => { setSelectionMode(false); setSelectedIds([]); }}
                    className="py-3 px-3 bg-transparent text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )}

      <div className="p-4 space-y-4">
        {displayedGames.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-center px-8 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-3xl opacity-50">
              🗃️
            </div>
            <h3 className="text-slate-800 dark:text-slate-200 font-black uppercase text-xs tracking-widest mb-2">Nenhum jogo salvo</h3>
            <p className="text-slate-400 text-[10px] font-medium leading-relaxed uppercase">
              {activeTab === 'ALL' 
                ? "Gere palpites no Gerador ou no GuruAI para vê-los aqui." 
                : `Você não possui jogos salvos da ${LOTTERY_CONFIGS[activeTab as LotteryType]?.name}.`}
            </p>
          </div>
        ) : (
          displayedGames.map((game) => {
            const analysis = checkHits(game);
            const lotteryConfig = LOTTERY_CONFIGS[game.lottery];
            return (
              <div key={game.id} className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4 overflow-hidden relative group">
                  {selectionMode && (
                    <button
                      onClick={() => toggleSelect(game.id)}
                      className={`absolute top-4 left-4 w-6 h-6 rounded-full flex items-center justify-center border ${selectedIds.includes(game.id) ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-500'}`}
                    >
                      {selectedIds.includes(game.id) ? '✓' : ''}
                    </button>
                  )}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className={`${lotteryConfig.color} px-2 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-widest shadow-sm`}>{lotteryConfig.name}</div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{game.mode === 'ai' ? '🤖 Guru' : game.mode === 'auto' ? '🎲 Surpresinha' : '✍️ Manual'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => gameService.shareGame(game)} className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 100-2.684m0 2.684l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {game.numbers.map(n => (
                    <div key={n} className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shadow-md border-b-2 transition-all ${analysis.matching.includes(n) ? 'bg-emerald-500 text-white border-emerald-700' : `${lotteryConfig.color} text-white border-black/20 opacity-50`}`}>{n.toString().padStart(2, '0')}</div>
                  ))}
                  {game.extras?.trevos?.map((t: number) => (
                    <div key={`saved-trevo-${t}`} className="w-9 h-9 rounded-full bg-yellow-400 text-indigo-950 flex items-center justify-center text-xs font-black shadow-lg border-b-2 border-indigo-900/20">{String(t).padStart(2, '0')}</div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-slate-700/50">
                  <div className="flex flex-col">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Aposta Estimada</p>
                    <p className="text-sm font-black text-slate-900 dark:text-slate-100">{formatCurrency(game.price)}</p>
                  </div>
                  {analysis.hits > 0 && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">
                      <p className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{analysis.hits} acertos</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
