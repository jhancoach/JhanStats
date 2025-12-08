import React, { useState, useMemo } from 'react';
import { KillStat } from '../types';
import { 
  Search, 
  X, 
  Plus, 
  Trophy, 
  FileText, 
  Target, 
  Calendar, 
  Globe, 
  Skull, 
  UserMinus, 
  Shield, 
  Heart, 
  TrendingUp,
  ArrowLeft,
  Printer,
  Swords,
  Eye,
  Trash2,
  Users
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

interface ScoutViewProps {
  allPlayers: KillStat[];
}

export const ScoutView: React.FC<ScoutViewProps> = ({ allPlayers }) => {
  const [selectedPlayers, setSelectedPlayers] = useState<KillStat[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);
  const [viewingPlayer, setViewingPlayer] = useState<KillStat | null>(null);

  // Filter players for selection list
  const filteredList = useMemo(() => {
    return allPlayers
      .filter(p => 
        p.player.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !selectedPlayers.find(s => s.player === p.player)
      )
      .slice(0, 20); // Limit results for performance
  }, [allPlayers, searchTerm, selectedPlayers]);

  const handleAddPlayer = (player: KillStat) => {
    if (selectedPlayers.length < 5) {
      setSelectedPlayers([...selectedPlayers, player]);
      setSearchTerm('');
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.player !== playerId));
    if (viewingPlayer?.player === playerId) {
      setViewingPlayer(null);
    }
  };

  const handleGenerate = () => {
    if (selectedPlayers.length > 0) {
      setIsGenerated(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : '??';

  if (isGenerated) {
    return (
      <div className="flex flex-col gap-8 animate-fade-in pb-20">
        {/* CSS para Impressão */}
        <style>{`
          @media print {
            @page {
              margin: 0;
              size: auto;
            }
            body * {
              visibility: hidden;
            }
            #printable-scout-report, #printable-scout-report * {
              visibility: visible;
            }
            #printable-scout-report {
              position: absolute;
              left: 0;
              top: 0;
              width: 100vw;
              min-height: 100vh;
              background-color: #0B0F19 !important;
              color: white !important;
              padding: 0;
              z-index: 9999;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-page-break {
              break-after: always;
              page-break-after: always;
              height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              padding: 40px;
              box-sizing: border-box;
            }
            .no-print {
              display: none !important;
            }
            /* Esconder scrollbars na impressão */
            ::-webkit-scrollbar {
              display: none;
            }
          }
        `}</style>

        {/* Toolbar (Hidden on Print) */}
        <div className="flex items-center justify-between bg-[#0B0F19] border border-white/10 p-4 rounded-2xl sticky top-24 z-40 shadow-2xl print:hidden no-print">
           <button 
             onClick={() => setIsGenerated(false)}
             className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
           >
             <ArrowLeft className="w-4 h-4" /> Voltar para Seleção
           </button>
           <div className="flex items-center gap-4">
             <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">
               {selectedPlayers.length} Jogadores Selecionados
             </span>
             <button 
               onClick={handlePrint}
               className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
             >
               <Printer className="w-4 h-4" /> Imprimir / PDF
             </button>
           </div>
        </div>

        {/* Render Profiles */}
        <div id="printable-scout-report" className="space-y-12 print:space-y-0 print:block">
          {selectedPlayers.map((player, index) => (
            <div key={player.player} className="print-page-break">
               <ScoutPlayerCard player={player} isPrintMode={true} />
               {index < selectedPlayers.length - 1 && <div className="h-px bg-white/10 w-full my-12 print:hidden no-print"></div>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Scout Report</h2>
        <p className="text-slate-400">Monte seu time de análise. Selecione até 5 jogadores para comparar ou visualizar detalhes.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Column: Selection Area */}
          <div className="flex-1 glass-panel border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col min-h-[500px]">
             
             {/* Search Input */}
             <div className="relative mb-6 z-10 shrink-0">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Buscar jogador..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors text-lg"
                />
             </div>

             {/* Search Results Dropdown */}
             {searchTerm && (
               <div className="absolute top-[80px] left-6 right-6 z-50 border border-white/10 rounded-xl overflow-hidden bg-[#0B0F19] shadow-2xl max-h-[300px] overflow-y-auto custom-scrollbar animate-fade-in">
                  {filteredList.map(p => (
                    <button 
                      key={p.player}
                      onClick={() => handleAddPlayer(p)}
                      disabled={selectedPlayers.length >= 5}
                      className="w-full flex items-center justify-between p-4 hover:bg-white/5 border-b border-white/5 last:border-0 text-left group transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400">
                            {getInitials(p.player)}
                          </div>
                          <div>
                            <div className="font-bold text-white">{p.player}</div>
                            <div className="text-xs text-slate-500">{p.team}</div>
                          </div>
                       </div>
                       <div className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-5 h-5" />
                       </div>
                    </button>
                  ))}
                  {filteredList.length === 0 && (
                    <div className="p-4 text-center text-slate-500">Nenhum jogador encontrado.</div>
                  )}
               </div>
             )}

             {/* Selected Players Cards Grid - Scrollable if many */}
             <div className="flex-1 overflow-y-auto custom-scrollbar mb-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between sticky top-0 bg-[#0F172A]/90 backdrop-blur py-2 z-10">
                   <span>Jogadores Selecionados ({selectedPlayers.length}/5)</span>
                   {selectedPlayers.length > 0 && (
                       <span className="text-indigo-400 text-[10px] normal-case tracking-normal bg-indigo-500/10 px-2 py-1 rounded">Clique no card para detalhes</span>
                   )}
                </h3>
                
                {selectedPlayers.length === 0 ? (
                    <div className="border-2 border-dashed border-white/5 rounded-2xl h-64 flex flex-col items-center justify-center text-slate-600 gap-3">
                        <UserMinus className="w-10 h-10 opacity-50" />
                        <span>Nenhum jogador selecionado ainda.</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
                        {selectedPlayers.map(p => (
                            <div 
                                key={p.player} 
                                onClick={() => setViewingPlayer(p)}
                                className="group relative bg-[#0B0F19] border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/5 hover:border-indigo-500/50 transition-all duration-300 shadow-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-white/5 font-bold text-sm text-white shadow-lg group-hover:from-indigo-900 group-hover:to-slate-900 transition-colors shrink-0">
                                        {getInitials(p.player)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-white text-base truncate group-hover:text-indigo-300 transition-colors">{p.player}</div>
                                        <div className="text-xs text-slate-400 truncate mb-1">{p.team}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-slate-300 border border-white/5 font-mono">{p.totalKills} Kills</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleRemovePlayer(p.player); }}
                                        className="p-2 rounded-lg bg-white/5 text-slate-500 hover:bg-red-500/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 absolute top-2 right-2"
                                        title="Remover"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        ))}
                    </div>
                )}
             </div>

             {/* Action Button - Always visible at bottom */}
             <div className="mt-auto shrink-0 pt-4 border-t border-white/5">
                 <button 
                   onClick={handleGenerate}
                   disabled={selectedPlayers.length === 0}
                   className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                     selectedPlayers.length > 0 
                     ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-600/20 hover:scale-[1.01]' 
                     : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                   }`}
                 >
                   <Users className="w-5 h-5" />
                   Ver Todos (Gerar Relatório)
                 </button>
             </div>
          </div>
      </div>

      {/* Single Player Preview Modal */}
      {viewingPlayer && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div 
                className="fixed inset-0 bg-black/95 backdrop-blur-md transition-opacity" 
                onClick={() => setViewingPlayer(null)}
             ></div>
             
             <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0B0F19] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
                 
                 {/* Modal Header */}
                 <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                     <h3 className="font-bold text-white flex items-center gap-2">
                         <Eye className="w-4 h-4 text-indigo-400" /> 
                         Visualização Rápida
                     </h3>
                     <button 
                        onClick={() => setViewingPlayer(null)}
                        className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                     >
                         <X className="w-5 h-5" />
                     </button>
                 </div>

                 {/* Modal Content - Reusing the Card Component */}
                 <div className="overflow-y-auto custom-scrollbar p-6">
                     <ScoutPlayerCard player={viewingPlayer} />
                 </div>

                 {/* Modal Footer Actions */}
                 <div className="p-4 border-t border-white/5 bg-black/20 flex justify-end gap-3">
                     <button 
                        onClick={() => handleRemovePlayer(viewingPlayer.player)}
                        className="px-4 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm font-bold transition-colors"
                     >
                        Remover da Lista
                     </button>
                     <button 
                        onClick={() => setViewingPlayer(null)}
                        className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors"
                     >
                        Fechar
                     </button>
                 </div>
             </div>
         </div>
      )}
    </div>
  );
};

// --- Helper Component: Individual Scout Player Card (Matches specific design) ---
const ScoutPlayerCard: React.FC<{ player: KillStat; isPrintMode?: boolean }> = ({ player, isPrintMode }) => {
  
  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : '??';

  // Process data for Chart & Split Cards
  const seasonData = useMemo(() => {
    // Prioritize FFWS/WB Data
    const seasons = [
      { key: 'wb2025s2', label: 'WB 25 S2' },
      { key: 'wb2025s1', label: 'WB 25 S1' },
      { key: 'wb2024s2', label: 'WB 24 S2' },
      { key: 'wb2024s1', label: 'WB 24 S1' },
    ];

    return seasons.map(season => {
      const rawData = (player as any)[season.key];
      let kills = 0;
      let matches = 0;

      if (rawData && rawData !== '- (-)' && rawData !== '0 (0)') {
        if (typeof rawData === 'string') {
            const parts = rawData.split(' (');
            kills = parseInt(parts[0], 10) || 0;
            if (parts[1]) matches = parseInt(parts[1].replace(')', ''), 10) || 0;
        } else if (typeof rawData === 'number') {
            kills = rawData;
            matches = 0; 
        }
      } else {
          const kKey = `kills${season.key.replace('wb20', '')}`; 
          if ((player as any)[kKey]) {
              kills = (player as any)[kKey];
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

  return (
    <div className="w-full">
      {/* 1. Header Hero */}
      <div className="bg-[#0B0F19] rounded-3xl p-6 md:p-8 border border-white/10 relative overflow-hidden shadow-2xl mb-6 print:border-slate-500 print:shadow-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none print:hidden"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 flex items-center justify-center text-4xl font-black text-white shadow-lg shadow-indigo-500/20 shrink-0 print:border print:border-slate-300 print:text-black print:bg-white">
                    {getInitials(player.player)}
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider print:border-amber-600 print:text-amber-600">
                            <Trophy className="w-3 h-3 fill-current" /> Rank #{player.rank}
                        </span>
                        <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs font-bold uppercase tracking-wider print:text-slate-600 print:border-slate-300">
                            {player.team}
                        </span>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-1 print:text-black">
                        {player.player}
                    </h1>
                    <p className="text-slate-400 text-xs max-w-md print:text-slate-600">
                        Análise completa de desempenho. Dados consolidados de todas as competições oficiais rastreadas (FFWSBR & World Series).
                    </p>
                </div>
            </div>
            <div className="text-right flex flex-col items-end">
                <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1 print:text-slate-600">Total Geral</div>
                <div className="text-5xl font-mono font-bold text-white tracking-tight print:text-black">{player.totalKills}</div>
                <div className="text-indigo-400 text-xs font-bold mt-1 print:text-indigo-600">Abates Confirmados</div>
            </div>
        </div>
      </div>

      {/* 2. Stats Grid (4 Cols x 2 Rows) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Row 1 */}
          <StatBox icon={Swords} label="Total Abates" value={player.totalKills} subLabel="Total Carreira" color="indigo" />
          <StatBox icon={Target} label="Média (KPG)" value={player.kpg} subLabel="Média/Jogo" color="amber" />
          <StatBox icon={Calendar} label="Total Quedas" value={player.matches} subLabel="Partidas" color="blue" />
          <StatBox icon={Globe} label="WB Performance" value={player.totalKills} subLabel="Consolidado" color="emerald" />
          
          {/* Row 2 - Detailed Combat */}
          <StatBox icon={Skull} label="Capas" value={player.headshots || 0} subLabel={`Média: ${player.matches ? ((player.headshots||0)/player.matches).toFixed(2) : 0}`} color="rose" />
          <StatBox icon={UserMinus} label="Derrubados" value={player.knockdowns || 0} subLabel={`Média: ${player.matches ? ((player.knockdowns||0)/player.matches).toFixed(2) : 0}`} color="orange" />
          <StatBox icon={Shield} label="Gelos" value={player.gloowalls || 0} subLabel="Walls Utilizados" color="cyan" />
          <StatBox icon={Heart} label="Revividos" value={player.revives || 0} subLabel="Aliados Salvos" color="green" />
      </div>

      {/* 3. Evolution Chart & Split History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chart */}
          <div className="lg:col-span-2 bg-[#0B0F19] rounded-2xl p-6 border border-white/10 print:border-slate-500">
             <h3 className="flex items-center gap-2 font-bold text-white mb-6 print:text-black">
               <TrendingUp className="w-5 h-5 text-indigo-400 print:text-indigo-600" />
               Evolução Temporal de Performance
             </h3>
             <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={seasonData.slice().reverse()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`grad-${player.player}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} />
                        {!isPrintMode && (
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        )}
                        <Area 
                            type="monotone" 
                            dataKey="kills" 
                            stroke="#818cf8" 
                            strokeWidth={3} 
                            fill={isPrintMode ? '#818cf8' : `url(#grad-${player.player})`} 
                            fillOpacity={isPrintMode ? 0.2 : 1}
                            activeDot={{r: 6, strokeWidth: 0, fill: '#fff'}}
                            animationDuration={isPrintMode ? 0 : 1000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Split History Cards */}
          <div className="flex flex-col gap-3">
             <div className="flex items-center gap-2 font-bold text-amber-400 mb-2 print:text-amber-600">
               <Target className="w-4 h-4" /> Histórico Detalhado por Split
             </div>
             {seasonData.map((s) => (
                <div key={s.id} className="bg-[#0f1420] border border-white/5 p-4 rounded-xl relative overflow-hidden group hover:border-white/10 transition-colors print:bg-white print:border-slate-300 print:text-black">
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-xl"></div>
                   <div className="flex justify-between items-start mb-2 pl-2">
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider print:text-slate-600">{s.name}</div>
                        <div className="text-2xl font-bold text-white font-mono print:text-black">{s.kills} <span className="text-xs text-slate-500 font-sans font-normal">Kills</span></div>
                      </div>
                      <div className="px-2 py-1 bg-white/5 rounded text-[10px] text-slate-400 border border-white/5 print:border-slate-300 print:text-slate-600">
                        {s.matches} Quedas
                      </div>
                   </div>
                   <div className="pl-2 flex items-center justify-between">
                      <span className="text-xs text-slate-500 print:text-slate-600">Média (KPG)</span>
                      <span className={`font-mono font-bold ${Number(s.kpg) > 2 ? 'text-emerald-400 print:text-emerald-600' : 'text-indigo-400 print:text-indigo-600'}`}>{s.kpg}</span>
                   </div>
                   {/* Mini Progress Bar for KPG visual */}
                   <div className="mt-2 pl-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden print:bg-slate-200">
                      <div className="h-full bg-indigo-500" style={{width: `${Math.min(100, (Number(s.kpg) / 3) * 100)}%`}}></div>
                   </div>
                </div>
             ))}
             {seasonData.length === 0 && (
                <div className="p-4 text-center text-slate-500 text-xs bg-[#0f1420] rounded-xl border border-white/5">Sem histórico de splits recente.</div>
             )}
          </div>

      </div>
    </div>
  );
};

const StatBox = ({ icon: Icon, label, value, subLabel, color }: any) => {
  // Map color to classes
  const colorMap: any = {
    indigo: { icon: 'text-indigo-400 print:text-indigo-600', bg: 'bg-indigo-500/10 print:bg-indigo-100' },
    amber: { icon: 'text-amber-400 print:text-amber-600', bg: 'bg-amber-500/10 print:bg-amber-100' },
    blue: { icon: 'text-blue-400 print:text-blue-600', bg: 'bg-blue-500/10 print:bg-blue-100' },
    emerald: { icon: 'text-emerald-400 print:text-emerald-600', bg: 'bg-emerald-500/10 print:bg-emerald-100' },
    rose: { icon: 'text-rose-400 print:text-rose-600', bg: 'bg-rose-500/10 print:bg-rose-100' },
    orange: { icon: 'text-orange-400 print:text-orange-600', bg: 'bg-orange-500/10 print:bg-orange-100' },
    cyan: { icon: 'text-cyan-400 print:text-cyan-600', bg: 'bg-cyan-500/10 print:bg-cyan-100' },
    green: { icon: 'text-green-400 print:text-green-600', bg: 'bg-green-500/10 print:bg-green-100' },
  };
  const theme = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors print:bg-white print:border-slate-300 print:text-black">
       <div className={`p-3 rounded-xl ${theme.bg}`}>
          <Icon className={`w-6 h-6 ${theme.icon}`} />
       </div>
       <div>
          <div className="text-2xl font-bold text-white font-mono print:text-black">{value}</div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider print:text-slate-600">{label}</div>
          <div className="text-[10px] text-slate-600 mt-0.5 print:text-slate-500">{subLabel}</div>
       </div>
    </div>
  );
};