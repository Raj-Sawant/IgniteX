import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FailureCaseProps {
  id: string;
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Moderate';
  issue: string;
  suggestion: string;
}

export const FailureCase: React.FC<FailureCaseProps> = ({ id, title, description, impact, issue, suggestion }) => {
  const getImpactColor = (level: string) => {
    switch(level) {
      case 'High': return 'text-red-400 bg-red-400/10 border-red-500/30';
      case 'Medium': return 'text-orange-400 bg-orange-400/10 border-orange-500/30';
      default: return 'text-amber-400 bg-amber-400/10 border-amber-500/30';
    }
  };

  return (
    <div className="bg-zinc-950/60 border border-zinc-800/50 rounded-lg p-4 hover:border-zinc-700 transition-colors group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-zinc-500 group-hover:text-red-400 transition-colors" />
          <h4 className="text-sm font-semibold text-zinc-200">{title} <span className="text-zinc-600 font-mono text-[10px] ml-1">#{id}</span></h4>
        </div>
        <span className={`px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold rounded border ${getImpactColor(impact)}`}>
          {impact}
        </span>
      </div>
      
      <p className="text-xs text-zinc-400 mb-4 leading-relaxed">{description}</p>
      
      <div className="space-y-2 text-xs bg-zinc-900/50 p-2.5 rounded-md border border-zinc-800/50">
        <div className="flex gap-2">
          <span className="font-semibold text-zinc-400 w-12 shrink-0">Issue:</span>
          <span className="text-zinc-300">{issue}</span>
        </div>
        <div className="flex gap-2">
          <span className="font-semibold text-zinc-400 w-12 shrink-0">Fix:</span>
          <span className="text-emerald-400/90">{suggestion}</span>
        </div>
      </div>
    </div>
  );
};
