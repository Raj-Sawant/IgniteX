import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface GraphCardProps {
  title: string;
  type: 'loss' | 'accuracy';
  data: any[];
}

export const GraphCard: React.FC<GraphCardProps> = ({ title, type, data }) => {
  const isLoss = type === 'loss';
  const color = isLoss ? '#f59e0b' : '#8b5cf6';
  const Icon = isLoss ? TrendingDown : TrendingUp;
  
  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-5 shadow-lg shadow-black/20 flex flex-col h-full min-h-[300px]">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-1.5 rounded-lg ${isLoss ? 'bg-amber-950/30' : 'bg-purple-950/30'}`}>
          <Icon className={`w-4 h-4 ${isLoss ? 'text-amber-500' : 'text-purple-400'}`} />
        </div>
        <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
      </div>
      
      <div className="flex-1 w-full h-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="epoch" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} domain={isLoss ? [0, 'dataMax + 0.1'] : [0.7, 1]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#e4e4e7' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              fillOpacity={1} 
              fill={`url(#gradient-${type})`} 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
