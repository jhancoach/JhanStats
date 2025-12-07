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
  type: 'kills';
  data: KillStat[];
}

export const DashboardCharts: React.FC<ChartsProps> = ({ type, data }) => {
  const top10 = data.slice(0, 10);
  
  const isKills = type === 'kills';
  const barColor = "#EAB308"; // Yellow-500
  const dataKey = "totalKills";
  
  // Custom tooltip for dark mode
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl">
          <p className="font-bold text-slate-100">{label}</p>
          <p className="text-sm" style={{ color: barColor }}>
            Abates: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[300px] mt-6 mb-8 bg-slate-900/50 rounded-xl border border-slate-800 p-4">
      <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <span className={`w-2 h-6 rounded bg-yellow-500`}></span>
        Top 10 - Líderes de Abates
      </h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={top10}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} vertical={true} />
          
          <XAxis type="number" stroke="#94a3b8" tick={{fill: '#94a3b8'}} />
          <YAxis dataKey="player" type="category" width={80} stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 12}} />
          
          <Tooltip content={<CustomTooltip />} cursor={{fill: '#334155', opacity: 0.2}} />
          
          <Bar 
            dataKey={dataKey} 
            radius={[0, 4, 4, 0]}
            animationDuration={400} // Optimized for speed
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