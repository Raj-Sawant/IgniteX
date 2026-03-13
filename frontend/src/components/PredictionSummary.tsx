import React from 'react';
import { Activity, ShieldCheck, Target } from 'lucide-react';

export const PredictionSummary: React.FC = () => {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-5 shadow-lg shadow-black/20">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-1.5 bg-zinc-800 rounded-lg">
          <Activity className="w-4 h-4 text-blue-400" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-100">Prediction Quality</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors"></div>
          <Target className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-mono font-bold text-zinc-100">92.4%</span>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Mean IoU</span>
        </div>
        
        <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
          <ShieldCheck className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-mono font-bold text-zinc-100">98.1%</span>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Pixel Acc</span>
        </div>
      </div>
    </div>
  );
};
