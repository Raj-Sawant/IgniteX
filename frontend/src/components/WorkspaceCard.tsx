import React from 'react';
import { Database, Network } from 'lucide-react';

export const WorkspaceCard: React.FC = () => {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-5 shadow-lg shadow-black/20 h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-zinc-100">Current Workspace</h2>
        <div className="flex items-center gap-2 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs text-green-400 font-medium">Active</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="p-3.5 bg-zinc-950/60 rounded-lg border border-purple-500/30 border-breathe shadow-inner">
          <div className="flex items-center gap-2.5 mb-2">
            <Network className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Model Structure</span>
          </div>
          <p className="font-mono text-sm text-zinc-200">DeepLabV3+ (ResNet101)</p>
        </div>
        
        <div className="p-3.5 bg-zinc-950/60 rounded-lg border border-zinc-800/50 hover:border-blue-500/30 transition-colors group cursor-default">
          <div className="flex items-center gap-2.5 mb-2">
            <Database className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Dataset Context</span>
          </div>
          <p className="text-sm text-zinc-200">Off-road: Desert / Rocky Trail</p>
        </div>
      </div>
    </div>
  );
};
