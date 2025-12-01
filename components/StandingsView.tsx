import React, { useState, useEffect } from 'react';
import { Trophy, Target, Calendar, Crown, Medal, Shield, AlertCircle, RefreshCw, Swords, Hash, Crosshair, Zap, Award } from 'lucide-react';

// URLs exatas fornecidas
const URLS = {
  wb2024s1: {
    standings: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRJjpnym14zy_V08qtJL1ylXFwhTBLBlF2lo6-3i_tpD0ub-K4T4gL-lIkLsXNjBXjpNPMPsM7jQJRE/pub?output=csv',
    mvp1: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQNx0l_6FLYnBfpKKmQU94X0QuZNam_dE2PHeb2GPGnR7EwDknvCdgL3NYiEci_UPf9E2R1jEHfem6v/pub?output=csv',
    mvp2: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSEE-PoWksCodxZtskMVH049oDXIXbgZYXAaUs1y8N63Md8xR9QgWV7AHKHOobrgCuDpTrj7eyBKUJA/pub?output=csv'
  },
  wb2024s2: {
    standings: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSxEcCXVyZVl-5ueEYQFiLR9F_pE8k5cMGI3TP_LknjSOq8bAC-1_YjhtUQ72FdHaO0GI34UgWhzbbA/pub?output=csv'
  },
  wb2025s1: {
    general: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRIGjevwYKHJQTfXCIhUhPM3UqIpg1ve5Bb_EBfNhI_2-cJGfAHGF6CED2GhG3djr6v41IpZdNKC--o/pub?output=csv',
    final: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPUjSwdLlVq2-_Dt7ySCurkOS9ANILFjTEYXaLD6ny85Cbf2oGJBvMWHKE7e8uNZt5dExJxQlCWmq0/pub?output=csv'
  },
  wb2025s2: {
    general: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS0Yh4_LWRP3rasD8M0yOJa9THXTG3gBLnM8le1_1GksEXzE0-lSo-mlj8K2r27y9xL65lyhE-JiKYr/pub?output=csv',
    pointrush: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPuPK419r-L_oufjyZzK4olB6UL3l-qPI0FTHOEIlBDi2OBP_KjGloh87IESg54-etLHvORsQ6rzSr/pub?output=csv',
    final: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT21jScCfL_hKDmalL1BcU0OLlBQZcx-ldyMP9Y79OWDkWDYM_AogB-BafJ_FXXQcKp3IO99vwImCqP/pub?output=csv'
  }
};

type SeasonKey = 'wb2024s1' | 'wb2024s2' | 'wb2025s1' | 'wb2025s2';
type StageKey = 'main' | 'general' | 'pointrush' | 'final';

interface TeamStanding {
  rank: number;
  team: string;
  points: number;
  booyahs: number;
  kills: number;
  matches: number;
}

interface MVPStanding {
  rank: number;
  player: string;
  team: string;
  kills: number;
  damage: string; // Keeping as string to preserve format like '73.515'
  assists: number;
  mvpCount: number;
  value?: string; // Fallback for simple display if needed
}

export const StandingsView: React.FC = () => {
  const [activeSeason, setActiveSeason] = useState<SeasonKey>('wb2024s1');
  const [activeStage, setActiveStage] = useState<StageKey>('general');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const [teamData, setTeamData] = useState<TeamStanding[]>([]);
  const [mvpData1, setMvpData1] = useState<MVPStanding[]>([]);
  const [mvpData2, setMvpData2] = useState<MVPStanding[]>([]);

  // Reset stage when season changes
  const handleSeasonChange = (season: SeasonKey) => {
      setActiveSeason(season);
      if (season === 'wb2024s1' || season === 'wb2024s2') setActiveStage('main');
      else setActiveStage('general');
  };

  const parseCSV = (csv: string, type: 'team' | 'mvp'): any[] => {
      if (!csv) return [];
      const lines = csv.replace(/\r/g, '').split('\n').filter(l => l.trim() !== '');
      if (lines.length < 2) return [];

      // Detect separator (comma or semicolon)
      let separator = ',';
      if (lines[0].indexOf(',') === -1 && lines[0].indexOf(';') !== -1) {
          separator = ';';
      }

      let headerRowIdx = -1;
      let headers: string[] = [];

      // 1. Try to find the header row by looking for known columns in first 20 lines
      for (let i = 0; i < Math.min(lines.length, 20); i++) {
          const row = lines[i].split(separator).map(c => c.toLowerCase().trim());
          
          const hasRank = row.some(c => c.includes('rank') || c === '#' || c === 'pos');
          const hasName = row.some(c => c.includes('team') || c.includes('time') || c.includes('equipe') || c.includes('player') || c.includes('jogador') || c.includes('nome'));
          const hasPoints = row.some(c => c.includes('pts') || c.includes('pontos') || c.includes('points') || c.includes('total') || c.includes('score'));
          const hasKills = row.some(c => c.includes('kill') || c.includes('abates'));

          // If we find at least Name+Points or Name+Kills, assumes this is the header
          if ((hasName && hasPoints) || (hasName && hasKills) || (hasRank && hasName)) {
              headerRowIdx = i;
              headers = row;
              break;
          }
      }

      // Fallback: If no header found, assume row 0 is header
      if (headerRowIdx === -1) {
          headerRowIdx = 0;
          headers = lines[0].split(separator).map(h => h.toLowerCase().trim());
      }
      
      // Determine indices
      let idxRank = headers.findIndex(h => h.includes('rank') || h === '#' || h === 'pos');
      
      const idxName = headers.findIndex(h => 
          h === 'team' || h === 'time' || h === 'equipe' ||
          h === 'player' || h === 'jogador' || h === 'nome' || 
          h.includes('team') || h.includes('time') || h.includes('player')
      );

      const idxTeamName = headers.findIndex(h => h === 'team' || h === 'time' || h === 'equipe'); 
      
      const idxPts = headers.findIndex(h => h.includes('pts') || h.includes('pontos') || h.includes('points') || h.includes('total') || h === 'p');
      const idxBooyah = headers.findIndex(h => h.includes('booyah') || h.includes('win') || h.includes('vitoria') || h === 'b');
      const idxKills = headers.findIndex(h => h.includes('kill') || h.includes('abates') || h === 'k' || h.includes('abate'));
      const idxMatches = headers.findIndex(h => h.includes('match') || h.includes('queda') || h.includes('jogo') || h === 'j' || h === 'q');
      
      // MVP specific
      const idxDamage = headers.findIndex(h => h.includes('dano') || h.includes('damage'));
      const idxAssists = headers.findIndex(h => h.includes('assist') || h.includes('asist'));
      const idxMvpCount = headers.findIndex(h => h.includes('mvp') || h.includes('qtdade'));

      // Helper functions for cleaning data
      const cleanString = (val: string) => val ? val.replace(/^"|"$/g, '').trim() : '';
      const cleanNumber = (val: string) => {
          if (!val) return 0;
          let v = val.replace(/^"|"$/g, '').trim();
          if (v === '-' || v === '') return 0;
          
          // CRITICAL FIX: Handle Brazilian format (1.402 -> 1402)
          // Removing dots allows parseInt to read the full number
          v = v.replace(/\./g, '');
          
          return parseInt(v) || 0;
      };

      // Process Data
      return lines.slice(headerRowIdx + 1).map((line, idx) => {
          const row = line.split(separator);
          if (row.length < 2) return null;

          // Rank Logic: If explicit rank column exists, use it. Otherwise, use row index + 1.
          let rank = idx + 1;
          if (idxRank !== -1) {
              const rVal = cleanString(row[idxRank]);
              // Only use explicit rank if it's a number
              const parsed = parseInt(rVal.replace(/\./g, ''));
              if (!isNaN(parsed)) rank = parsed;
          }

          if (type === 'team') {
              const teamName = cleanString(row[idxName]);
              // Skip rows without a team name
              if (!teamName) return null;

              return {
                  rank,
                  team: teamName,
                  points: cleanNumber(row[idxPts]),
                  booyahs: cleanNumber(row[idxBooyah]),
                  kills: cleanNumber(row[idxKills]),
                  matches: cleanNumber(row[idxMatches]),
              };
          } else {
              // MVP parsing
              const playerName = cleanString(row[idxName]);
              if (!playerName) return null;

              return {
                  rank,
                  player: playerName,
                  team: idxTeamName > -1 ? (cleanString(row[idxTeamName]) || '-') : '-',
                  kills: cleanNumber(row[idxKills]),
                  damage: cleanString(row[idxDamage]) || '-',
                  assists: cleanNumber(row[idxAssists]),
                  mvpCount: cleanNumber(row[idxMvpCount]),
                  value: cleanString(row[idxKills]) || '0'
              };
          }
      }).filter(Boolean);
  };

  const fetchData = async () => {
    setLoading(true);
    setTeamData([]);
    setMvpData1([]);
    setMvpData2([]);

    try {
      let url = '';
      
      // Select URL
      if (activeSeason === 'wb2024s1') {
          url = URLS.wb2024s1.standings;
          // MVPs
          const [r1, r2] = await Promise.all([
              fetch(URLS.wb2024s1.mvp1).then(r => r.text()),
              fetch(URLS.wb2024s1.mvp2).then(r => r.text())
          ]);
          setMvpData1(parseCSV(r1, 'mvp'));
          setMvpData2(parseCSV(r2, 'mvp'));
      } 
      else if (activeSeason === 'wb2024s2') {
          url = URLS.wb2024s2.standings;
      }
      else if (activeSeason === 'wb2025s1') {
          url = activeStage === 'final' ? URLS.wb2025s1.final : URLS.wb2025s1.general;
      }
      else if (activeSeason === 'wb2025s2') {
          if (activeStage === 'final') url = URLS.wb2025s2.final;
          else if (activeStage === 'pointrush') url = URLS.wb2025s2.pointrush;
          else url = URLS.wb2025s2.general;
      }

      if (url) {
          const response = await fetch(url);
          const text = await response.text();
          const parsed = parseCSV(text, 'team');
          setTeamData(parsed);
          setLastUpdated(new Date());
      }

    } catch (error) {
      console.error("Error fetching standings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeSeason, activeStage]);

  // Define SubTabs based on Season
  const getSubTabs = () => {
      if (activeSeason === 'wb2025s1') {
          return [
              { id: 'general', label: 'Classificação Geral' },
              { id: 'final', label: 'Final WB 2025 S1' }
          ];
      }
      if (activeSeason === 'wb2025s2') {
          return [
              { id: 'general', label: 'Sem Final Sem CS' },
              { id: 'pointrush', label: 'Point Rush WB 2025 S2' },
              { id: 'final', label: 'Final WB 2025 S2' }
          ];
      }
      return [];
  };

  const subTabs = getSubTabs();

  return (
    <div className="animate-fade-in space-y-6">
       
       {/* Season Selection */}
       <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'wb2024s1', label: 'WB 2024 S1' },
              { id: 'wb2024s2', label: 'WB 2024 S2' },
              { id: 'wb2025s1', label: 'WB 2025 S1' },
              { id: 'wb2025s2', label: 'WB 2025 S2' },
            ].map((season) => (
               <button
                  key={season.id}
                  onClick={() => handleSeasonChange(season.id as SeasonKey)}
                  className={`px-5 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border ${
                      activeSeason === season.id 
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                      : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'
                  }`}
               >
                  <Calendar className="w-4 h-4" />
                  {season.label}
               </button>
            ))}
          </div>
          <button 
             onClick={fetchData}
             className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
             title="Recarregar Dados"
          >
             <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
       </div>

       {/* Sub-Tabs (Stages) */}
       {subTabs.length > 0 && (
           <div className="flex flex-wrap gap-2 p-1 bg-black/40 border border-white/5 rounded-xl w-fit backdrop-blur-sm">
               {subTabs.map(tab => (
                   <button
                       key={tab.id}
                       onClick={() => setActiveStage(tab.id as StageKey)}
                       className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                           activeStage === tab.id
                           ? 'bg-white/10 text-white shadow-inner'
                           : 'text-slate-500 hover:text-slate-300'
                       }`}
                   >
                       {tab.label}
                   </button>
               ))}
           </div>
       )}

       {/* Loading State */}
       {loading && (
           <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-4 glass-panel rounded-2xl">
               <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
               <span className="font-mono text-xs uppercase tracking-widest">Carregando Classificação...</span>
           </div>
       )}

       {/* Content Area */}
       {!loading && (
           <div className="flex flex-col gap-6">
               
               {/* Main Standings Table */}
               <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-col">
                   <div className="p-5 border-b border-white/5 bg-black/20 flex justify-between items-center">
                       <h3 className="font-bold text-white flex items-center gap-2">
                           <Trophy className="w-5 h-5 text-amber-500" />
                           Tabela de Classificação
                       </h3>
                       <div className="text-right">
                           <div className="text-xs text-slate-500 uppercase font-mono">
                               {activeSeason.toUpperCase().replace('WB', 'WB ')} • {activeStage.toUpperCase()}
                           </div>
                           <div className="text-[10px] text-slate-600">
                               Atualizado: {lastUpdated.toLocaleTimeString()}
                           </div>
                       </div>
                   </div>
                   
                   <div className="overflow-x-auto custom-scrollbar">
                       <table className="w-full text-left border-collapse">
                           <thead>
                               <tr className="text-[10px] uppercase text-slate-500 font-bold tracking-wider bg-white/5">
                                   <th className="px-4 py-3 text-center w-16">Rank</th>
                                   <th className="px-4 py-3">Equipe</th>
                                   <th className="px-4 py-3 text-center">Booyahs</th>
                                   <th className="px-4 py-3 text-center">Pontos</th>
                                   <th className="px-4 py-3 text-center">Abates</th>
                                   <th className="px-4 py-3 text-center">Quedas</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5 text-sm">
                               {teamData.map((team, idx) => (
                                   <tr key={idx} className={`hover:bg-white/5 transition-colors ${idx < 3 ? 'bg-indigo-500/5' : ''}`}>
                                       <td className="px-4 py-3 text-center">
                                           <div className={`w-8 h-8 mx-auto flex items-center justify-center rounded-lg font-bold ${
                                               team.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-black shadow-lg shadow-amber-500/20' :
                                               team.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-black' :
                                               team.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-red-500 text-black' :
                                               'text-slate-500 bg-white/5'
                                           }`}>
                                               {team.rank}
                                           </div>
                                       </td>
                                       <td className="px-4 py-3 font-bold text-white">
                                           {team.team}
                                           {idx === 0 && <Crown className="w-3 h-3 text-amber-500 inline ml-2 -mt-1" />}
                                       </td>
                                       <td className="px-4 py-3 text-center text-slate-400">
                                           {team.booyahs > 0 ? (
                                               <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs">
                                                  <Target className="w-3 h-3" /> {team.booyahs}
                                               </span>
                                           ) : '-'}
                                       </td>
                                       <td className="px-4 py-3 text-center">
                                           <span className="font-mono font-black text-lg text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                                               {team.points}
                                           </span>
                                       </td>
                                       <td className="px-4 py-3 text-center text-slate-300 font-mono">
                                            {team.kills > 0 ? (
                                                <span className="flex items-center justify-center gap-1">
                                                    <Swords className="w-3 h-3 text-slate-500" /> {team.kills}
                                                </span>
                                            ) : '-'}
                                       </td>
                                       <td className="px-4 py-3 text-center text-slate-400 font-mono">
                                            {team.matches > 0 ? (
                                                <span className="flex items-center justify-center gap-1">
                                                     <Hash className="w-3 h-3 text-slate-600" /> {team.matches}
                                                </span>
                                            ) : '-'}
                                       </td>
                                   </tr>
                               ))}
                               {teamData.length === 0 && (
                                   <tr>
                                       <td colSpan={6} className="px-4 py-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                                           <AlertCircle className="w-8 h-8 opacity-50" />
                                           <div className="text-lg font-medium">Nenhuma informação encontrada</div>
                                           <div className="text-xs opacity-50 max-w-xs text-center">
                                               Não foi possível ler os dados da planilha. Verifique a URL ou tente novamente mais tarde.
                                           </div>
                                       </td>
                                   </tr>
                               )}
                           </tbody>
                       </table>
                   </div>
               </div>

               {/* MVP Detailed Lists (If available - Specific to WB2024S1) */}
               {activeSeason === 'wb2024s1' && (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      <MVPTable title="Troféus Kaspersky MVP" data={mvpData1} color="emerald" />
                      <MVPTable title="Troféus Kaspersky MVA" data={mvpData2} color="indigo" />
                  </div>
               )}

               {/* General Info Box if no MVP data specific to view */}
               {activeSeason !== 'wb2024s1' && (
                   <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-10">
                           <Medal className="w-32 h-32 text-white rotate-12" />
                       </div>
                       <h4 className="text-lg font-bold text-white mb-2 relative z-10">Sobre a Tabela</h4>
                       <p className="text-sm text-slate-400 leading-relaxed relative z-10 mb-4">
                           Os dados de classificação são extraídos diretamente das planilhas oficiais. A pontuação inclui pontos de colocação e abates.
                       </p>
                       <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl relative z-10 flex gap-3">
                           <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                           <div className="text-xs text-amber-200">
                               Dados sincronizados em tempo real com os registros da competição.
                           </div>
                       </div>
                   </div>
               )}
           </div>
       )}
    </div>
  );
};

const MVPTable = ({ title, data, color }: { title: string, data: MVPStanding[], color: string }) => {
    const colorClasses = {
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    };
    
    // @ts-ignore
    const theme = colorClasses[color] || colorClasses.indigo;

    return (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-white/5 bg-black/20 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${theme}`}>
                    <Shield className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm uppercase tracking-wide">{title}</h3>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-[10px] uppercase text-slate-500 font-bold tracking-wider bg-white/5 border-b border-white/5">
                            <th className="px-3 py-3 w-10 text-center">#</th>
                            <th className="px-3 py-3">Jogador</th>
                            <th className="px-3 py-3">Equipe</th>
                            <th className="px-3 py-3 text-center">Abates</th>
                            <th className="px-3 py-3 text-center">Dano</th>
                            <th className="px-3 py-3 text-center">Assists</th>
                            <th className="px-3 py-3 text-center">MVPs</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {data.map((p, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                <td className="px-3 py-2 text-center">
                                    <div className={`w-6 h-6 mx-auto flex items-center justify-center rounded font-bold text-xs ${idx === 0 ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                                        {p.rank}
                                    </div>
                                </td>
                                <td className="px-3 py-2 font-bold text-white whitespace-nowrap">
                                    {p.player}
                                </td>
                                <td className="px-3 py-2 text-slate-400 text-xs whitespace-nowrap">
                                    {p.team}
                                </td>
                                <td className="px-3 py-2 text-center font-mono text-slate-200">
                                    {p.kills}
                                </td>
                                <td className="px-3 py-2 text-center font-mono text-slate-400 text-xs">
                                    {p.damage}
                                </td>
                                <td className="px-3 py-2 text-center font-mono text-slate-400 text-xs">
                                    {p.assists}
                                </td>
                                <td className="px-3 py-2 text-center">
                                    {p.mvpCount > 0 ? (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-xs font-bold">
                                            {p.mvpCount}
                                        </span>
                                    ) : '-'}
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                             <tr>
                                 <td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-500">Lista vazia.</td>
                             </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
