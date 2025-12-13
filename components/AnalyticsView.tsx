import React, { useState, useMemo } from 'react';
import { KillStat } from '../types';
import { 
  Swords, 
  Shield, 
  Skull, 
  Crosshair, 
  UserMinus, 
  Heart, 
  Zap, 
  Activity, 
  Trophy,
  ArrowUpDown,
  Search,
  Target
} from 'lucide-react';

interface AnalyticsViewProps {
  players: KillStat[];
  onPlayerClick?: (player: KillStat) => void;
}

type SortKey = keyof KillStat | 'kpg' | 'kd_avg';

interface SortConfig {
  key: SortKey;
  direction: 'asc' | 'desc';
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ players, onPlayerClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sorting States for the two tables
  const [combatSort, setCombatSort] = useState<SortConfig>({ key: 'totalKills', direction: 'desc' });
  const [utilitySort, setUtilitySort] = useState<SortConfig>({ key: 'gloowalls', direction: 'desc' });

  // Filter Data
  const filteredPlayers = useMemo(() => {
    return players.filter(p => p.player.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [players, searchTerm]);

  // Calculate Max Values for Progress Bars
  const maxStats = useMemo(() => {
    return {
      kills: Math.max(...players.map(p => p.totalKills || 0), 1),
      headshots: Math.max(...players.map(p => p.headshots || 0), 1),
      knockdowns: Math.max(...players.map(p => p.knockdowns || 0), 1),
      gloowalls: Math.max(...players.map(p => p.gloowalls || 0), 1),
      revives: Math.max(...players.map(p => p.revives || 0), 1),
    };
  }, [players]);

  // Generic Sort Function
  const getSortedData = (data: KillStat[], config: SortConfig) => {
    return [...data].sort((a, b) => {
      let valA: any = a[config.key as keyof KillStat];
      let valB: any = b[config.key as keyof KillStat];

      // Handle calculated fields
      if (config.key === 'kd_avg') {
         valA = a.matches ? (a.knockdowns || 0) / a.matches : 0;
         valB = b.matches ? (b.knockdowns || 0) / b.matches : 0;
      }

      if (valA < valB) return config.direction === 'asc' ? -1 : 1;
      if (valA > valB) return config.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const combatData = getSortedData(filteredPlayers, combatSort);
  const utilityData = getSortedData(filteredPlayers, utilitySort);

  const handleSort = (key: SortKey, type: 'combat' | 'utility') => {
    const currentConfig = type === 'combat' ? combatSort : utilitySort;
    const setConfig = type === 'combat' ? setCombatSort : setUtilitySort;
    
    let direction: 'asc' | 'desc' = 'desc';
    if (currentConfig.key === key && currentConfig.direction === 'desc') {
      direction = 'asc';
    }
    setConfig({ key, direction });
  };

  // --- Components ---

  const ProgressBar = ({ value, max, colorClass }: { value: number, max: number, colorClass: string }) => (
    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden flex justify-start">
      <div 
        className={`h-full rounded-full ${colorClass}`} 
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }} 
      />
    </div>
  );

  const HeaderCell = ({ label, sortKey, activeSort, type, icon: Icon, align = 'left' }: any) => (
    <th 
      className={`px-4 py-4 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors hover:bg-white/5 ${align === 'center' ? 'text-center' : 'text-left'} ${activeSort.key === sortKey ? 'text-white' : 'text-slate-500'}`}
      onClick={() => handleSort(sortKey, type)}
    >
      <div className={`flex items-center gap-2 ${align === 'center' ? 'justify-center' : ''}`}>
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
        <ArrowUpDown className={`w-3 h-3 transition-opacity ${activeSort.key === sortKey ? 'opacity-100' : 'opacity-20'}`} />
      </div>
    </th>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header / Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">
            Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Analítico</span>
          </h2>
          <p className="text-slate-400 text-sm">
            Visão aprofundada baseada nas estatísticas detalhadas de perfil (WB).
          </p>
        </div>
        <div className="relative w-full md:w-80">
           <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
           <input 
             type="text" 
             placeholder="Filtrar Jogador..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
           />
        </div>
      </div>

      {/* --- TABLE 1: COMBAT & LETHALITY --- */}
      <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-red-500 to-purple-600"></div>
        
        <div className="p-5 border-b border-white/5 bg-black/20 flex items-center gap-3">
           <div className="p-2 bg-gradient-to-br from-amber-500/20 to-red-500/20 rounded-lg border border-amber-500/20">
              <Swords className="w-5 h-5 text-amber-400" />
           </div>
           <div>
              <h3 className="font-bold text-white text-lg">Eficiência de Combate</h3>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Kills • Headshots • Knockdowns</p>
           </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <HeaderCell label="Jogador" sortKey="player" activeSort={combatSort} type="combat" />
                <HeaderCell label="Abates" sortKey="totalKills" activeSort={combatSort} type="combat" icon={Crosshair} align="center" />
                <HeaderCell label="KPG" sortKey="kpg" activeSort={combatSort} type="combat" align="center" />
                <HeaderCell label="Capas" sortKey="headshots" activeSort={combatSort} type="combat" icon={Skull} align="center" />
                <HeaderCell label="Derrubados" sortKey="knockdowns" activeSort={combatSort} type="combat" icon={UserMinus} align="center" />
                <HeaderCell label="Média Derrub." sortKey="kd_avg" activeSort={combatSort} type="combat" align="center" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {combatData.slice(0, 50).map((p, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-4 py-3">
                    <div 
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => onPlayerClick && onPlayerClick(p)}
                    >
                      <span className={`text-xs font-mono w-6 text-slate-500 ${idx < 3 ? 'text-amber-400 font-bold' : ''}`}>#{idx + 1}</span>
                      <div>
                        <div className="font-bold text-white group-hover:text-amber-400 transition-colors">{p.player}</div>
                        <div className="text-[10px] text-slate-500">{p.team}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-mono font-bold text-amber-400 text-base">{p.totalKills}</span>
                      <ProgressBar value={p.totalKills} max={maxStats.kills} colorClass="bg-amber-500" />
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className={`font-mono font-bold px-2 py-1 rounded text-xs ${Number(p.kpg) > 1.5 ? 'bg-amber-500/10 text-amber-300' : 'text-slate-400'}`}>
                      {p.kpg}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-mono font-bold text-rose-400">{p.headshots || 0}</span>
                      <ProgressBar value={p.headshots || 0} max={maxStats.headshots} colorClass="bg-rose-500" />
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-mono font-bold text-orange-400">{p.knockdowns || 0}</span>
                      <ProgressBar value={p.knockdowns || 0} max={maxStats.knockdowns} colorClass="bg-orange-500" />
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center text-slate-400 font-mono">
                     {p.matches ? ((p.knockdowns || 0) / p.matches).toFixed(2) : '0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- TABLE 2: UTILITY & SUPPORT --- */}
      <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-600"></div>
        
        <div className="p-5 border-b border-white/5 bg-black/20 flex items-center gap-3">
           <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-500/20">
              <Shield className="w-5 h-5 text-cyan-400" />
           </div>
           <div>
              <h3 className="font-bold text-white text-lg">Utilidade & Suporte</h3>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Gelos • Sobrevivência • Revives</p>
           </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <HeaderCell label="Jogador" sortKey="player" activeSort={utilitySort} type="utility" />
                <HeaderCell label="Gelos Usados" sortKey="gloowalls" activeSort={utilitySort} type="utility" icon={Shield} align="center" />
                <HeaderCell label="Gelos Destruídos" sortKey="gloowallsDestroyed" activeSort={utilitySort} type="utility" icon={Target} align="center" />
                <HeaderCell label="Reviveu" sortKey="revives" activeSort={utilitySort} type="utility" icon={Heart} align="center" />
                <HeaderCell label="Aliados Reviv." sortKey="alliesRevived" activeSort={utilitySort} type="utility" icon={Activity} align="center" />
                <HeaderCell label="Partidas" sortKey="matches" activeSort={utilitySort} type="utility" icon={Trophy} align="center" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {utilityData.slice(0, 50).map((p, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-4 py-3">
                    <div 
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => onPlayerClick && onPlayerClick(p)}
                    >
                      <span className={`text-xs font-mono w-6 text-slate-500 ${idx < 3 ? 'text-cyan-400 font-bold' : ''}`}>#{idx + 1}</span>
                      <div>
                        <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">{p.player}</div>
                        <div className="text-[10px] text-slate-500">{p.team}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-mono font-bold text-cyan-400 text-base">{p.gloowalls || 0}</span>
                      <ProgressBar value={p.gloowalls || 0} max={maxStats.gloowalls} colorClass="bg-cyan-500" />
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="font-mono font-bold text-blue-400">{p.gloowallsDestroyed || 0}</span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-mono font-bold text-emerald-400">{p.revives || 0}</span>
                      <ProgressBar value={p.revives || 0} max={maxStats.revives} colorClass="bg-emerald-500" />
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="font-mono font-bold text-green-300">{p.alliesRevived || 0}</span>
                  </td>

                  <td className="px-4 py-3 text-center">
                     <span className="inline-block px-2 py-1 bg-slate-800 rounded text-slate-300 font-mono text-xs border border-slate-700">
                        {p.matches}
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
