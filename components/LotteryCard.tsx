
import React from 'react';
import { LotteryResult, LotteryType } from '../types';
import { LOTTERY_CONFIGS } from '../constants';
import { gameService } from '../services/gameService';

interface LotteryCardProps {
  type: LotteryType;
  result: LotteryResult;
  onSelect: (type: LotteryType) => void;
  isHero?: boolean;
}

export const LotteryCard: React.FC<LotteryCardProps> = ({ type, result, onSelect, isHero = false }) => {
  const config = LOTTERY_CONFIGS[type];
  
  const rawTrevos = (result.trevosSorteados || result.listaTrevo || []).filter((t: any) => t !== null && t !== undefined);
  const trevoNumbers: number[] = rawTrevos
    .map((t: any) => {
      const digits = String(t).replace(/\D/g, '');
      const num = digits ? parseInt(digits, 10) : NaN;
      return Number.isFinite(num) ? num : null;
    })
    .filter((n: any): n is number => n !== null);
  const _rawSpecialText = result.nomeTimeCoracaoMesSorte || result.nomeTimeCoracao || result.nomeMesSorte || "";
  const specialText = String(_rawSpecialText).replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
  const showSpecialText = /[\p{L}\p{N}]/u.test(specialText);
  
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    gameService.shareResult(result, type);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  return (
    <div 
      onClick={() => onSelect(type)}
      className={`relative overflow-hidden transition-all duration-300 active:scale-[0.98] cursor-pointer mb-6 group
        ${isHero 
          ? 'bg-slate-900 dark:bg-indigo-950 text-white rounded-[2.5rem] shadow-2xl p-6 ring-2 ring-indigo-500/20' 
          : 'bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 p-5'
        }`}
    >
      {/* Background Decor (Apenas Hero) */}
      {isHero && (
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 blur-[60px] rounded-full"></div>
      )}

      {/* Header do Card */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <div className={`${config.color} w-3 h-8 rounded-full shadow-lg`}></div>
          <div>
            <h3 className={`font-black uppercase tracking-tighter ${isHero ? 'text-xl' : 'text-lg text-slate-800 dark:text-slate-100'}`}>
              {config.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Concurso {result.numero}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{result.dataApuracao}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleShare}
          className={`p-2 rounded-xl transition-all ${isHero ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isHero ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 100-2.684m0 2.684l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>

      {/* Números Sorteados */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {result.listaDezenas.map((dz, idx) => (
          <div 
            key={`${type}-dz-${idx}`} 
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shadow-lg border-b-2 border-black/10 transition-transform group-hover:-translate-y-1
              ${isHero ? 'bg-white text-slate-900' : `${config.color} text-white`}`}
          >
            {dz}
          </div>
        ))}
        {trevoNumbers.map((tr, idx) => (
          <div
            key={`${type}-tr-${idx}`}
            className="w-9 h-9 rounded-full bg-yellow-400 text-indigo-950 flex items-center justify-center text-xs font-black shadow-lg border-b-2 border-indigo-900/20"
          >
            {String(tr).padStart(2, '0')}
          </div>
        ))}
        {showSpecialText && (
          <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-tight shadow-sm
            ${isHero ? 'bg-indigo-400/20 text-indigo-200' : 'bg-slate-50 dark:bg-slate-900 text-slate-500'}`}>
            {specialText}
          </div>
        )}
      </div>

      {/* Rodapé - Próximo Prêmio */}
      <div className={`pt-4 border-t ${isHero ? 'border-white/10' : 'border-slate-50 dark:border-slate-700/50'} flex justify-between items-end`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isHero ? 'text-indigo-300' : 'text-slate-400'}`}>
              Próximo Estimado
            </p>
            {result.acumulado && (
              <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            )}
          </div>
          <p className={`text-2xl font-black tracking-tighter ${isHero ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
            {formatCurrency(result.valorEstimadoProximoConcurso)}
          </p>
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${isHero ? 'text-indigo-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
          Detalhes
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};
