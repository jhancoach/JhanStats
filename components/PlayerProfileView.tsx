import React, { useState, useMemo } from 'react';
import { KillStat } from '../types';
import { 
  Search, 
  Trophy, 
  Crosshair, 
  Swords, 
  Calendar,
  Globe,
  Activity,
  Skull,
  Shield,
  Heart,
  UserMinus,
  FileText,
  Target
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface PlayerProfileViewProps {
  players: KillStat[];
}

export const PlayerProfileView: React.FC<PlayerProfileViewProps> = ({ players }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0]?.player || '');

  const filteredPlayers = useMemo(() => {
    return players.filter(p => p.player.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [players, searchTerm]);

  const player = useMemo(() => {
    return players.find(p => p.player === selectedPlayerId) || players[0];
  }, [players, selectedPlayerId]);

  // Calculate Averages
  const averages = useMemo(() => {
    if (!player || !player.matches) return { headshots: '0.00', knockdowns: '0.00' };
    return {
      headshots: player.headshots ? (player.headshots / player.matches).toFixed(2) : '0.00',
      knockdowns: player.knockdowns ? (player.knockdowns / player.matches).toFixed(2) : '0.00'
    };
  }, [player]);

  // Process data for evolution chart & history list
  const chartData = useMemo(() => {
    if (!player) return [];

    const seasons = [
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

      if (rawData && rawData !== '- (-)' && rawData !== '0 (0)') {
        const parts = rawData.split(' (');
        kills = parseInt(parts[0], 10) || 0;
        if (parts[1]) {
          matches = parseInt(parts[1].replace(')', ''), 10) || 0;
        }
      }

      return {
        name: season.label,
        kills,
        matches,
        kpg: matches > 0 ? (kills / matches).toFixed(2) : 0,
        active: kills > 0
      };
    }).filter(d => d.active);
  }, [player]);

  const handlePrint = () => {
    window.print();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl">
          <p className="font-bold text-white mb-1">{label}</p>
          <p className="text-white font-mono text-sm">
             Valor: <span style={{ color: payload[0].payload.fill || payload[0].color }}>{payload[0].value}</span>
          </p>
          {payload[0].payload.matches && (
             <p className="text-slate-400 text-xs mt-1">
               {payload[0].payload.matches} Quedas | {payload[0].payload.kpg} Med
             </p>
          )}
        </div>
      );
    }
    return null;
  };

  const StatBox = ({ label, value, icon: Icon, color, sub }: any) => (
    <div className={`bg-black/20 border border-white/5 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group hover:bg-white/5 transition-colors`}>
       <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400 shrink-0`}>
          <Icon className="w-6 h-6" />
       </div>
       <div className="min-w-0">
          <div className="text-2xl font-black text-white font-mono tracking-tight truncate">{value ? value.toLocaleString() : '-'}</div>
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">{label}</div>
          {sub && <div className="text-xs text-slate-600 mt-0.5 truncate">{sub}</div>}
       </div>
       <div className={`absolute -right-4 -bottom-4 w-16 h-16 bg-${color}-500/5 rounded-full blur-xl group-hover:bg-${color}-500/10 transition-colors pointer-events-none`}></div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[800px] animate-fade-in relative">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-profile-view, #printable-profile-view * { visibility: visible; }
          #printable-profile-view {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            margin: 0;
            padding: 20px;
            background: #000;
            overflow: visible;
          }
          .no-print { display: none !important; }
        }
      `}</style>
      
      {/* Sidebar - Player List (Hidden on Print) */}
      <div className="w-full lg:w-80 h-80 lg:h-auto flex flex-col glass-panel rounded-2xl overflow-hidden shrink-0 border border-white/10 order-1 lg:order-none shadow-xl no-print">
        <div className="p-4 border-b border-white/5 bg-black/40">
           <div className="relative">
             <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
             <input 
               type="text" 
               placeholder="Buscar jogador..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-600"
             />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
           {filteredPlayers.map(p => (
             <button
               key={p.player}
               onClick={() => setSelectedPlayerId(p.player)}
               className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${selectedPlayerId === p.player ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-white/5 border border-transparent'}`}
             >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow-inner ${selectedPlayerId === p.player ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-white'}`}>
                   {p.rank}
                </div>
                <div className="flex-1 min-w-0">
                   <div className={`font-bold truncate ${selectedPlayerId === p.player ? 'text-white' : 'text-slate-300'}`}>{p.player}</div>
                   <div className="text-xs text-slate-500 truncate">{p.team}</div>
                </div>
                {selectedPlayerId === p.player && <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]"></div>}
             </button>
           ))}
        </div>
      </div>

      {/* Main Content */}
      <div id="printable-profile-view" className="flex-1 flex flex-col gap-6 lg:overflow-y-auto custom-scrollbar pr-0 lg:pr-2 order-2 lg:order-none pb-8 lg:pb-0">
         
         {/* Hero Header */}
         <div className="relative glass-panel rounded-2xl p-6 md:p-8 border border-white/10 overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-b from-indigo-600/20 to-transparent rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
               <div className="w-20 h-20 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl md:text-4xl font-black text-white shadow-2xl shadow-indigo-500/20 border border-white/10 rotate-3 transform hover:rotate-0 transition-transform duration-500 shrink-0">
                  {player?.player.substring(0, 2).toUpperCase()}
               </div>
               
               <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                         <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Trophy className="w-3 h-3" /> Rank #{player?.rank}
                         </span>
                         <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            {player?.team}
                         </span>
                      </div>
                      <button 
                         onClick={handlePrint}
                         className="no-print flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-indigo-500/20 active:scale-95"
                         title="Imprimir ou Salvar como PDF"
                      >
                         <FileText className="w-4 h-4" /> Gerar Relatório
                      </button>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2 break-all">{player?.player}</h1>
                  <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
                     Análise completa de desempenho. Dados consolidados de todas as competições oficiais rastreadas (LBFF & World Series).
                  </p>
               </div>

               <div className="hidden xl:flex flex-col items-end gap-1 text-right">
                  <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Total Geral</div>
                  <div className="text-4xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                     {player?.totalKills.toLocaleString()}
                  </div>
                  <div className="text-sm text-indigo-400 font-medium">Abates Confirmados</div>
               </div>
            </div>
         </div>

         {/* Stats Grid - 2 Rows */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
            {/* Row 1 - General */}
            <StatBox 
               label="Total Abates" 
               value={player?.totalKills} 
               icon={Swords} 
               color="indigo" 
            />
            <StatBox 
               label="Média (KPG)" 
               value={player?.kpg} 
               icon={Crosshair} 
               color="amber" 
            />
            <StatBox 
               label="Total Quedas" 
               value={player?.matches} 
               icon={Calendar} 
               color="blue" 
            />
            <StatBox 
               label="WB Performance" 
               value={player ? (parseInt(String((player as any).wb2024s1 || '0').split(' ')[0]) + parseInt(String((player as any).wb2024s2 || '0').split(' ')[0]) + parseInt(String((player as any).wb2025s1 || '0').split(' ')[0]) + parseInt(String((player as any).wb2025s2 || '0').split(' ')[0])) : 0}
               icon={Globe} 
               color="emerald" 
            />
            
            {/* Row 2 - Detailed */}
            <StatBox 
               label="Capas" 
               value={player?.headshots} 
               icon={Skull} 
               color="rose" 
               sub={`Média: ${averages.headshots}`}
            />
            <StatBox 
               label="Derrubados" 
               value={player?.knockdowns} 
               icon={UserMinus} 
               color="orange" 
               sub={`Média: ${averages.knockdowns}`}
            />
            <StatBox 
               label="Gelos" 
               value={player?.gloowalls} 
               icon={Shield} 
               color="cyan" 
               sub="Walls Utilizados"
            />
            <StatBox 
               label="Revividos" 
               value={player?.alliesRevived || player?.revives} 
               icon={Heart} 
               color="emerald" 
               sub="Aliados Salvos"
            />
         </div>

         {/* Evolution Chart (Full Width) */}
         <div className="glass-panel rounded-2xl p-6 border border-white/10 shrink-0">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
               <Activity className="w-5 h-5 text-indigo-400" /> Evolução Temporal de Performance
            </h3>
            <div className="h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorKillsProfile" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                     <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 11}} />
                     <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 11}} />
                     <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }} />
                     <Area 
                        type="monotone" 
                        dataKey="kills" 
                        stroke="#6366f1" 
                        strokeWidth={3} 
                        fill="url(#colorKillsProfile)" 
                        activeDot={{r: 6, strokeWidth: 0, fill: '#fff'}}
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Split History Grid (Expanded Layout) */}
         <div className="glass-panel rounded-2xl p-6 border border-white/10 shrink-0">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
               <Target className="w-5 h-5 text-amber-400" /> Histórico Detalhado por Split
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
               {chartData.slice().reverse().map((data, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-between hover:bg-white/10 transition-colors group">
                     <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                           <div className={`w-1.5 h-10 rounded-full ${data.name.includes('WB') ? 'bg-indigo-500' : 'bg-slate-600'} group-hover:scale-y-110 transition-transform`}></div>
                           <div>
                              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{data.name}</div>
                              <div className="text-2xl font-black text-white font-mono">{data.kills} <span className="text-xs text-slate-500 font-sans font-normal">Kills</span></div>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-slate-400 border border-white/5">
                              {data.matches} Quedas
                           </span>
                        </div>
                     </div>
                     
                     <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                        <span className="text-xs text-slate-500">Média (KPG)</span>
                        <div className={`text-sm font-mono font-bold ${Number(data.kpg) > 1.5 ? 'text-emerald-400' : 'text-slate-300'}`}>
                           {data.kpg}
                        </div>
                     </div>
                     {/* Visual Bar for Impact */}
                     <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                        <div 
                           className={`h-full ${data.name.includes('WB') ? 'bg-indigo-500' : 'bg-slate-500'}`} 
                           style={{ width: `${Math.min(100, (Number(data.kpg) / 2) * 100)}%` }}
                        ></div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

      </div>
    </div>
  );
};