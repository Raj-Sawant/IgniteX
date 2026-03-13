import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { Zap } from 'lucide-react';

const data = [
  { name: 'DeepLabV3+', accuracy: 92.4, color: '#8b5cf6' },
  { name: 'U-Net', accuracy: 88.7, color: '#6366f1' },
  { name: 'FCN-8s', accuracy: 84.2, color: '#ec4899' },
  { name: 'PSPNet', accuracy: 86.5, color: '#14b8a6' }
];

export const PerformanceChart: React.FC = () => {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-5 shadow-lg shadow-black/20 flex flex-col h-full min-h-[300px]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-1.5 bg-zinc-800 rounded-lg">
          <Zap className="w-4 h-4 text-yellow-400" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-100">Model Comparison</h3>
      </div>
      
      <div className="flex-1 w-full h-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
            <XAxis type="number" domain={[70, 100]} stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} width={80} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#e4e4e7' }}
              cursor={{ fill: '#27272a', opacity: 0.4 }}
            />
            <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} animationDuration={2000}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
