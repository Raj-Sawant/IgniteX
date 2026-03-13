import React from 'react';
import { PieChart } from 'lucide-react';

interface TerrainClass {
  name: string;
  color: string;
  percentage: number;
}

const terrainData: TerrainClass[] = [
  { name: 'Drivable Terrain', color: 'bg-emerald-500', percentage: 64.2 },
  { name: 'Loose Sand Risk', color: 'bg-amber-500', percentage: 15.8 },
  { name: 'Rocky Obstacles', color: 'bg-stone-400', percentage: 12.5 },
  { name: 'Sky/Background', color: 'bg-blue-500', percentage: 7.5 }
];

export const TerrainStats: React.FC = () => {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-5 shadow-lg shadow-black/20 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-1.5 bg-zinc-800 rounded-lg">
          <PieChart className="w-4 h-4 text-purple-400" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-100">Terrain Distribution</h3>
      </div>
      
      <div className="space-y-4 flex-1 flex flex-col justify-center">
        {terrainData.map((item) => (
          <div key={item.name}>
            <div className="flex justify-between text-sm mb-2">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-[0_0_8px_currentColor]`}></span>
                <span className="text-zinc-300 font-medium">{item.name}</span>
              </div>
              <span className="text-zinc-400 font-mono text-xs bg-zinc-950/50 px-2 py-0.5 rounded border border-zinc-800">{item.percentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-950/80 rounded-full overflow-hidden border border-zinc-800/50">
              <div 
                className={`h-full ${item.color}`} 
                style={{ width: `${item.percentage}%`, opacity: 0.85 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
