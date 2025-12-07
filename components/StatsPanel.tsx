import React from 'react';
import { KillStat, EarningStat } from '../types';
import { Crosshair, DollarSign, Crown, TrendingUp, Globe, Swords, Target, Clock, Star } from 'lucide-react';

interface StatsPanelProps {
  killsData: KillStat[];
  activeTab: 'kills' | 'ffwsbr' | 'laff';
}

const StatCard = ({ title, value, sub, icon: Icon, colorClass, gradient }: any) => (
  <div className="glass-panel p-6 rounded-2xl mb-5 relative overflow-hidden group hover:border-white/20 transition-all duration-300">
    <div className={`absolute -top-10 -right-10 p-3 opacity-10 group-hover:opacity-20 transition-opacity duration-300 ${colorClass}`}>
      <Icon className="w-32 h-32 transform rotate-12" />
    </div>
    
    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/40 pointer-events-none"></div>

    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2.5 rounded-xl bg-black/40 border border-white/5 shadow-inner ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h4 className="text-slate-400 text-xs uppercase tracking-widest font-bold">{title}</h4>
      </div>
      <div className="text-3xl font-black text-white font-mono tracking-tighter drop-shadow-lg mb-1">{value}</div>
      <div className="text-xs text-slate-500 font-medium">{sub}</div>
    </div>
    
    {/* Bottom Gradient Line */}
    <div className={`absolute bottom-0 left-0 h-1 w-full ${gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-300`}></div>
  </div>
);

const Top3List = ({ title, data, metricKey, label, icon: Icon, colorClass, valueFormatter }: any) => (
  <div className="glass-panel rounded-2xl p-5 mb-5 hover:border-white/15 transition-colors group">
    <h4 className={`font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2 ${colorClass}`}>
      <Icon className="w-4 h-4" /> {title}
    </h4>
    <div className="space-y-3">
      {data.map((p: any, i: number) => (
        <div key={i} className="flex justify-between items-center text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0 group-hover:border-white/10 transition-colors">
           <div className="flex items-center gap-3">
             <div className={`flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-bold shadow-md ${
               i === 0 ? 'bg-gradient-to-b from-yellow-400 to-amber-600 text-black border border-amber-400' : 
               i === 1 ? 'bg-gradient-to-b from-slate-300 to-slate-500 text-black border border-slate-300' : 
               'bg-gradient-to-b from-orange-400 to-red-600 text-black border border-orange-400'
             }`}>
               {i + 1}
             </div>
             <span className="text-slate-200 font-semibold truncate w-24 group-hover:text-white transition-colors">{p.player}</span>
           </div>
           <div className="text-right">
             <div className="text-white font-mono text-sm font-bold leading-none">
               {valueFormatter ? valueFormatter(p[metricKey]) : p[metricKey]}
             </div>
             <div className="text-[9px] text-slate-500 uppercase tracking-wide mt-0.5">{label}</div>
           </div>
        </div>
      ))}
    </div>
  </div>
);

export const StatsPanel: React.FC<StatsPanelProps> = ({ killsData, activeTab }) => {
  
  // Helper to identify WB Active Players and calculate WB Total Kills
  const getWBInfo = (p: KillStat) => {
      const wbCols = ['wb2024s1', 'wb2024s2', 'wb2025s1', 'wb2025s2'];
      let wbKills = 0;
      let hasActivity = false;

      wbCols.forEach(key => {
        const val = (p as any)[key];
        if (val && val !== '- (-)' && val !== '0 (0)') {
           hasActivity = true;
           const parts = val.split(' (');
           wbKills += parseInt(parts[0], 10) || 0;
        }
      });
      return { hasActivity, wbKills };
  };

  // Logic separation based on Tab
  let top3TotalKills, top3Avg, top3Matches, top3WBKills;

  if (activeTab === 'ffwsbr' || activeTab === 'laff') {
      // For FFWSBR or LAFF tab, the data passed is ALREADY specific so just sort it
      top3TotalKills = [...killsData].sort((a, b) => b.totalKills - a.totalKills).slice(0, 3);
      top3Avg = [...killsData].sort((a, b) => b.kpg - a.kpg).slice(0, 3);
      top3Matches = [...killsData].sort((a, b) => b.matches - a.matches).slice(0, 3);
      top3WBKills = top3TotalKills; // Reuse for simplicity if needed, but likely hidden for Laff
  } else {
      // For standard tab
      const wbActivePlayers = killsData.filter(p => getWBInfo(p).hasActivity);
      top3TotalKills = [...wbActivePlayers].sort((a, b) => b.totalKills - a.totalKills).slice(0, 3);
      top3Avg = [...wbActivePlayers].sort((a, b) => b.kpg - a.kpg).slice(0, 3);
      top3Matches = [...wbActivePlayers].sort((a, b) => b.matches - a.matches).slice(0, 3);
      top3WBKills = wbActivePlayers.map(p => ({
          ...p,
          wbTotalKills: getWBInfo(p).wbKills
      })).sort((a, b) => b.wbTotalKills - a.wbTotalKills).slice(0, 3);
  }

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
       <div>
         <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
               <Star className="w-4 h-4 text-indigo-400 fill-current" />
            </span>
            <span>Highlights</span>
         </h3>
         {activeTab === 'kills' && (
           <p className="text-xs text-slate-400/80 mb-6 pl-1 border-l-2 border-indigo-500/50">
             Ranking via <span className="text-white font-semibold">Liquipedia</span>. <br/>Jogadores ativos no cenário internacional (Era WB).
           </p>
         )}
         {activeTab === 'ffwsbr' && (
           <p className="text-xs text-slate-400/80 mb-6 pl-1 border-l-2 border-indigo-500/50">
             Tratamento de dados <span className="text-indigo-400 font-semibold">Jhan</span>. <br/>Tabela completa FFWS Brasil 2025.
           </p>
         )}
         {activeTab === 'laff' && (
           <p className="text-xs text-slate-400/80 mb-6 pl-1 border-l-2 border-orange-500/50">
             Ranking da <span className="text-orange-400 font-semibold">Liga Amadora</span>. <br/>Tabela de Abates e Estatísticas Gerais.
           </p>
         )}
       </div>

       {/* Top 3 Total Kills */}
       <Top3List 
         title={activeTab === 'ffwsbr' ? "MVP FFWSBR" : activeTab === 'laff' ? "MVP LAFF" : "Reis do Abate"}
         data={top3TotalKills} 
         metricKey="totalKills" 
         label="Total Kills"
         icon={Swords}
         colorClass={activeTab === 'laff' ? "text-orange-400" : "text-amber-400"}
       />

       {/* Top 3 Average */}
       <Top3List 
         title="Maior Impacto (Média)" 
         data={top3Avg} 
         metricKey="kpg" 
         label="Kills / Jogo"
         icon={Target}
         colorClass="text-red-400"
       />

       {/* Top 3 WB Kills - Only show in normal tab, redundant in others */}
       {activeTab === 'kills' && (
           <Top3List 
           title="Lendas World Series" 
           data={top3WBKills} 
           metricKey="wbTotalKills" 
           label="WB Kills"
           icon={Globe}
           colorClass="text-indigo-400"
           />
       )}

       {/* Top 3 Matches */}
       <Top3List 
         title={activeTab === 'ffwsbr' || activeTab === 'laff' ? "Mais Ativos" : "Veteranos (Partidas)"}
         data={top3Matches} 
         metricKey="matches" 
         label="Jogos"
         icon={Clock}
         colorClass="text-blue-400"
       />
    </aside>
  );
};