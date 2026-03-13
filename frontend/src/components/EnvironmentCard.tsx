import React from 'react';
import { Sun, Wind, CloudRain, Droplets } from 'lucide-react';

const features = [
  { icon: Sun, label: 'Illumination', value: 'Harsh Sunlight', color: 'text-yellow-400' },
  { icon: Wind, label: 'Particulates', value: 'Moderate Dust', color: 'text-amber-400' },
  { icon: Droplets, label: 'Humidity', value: 'Very Dry (12%)', color: 'text-blue-400' }
];

export const EnvironmentCard: React.FC = () => {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-5 shadow-lg shadow-black/20 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-1.5 bg-zinc-800 rounded-lg">
          <CloudRain className="w-4 h-4 text-emerald-400" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-100">Environment Features</h3>
      </div>
      
      <div className="space-y-4">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-4 p-3 bg-zinc-950/40 rounded-lg border border-zinc-800/50 hover:bg-zinc-900/60 transition-colors">
              <div className={`p-2 bg-zinc-900 rounded-md ${item.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5">{item.label}</p>
                <p className="text-sm text-zinc-200 font-medium">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
