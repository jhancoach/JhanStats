import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { KillStat, EarningStat } from '../types';

interface ChartsProps {
  type: 'kills' | 'earnings';
  data: KillStat[] | EarningStat[];
}

export const DashboardCharts: React.FC<ChartsProps> = ({ type, data }) => {
  const top10 = data.slice(0, 10);
  
  const isKills = type === 'kills';
  const barColor = isKills ? "#EAB308" : "#3B82F6"; // Yellow-500 or Blue-500
  const dataKey = isKills ? "totalKills" : "earnings";
  
  // Custom tooltip for dark mode
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl">
          <p className="font-bold text-slate-100">{label}</p>
          <p className="text-sm" style={{ color: barColor }}>
            {isKills 
              ? `Abates: ${payload[0].value}` 
              : `Ganhos: $${payload[0].value.toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[300px] mt-6 mb-8 bg-slate-900/50 rounded-xl border border-slate-800 p-4">
      <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <span className={`w-2 h-6 rounded ${isKills ? 'bg-yellow-500' : 'bg-blue-500'}`}></span>
        {isKills ? 'Top 10 - Líderes de Abates' : 'Top 10 - Maiores Ganhos'}
      </h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={top10}
          layout={isKills ? "vertical" : "horizontal"}
          margin={{ top: 5, right: 30, left: isKills ? 40 : 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={!isKills} vertical={isKills} />
          {isKills ? (
            <>
              <XAxis type="number" stroke="#94a3b8" tick={{fill: '#94a3b8'}} />
              <YAxis dataKey="player" type="category" width={80} stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 12}} />
            </>
          ) : (
             <>
              <XAxis dataKey="player" stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} tickFormatter={(val) => `$${val/1000}k`} />
             </>
          )}
          
          <Tooltip content={<CustomTooltip />} cursor={{fill: '#334155', opacity: 0.2}} />
          
          <Bar 
            dataKey={dataKey} 
            radius={isKills ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            animationDuration={800} // Reduced duration for faster perceived loading
            animationEasing="ease-out"
          >
             {top10.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={barColor} fillOpacity={0.8 + (index * 0.01)} />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};