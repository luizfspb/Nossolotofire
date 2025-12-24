
import React, { useEffect } from 'react';
import { ADMOB_CONFIG } from '../types';
import { firebaseService } from '../services/firebaseService';

interface AdBannerProps {
  enabled: boolean;
  type?: 'banner' | 'native';
}

export const AdBanner: React.FC<AdBannerProps> = ({ enabled, type = 'banner' }) => {
  const adUnitId = type === 'banner' ? ADMOB_CONFIG.banner : ADMOB_CONFIG.native;

  useEffect(() => {
    if (enabled) {
      firebaseService.logEvent('ad_request', { type, ad_unit_id: adUnitId });
    }
  }, [enabled, type, adUnitId]);

  if (!enabled) return null;

  return (
    <div className="w-full bg-slate-100 dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 p-2 flex flex-col items-center justify-center my-4">
      <div className="flex justify-between w-full max-w-[320px] mb-1 px-1">
        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Publicidade</span>
        <span className="text-[8px] text-slate-300 font-medium">ID: {adUnitId.split('/')[1]}</span>
      </div>
      
      {/* Container que o SDK AdMob usaria para renderizar o banner */}
      <div className="bg-slate-200 dark:bg-slate-700 w-full max-w-[320px] h-[50px] sm:h-[90px] flex items-center justify-center rounded border border-slate-300 dark:border-slate-600 transition-all">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">Google AdMob {type === 'native' ? 'Native' : 'Banner'}</p>
          <p className="text-slate-400 text-[8px] italic">com.companyname.appjogosloteria</p>
        </div>
      </div>
    </div>
  );
};
