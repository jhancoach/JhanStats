import React, { useState, useMemo } from 'react';
import { KillStat } from '../types';
import { 
  Search, 
  Trophy, 
  FileText,
  Calendar,
  Target,
  Swords,
  Shield,
  Heart,
  Skull,
  UserMinus,
  TrendingUp,
  Download,
  Activity
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

  // Process data for Table 1 (History) & Chart
  const seasonData = useMemo(() => {
    if (!player) return [];

    // Prioritize FFWS/WB Data as requested
    const seasons = [
      { key: 'wb2025s2', label: 'WB 2025 Split 2' },
      { key: 'wb2025s1', label: 'WB 2025 Split 1' },
      { key: 'wb2024s2', label: 'WB 2024 Split 2' },
      { key: 'wb2024s1', label: 'WB 2024 Split 1' },
      { key: 'lbff9', label: 'LBFF 9' }, // Keeping detailed legacy data if available
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
        id: season.key,
        name: season.label,
        kills,
        matches,
        kpg: matches > 0 ? (kills / matches).toFixed(2) : '0.00',
        active: kills > 0 || matches > 0
      };
    }).filter(d => d.active);
  }, [player]);

  // Calculate Averages for Table 2
  const combatStats = useMemo(() => {
    if (!player) return null;
    const m = player.matches || 1;
    return {
      headshots: { total: player.headshots || 0, avg: ((player.headshots || 0) / m).toFixed(2) },
      knockdowns: { total: player.knockdowns || 0, avg: ((player.knockdowns || 0) / m).toFixed(2) },
      gloowalls: { total: player.gloowalls || 0, avg: ((player.gloowalls || 0) / m).toFixed(1) },
      revives: { total: player.revives || 0, avg: ((player.revives || 0) / m).toFixed(2) },
      wallsDestroyed: { total: player.gloowallsDestroyed || 0, avg: ((player.gloowallsDestroyed || 0) / m).toFixed(2) }
    };
  }, [player]);

  const handlePrint = () => {
    window.print();
  };

  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : '??';

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-140px)] animate-fade-in relative">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-profile, #printable-profile * { visibility: visible; }
          #printable-profile {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            background: #0b0f19;
            color: #fff;
            padding: 20px;
            z-index: 9999;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Sidebar - Player Selector */}
      <div className="w-full lg:w-72 glass-panel rounded-2xl border border-white/10 flex flex-col shrink-0 h-[400px] lg:h-full no-print">
        <div className="p-4 border-b border-white/5">
           <div className="relative">
             <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
             <input 
               type="text" 
               placeholder="Buscar Jogador..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-600"
             />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
           {filteredPlayers.map(p => (
             <button
               key={p.player}
               onClick={() => setSelectedPlayerId(p.player)}
               className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${selectedPlayerId === p.player ? 'bg-indigo-600/10 border border-indigo-500/30' : 'hover:bg-white/5 border border-transparent'}`}
             >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${selectedPlayerId === p.player ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-white'}`}>
                   {getInitials(p.player)}
                </div>
                <div className="flex-1 min-w-0">
                   <div className={`font-bold truncate text-sm ${selectedPlayerId === p.player ? 'text-white' : 'text-slate-300'}`}>{p.player}</div>
                   <div className="text-xs text-slate-500 truncate">{p.team}</div>
                </div>
             </button>
           ))}
        </div>
      </div>

      {/* Main Profile Content */}
      <div id="printable-profile" className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1">
         
         {/* 1. Hero Card (Matching the user image) */}
         <div className="bg-[#0B0F19] rounded-3xl p-6 md:p-8 border border-white/10 relative overflow-hidden shadow-2xl">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    {/* Avatar Gradient Box */}
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 flex items-center justify-center text-4xl md:text-5xl font-black text-white shadow-lg shadow-indigo-500/20">
                        {getInitials(player.player)}
                    </div>
                    
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider">
                                <Trophy className="w-3 h-3 fill-current" /> Rank #{player.rank}
                            </span>
                            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                {player.team}
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-2">
                            {player.player}
                        </h1>
                        <p className="text-slate-400 text-sm max-w-lg">
                            Análise completa de desempenho. Dados consolidados de todas as competições oficiais rastreadas (FFWSBR & World Series).
                        </p>
                    </div>
                </div>

                <div className="w-full md:w-auto flex flex-col items-stretch md:items-end gap-3">
                    <button 
                        onClick={handlePrint}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group"
                    >
                        <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Gerar Relatório
                    </button>
                    <div className="text-right hidden md:block">
                        <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">Abates Totais</div>
                        <div className="text-3xl font-mono font-bold text-white">{player.totalKills.toLocaleString()}</div>
                    </div>
                </div>
            </div>
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Tabela 1: Histórico de Splits (Main Data) */}
            <div className="xl:col-span-2 glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-white/5 bg-black/20 flex items-center justify-between">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-400" />
                        Histórico de Splits
                    </h3>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">FFWSBR DATA</div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] uppercase text-slate-500 font-bold tracking-wider bg-white/5">
                                <th className="px-5 py-4">Temporada</th>
                                <th className="px-5 py-4 text-center">Abates</th>
                                <th className="px-5 py-4 text-center">Partidas</th>
                                <th className="px-5 py-4 text-center">Média (KPG)</th>
                                <th className="px-5 py-4 text-right">Performance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {seasonData.map((s, idx) => (
                                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-5 py-4 font-bold text-slate-200">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                            {s.name}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-center font-mono text-white text-base font-bold">
                                        {s.kills}
                                    </td>
                                    <td className="px-5 py-4 text-center text-slate-400">
                                        {s.matches}
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${Number(s.kpg) >= 1.5 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-300'}`}>
                                            {s.kpg}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="w-24 ml-auto bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-indigo-500 transition-all duration-500" 
                                                style={{ width: `${Math.min(100, (Number(s.kpg) / 2.0) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {seasonData.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">Sem dados históricos disponíveis.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tabela 2: Métricas de Combate (Detailed Stats) */}
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-white/5 bg-black/20 flex items-center justify-between">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-amber-400" />
                        Métricas de Combate
                    </h3>
                </div>
                <div className="p-0">
                    {combatStats && (
                        <div className="divide-y divide-white/5">
                            {/* Headshots */}
                            <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                                        <Skull className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Capas (HS)</div>
                                        <div className="text-white font-mono font-bold">{combatStats.headshots.total}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-rose-400 font-bold font-mono text-lg">{combatStats.headshots.avg}</div>
                                    <div className="text-[10px] text-slate-600">Média/Jogo</div>
                                </div>
                            </div>

                            {/* Knockdowns */}
                            <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                                        <UserMinus className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Derrubados</div>
                                        <div className="text-white font-mono font-bold">{combatStats.knockdowns.total}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-amber-400 font-bold font-mono text-lg">{combatStats.knockdowns.avg}</div>
                                    <div className="text-[10px] text-slate-600">Média/Jogo</div>
                                </div>
                            </div>

                            {/* Gloo Walls */}
                            <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Gelos</div>
                                        <div className="text-white font-mono font-bold">{combatStats.gloowalls.total}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-cyan-400 font-bold font-mono text-lg">{combatStats.gloowalls.avg}</div>
                                    <div className="text-[10px] text-slate-600">Média/Jogo</div>
                                </div>
                            </div>

                            {/* Revives */}
                            <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                        <Heart className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Revividos</div>
                                        <div className="text-white font-mono font-bold">{combatStats.revives.total}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-emerald-400 font-bold font-mono text-lg">{combatStats.revives.avg}</div>
                                    <div className="text-[10px] text-slate-600">Média/Jogo</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
         </div>
         
         {/* Visual Evolution Chart */}
         <div className="glass-panel rounded-2xl p-6 border border-white/10 mt-2">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    Evolução de Abates (Timeline)
                </h3>
             </div>
             <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={seasonData.slice().reverse()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorKillsGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 11}} axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 11}} axisLine={false} tickLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="kills" 
                            stroke="#818cf8" 
                            strokeWidth={3} 
                            fill="url(#colorKillsGradient)" 
                            activeDot={{r: 6, strokeWidth: 0, fill: '#fff'}}
                            animationDuration={500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
         </div>

      </div>
    </div>
  );
};