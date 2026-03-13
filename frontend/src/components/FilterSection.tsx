import React from 'react';
import { Filter } from 'lucide-react';

const tags = [
  { label: 'Dust Storm', color: 'text-amber-300 bg-amber-400/10 border-amber-400/20 hover:border-amber-400/40' },
  { label: 'Dusk/Dawn', color: 'text-orange-300 bg-orange-400/10 border-orange-400/20 hover:border-orange-400/40' },
  { label: 'High Glare', color: 'text-yellow-200 bg-yellow-200/10 border-yellow-200/20 hover:border-yellow-200/40' },
  { label: 'Rain/Mud', color: 'text-blue-300 bg-blue-400/10 border-blue-400/20 hover:border-blue-400/40' },
  { label: 'Dense Vegetation', color: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20 hover:border-emerald-400/40' },
  { label: 'Rocky', color: 'text-stone-300 bg-stone-400/10 border-stone-400/20 hover:border-stone-400/40' }
];

export const FilterSection: React.FC = () => {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-5 shadow-lg shadow-black/20">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-1.5 bg-zinc-800 rounded-lg">
          <Filter className="w-4 h-4 text-zinc-400" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-100">Scene Filters</h3>
      </div>
      
      <div className="flex flex-wrap gap-2.5">
        {tags.map((tag, idx) => (
          <button 
            key={idx}
            className={`px-3 py-1.5 text-xs font-medium border rounded-md transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer ${tag.color}`}
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
};
