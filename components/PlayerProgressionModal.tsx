import React, { useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  LabelList
} from 'recharts';
import { KillStat } from '../types';
import { X, TrendingUp, Trophy, Crosshair, Swords, Globe } from 'lucide-react';

interface PlayerProgressionModalProps {
  player: KillStat | null;
  onClose: () => void;
}

export const PlayerProgressionModal: React.FC<PlayerProgressionModalProps> = ({ player, onClose }) => {
  if (!player) return null;

  const chartData = useMemo(() => {
    const seasons = [
      { key: 'lbff1', label: 'LBFF 1' },
      { key: 'lbff3', label: 'LBFF 3' },
      { key: 'lbff4', label: 'LBFF 4' },
      { key: 'lbff5', label: 'LBFF 5' },
      { key: 'lbff6', label: 'LBFF 6' },
      { key: 'lbff7', label: 'LBFF 7' },
      { key: 'lbff8', label: 'LBFF 8' },
      { key: 'lbff9', label: 'LBFF 9' },
      { key: 'wb2024s1', label: 'WB 24 S1' },
      { key: 'wb2024s2', label: 'WB 24 S2' },
      { key: 'wb2025s1', label: 'WB 25 S1' },
      { key: 'wb2025s2', label: 'WB 25 S2' },
    ];

    return seasons.map(season => {
      const rawData = (player as any)[season.key];
      let kills = 0;
      let matches = 0;

      if (rawData && rawData !== '- (-)') {
        const parts = rawData.split(' (');
        kills = parseInt(parts[0], 10) || 0;
        if (parts[1]) {
          matches = parseInt(parts[1].replace(')', ''), 10) || 0;
        }
      }

      // Calculate Average (KPG)
      const kpg = matches > 0 ? (kills / matches).toFixed(2) : '0.00';

      return {
        name: season.label,
        kills: kills,
        matches: matches,
        kpg: kpg,
        raw: rawData,
        active: rawData && rawData !== '- (-)'
      };
    });
  }, [player]);

  // Calculate WB Specific Total
  const wbTotal = useMemo(() => {
     let kills = 0;
     let matches = 0;
     ['wb2024s1', 'wb2024s2', 'wb2025s1', 'wb2025s2'].forEach(key => {
         const rawData = (player as any)[key];
         if (rawData && rawData !== '- (-)') {
            const parts = rawData.split(' (');
            kills += parseInt(parts[0], 10) || 0;
            matches += parseInt(parts[1]?.replace(')', ''), 10) || 0;
         }
     });
     return { kills, matches };
  }, [player]);

  const totalSeasonsPlayed = chartData.filter(d => d.active).length;
  const peakKills = Math.max(...chartData.map(d => d.kills));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl z-50">
          <p className="font-bold text-slate-100 mb-1">{label}</p>
          <p className="text-yellow-500 font-mono text-lg">
            {payload[0].value} Abates
          </p>
          <p className="text-xs text-slate-400 mt-1">
             Partidas: {payload[0].payload.matches} | Média: {payload[0].payload.kpg}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col my-auto max-h-[90vh] overflow-hidden">
        
        {/* Header with Premium Background */}
        <div className="relative p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 shrink-0 overflow-hidden">
          {/* Background Gradient/Mesh */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 z-0"></div>
          <div className="absolute inset-0 opacity-20 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent"></div>
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-700 flex items-center justify-center text-black border border-amber-300 shadow-xl shadow-amber-500/10 rotate-3">
               <Trophy className="w-8 h-8 fill-black/20" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white tracking-tighter drop-shadow-md">
                {player.player}
              </h2>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-400">
                <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur px-3 py-1 rounded-full border border-white/5 shadow-inner">
                  <Swords className="w-3.5 h-3.5 text-amber-400" /> 
                  Total: <span className="text-white font-mono">{player.totalKills}</span>
                </span>
                <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur px-3 py-1 rounded-full border border-white/5 shadow-inner">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> 
                  Pico: <span className="text-white font-mono">{peakKills}</span>
                </span>
                <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur px-3 py-1 rounded-full border border-white/5 shadow-inner">
                   Temporadas: <span className="text-white font-mono">{totalSeasonsPlayed}</span>
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="relative z-10 p-2 rounded-full bg-black/20 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto custom-scrollbar p-6 bg-slate-950/50">
          
          {/* WB Stats Highlight */}
          <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                      <Globe className="w-6 h-6" />
                  </div>
                  <div>
                      <h3 className="text-indigo-200 font-bold">World Series (WB) Total</h3>
                      <p className="text-xs text-indigo-400/60">Somatório de performance internacional (2024-2025)</p>
                  </div>
              </div>
              <div className="flex gap-6 text-right">
                  <div>
                      <div className="text-2xl font-mono font-bold text-white">{wbTotal.kills}</div>
                      <div className="text-xs text-indigo-400 uppercase tracking-wide">Abates</div>
                  </div>
                  <div className="border-l border-indigo-500/20 pl-6">
                      <div className="text-2xl font-mono font-bold text-white">{wbTotal.matches}</div>
                      <div className="text-xs text-indigo-400 uppercase tracking-wide">Partidas</div>
                  </div>
              </div>
          </div>

          {/* Chart Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 shadow-inner">
            <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Curva de Evolução de Abates
            </h3>
            <div className="h-[350px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorKills" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EAB308" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EAB308" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b" 
                    tick={{fill: '#64748b', fontSize: 11}} 
                    tickMargin={10}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    stroke="#64748b" 
                    tick={{fill: '#64748b', fontSize: 11}}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area 
                    type="monotone" 
                    dataKey="kills" 
                    stroke="#EAB308" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorKills)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                    animationDuration={500} // Optimized animation
                  >
                    <LabelList 
                      dataKey="kills" 
                      position="top" 
                      offset={10} 
                      className="fill-slate-300 text-[10px] font-mono" 
                      formatter={(val: number) => val > 0 ? val : ''}
                    />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Stats Grid */}
          <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
            <Crosshair className="w-4 h-4" /> Estatísticas Detalhadas por Temporada
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {chartData.map((data) => (
              <div 
                key={data.name} 
                className={`p-3 rounded-lg border flex flex-col ${
                  data.active 
                    ? 'bg-slate-900 border-slate-700' 
                    : 'bg-slate-900/30 border-slate-800 opacity-60'
                }`}
              >
                <span className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">{data.name}</span>
                <div className="flex justify-between items-end">
                  <div>
                    <span className={`text-xl font-mono font-bold ${data.active ? 'text-white' : 'text-slate-600'}`}>
                      {data.active ? data.kills : '-'}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">Abates</span>
                  </div>
                  {data.active && (
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                        {data.matches} Partidas
                      </div>
                      <div className="text-[10px] text-yellow-500/80 bg-yellow-900/20 px-1.5 py-0.5 rounded border border-yellow-900/30 font-mono">
                        Média: {data.kpg}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};