import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const ChallengeCard: React.FC = () => {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-6 shadow-lg shadow-black/20 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-base font-bold text-zinc-100 uppercase tracking-widest">The Challenge</h3>
        </div>
        
        <p className="text-sm text-zinc-300 mb-6 pl-3 border-l-2 border-red-500/50 italic leading-relaxed">
          "Unmanned Ground Vehicles (UGVs) need robust scene understanding for safe off-road navigation."
        </p>
      </div>

      <div className="mt-2 flex items-center gap-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 p-4 rounded-xl border border-emerald-500/30">
        <div className="p-2.5 bg-emerald-500/20 rounded-full border border-emerald-500/40 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-0.5">Our Solution</h4>
          <p className="text-xs text-zinc-300">Synthetic data from the <strong className="text-white">Falcon digital twin platform</strong>.</p>
        </div>
      </div>
    </div>
  );
};
