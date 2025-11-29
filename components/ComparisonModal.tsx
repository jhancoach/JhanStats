import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  Swords,
  ChevronDown,
  TrendingUp,
  Minus,
  Search,
  Printer,
  FileText,
  Filter
} from 'lucide-react';
import { KillStat } from '../types';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: KillStat[];
  activeWbTab?: 'wb2024' | 'wb2025' | 'general';
}

interface ComparisonRowProps {
  label: string;
  p1Data: any;
  p2Data: any;
  type?: 'header' | 'normal' | 'season';
  winner?: 0 | 1 | 2; // 0 = empate, 1 = p1, 2 = p2
}

// Internal Component: Searchable Dropdown
const SearchablePlayerSelect = ({ 
  value, 
  onChange, 
  players, 
  placeholder,
  align = 'left'
}: { 
  value: string, 
  onChange: (val: string) => void, 
  players: KillStat[],
  placeholder: string,
  align?: 'left' | 'right'
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredPlayers = players.filter(p => 
    p.player.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        className="w-full bg-black/50 border border-white/10 rounded-xl p-2 flex items-center cursor-pointer hover:border-white/20 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className={`flex-1 font-bold text-sm md:text-lg truncate ${value ? 'text-white' : 'text-slate-500'} ${align === 'right' ? 'text-right pr-2' : 'text-left pl-2'}`}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
          <div className="p-2 border-b border-slate-700 sticky top-0 bg-slate-900">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 w-3 h-3 text-slate-500" />
              <input 
                type="text" 
                className="w-full bg-slate-800 text-slate-200 text-sm rounded-lg pl-7 pr-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Buscar jogador..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredPlayers.map(p => (
              <div 
                key={p.player}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-indigo-600/20 hover:text-white transition-colors ${p.player === value ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-300'}`}
                onClick={() => {
                  onChange(p.player);
                  setOpen(false);
                  setSearch('');
                }}
              >
                {p.player}
              </div>
            ))}
            {filteredPlayers.length === 0 && (
              <div className="px-4 py-3 text-xs text-slate-500 text-center">Nenhum jogador encontrado</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ComparisonRow: React.FC<ComparisonRowProps> = ({ label, p1Data, p2Data, type = 'normal', winner = 0 }) => {
  const isSeason = type === 'season';
  
  const p1Win = winner === 1;
  const p2Win = winner === 2;

  const p1Color = p1Win ? 'text-amber-400' : 'text-slate-400';
  const p2Color = p2Win ? 'text-cyan-400' : 'text-slate-400';
  const p1Bg = p1Win ? 'bg-amber-500/5' : 'bg-transparent';
  const p2Bg = p2Win ? 'bg-cyan-500/5' : 'bg-transparent';

  return (
    <div className="flex items-stretch min-h-[60px] border-b border-white/5 last:border-0 group hover:bg-white/[0.02] transition-colors">
      {/* Player 1 Side */}
      <div className={`flex-1 flex flex-col justify-center items-end pr-6 py-3 border-r border-white/5 relative ${p1Bg} transition-colors`}>
         {isSeason ? (
             p1Data ? (
               <>
                 <span className={`text-xl font-mono font-bold leading-none ${p1Color}`}>{p1Data.kills}</span>
                 <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-500 font-medium bg-black/40 px-1.5 rounded">{p1Data.matches}J</span>
                    <span className={`text-[11px] font-mono ${p1Win ? 'text-amber-500/80' : 'text-slate-500'}`}>{p1Data.avg} Ø</span>
                 </div>
               </>
             ) : <Minus className="w-4 h-4 text-slate-700" />
         ) : (
             <span className={`text-lg font-mono font-bold ${p1Color}`}>{p1Data}</span>
         )}
         {p1Win && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-full bg-gradient-to-l from-amber-500/20 to-transparent"></div>}
         {p1Win && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-amber-500 rounded-l"></div>}
      </div>

      {/* Center Label */}
      <div className="w-32 md:w-40 flex flex-col justify-center items-center px-2 py-2 bg-black/20 shrink-0">
         <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest text-center leading-tight">{label}</span>
      </div>

      {/* Player 2 Side */}
      <div className={`flex-1 flex flex-col justify-center items-start pl-6 py-3 border-l border-white/5 relative ${p2Bg} transition-colors`}>
         {isSeason ? (
             p2Data ? (
               <>
                 <span className={`text-xl font-mono font-bold leading-none ${p2Color}`}>{p2Data.kills}</span>
                 <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[11px] font-mono ${p2Win ? 'text-cyan-500/80' : 'text-slate-500'}`}>{p2Data.avg} Ø</span>
                    <span className="text-[10px] text-slate-500 font-medium bg-black/40 px-1.5 rounded">{p2Data.matches}J</span>
                 </div>
               </>
             ) : <Minus className="w-4 h-4 text-slate-700" />
         ) : (
             <span className={`text-lg font-mono font-bold ${p2Color}`}>{p2Data}</span>
         )}
         {p2Win && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-full bg-gradient-to-r from-cyan-500/20 to-transparent"></div>}
         {p2Win && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-cyan-500 rounded-r"></div>}
      </div>
    </div>
  );
};

export const ComparisonModal: React.FC<ComparisonModalProps> = ({ isOpen, onClose, players, activeWbTab }) => {
  const [player1Id, setPlayer1Id] = useState<string>(players[0]?.player || '');
  const [player2Id, setPlayer2Id] = useState<string>(players[1]?.player || '');
  const [isReportMode, setIsReportMode] = useState(false);
  const [comparisonFilter, setComparisonFilter] = useState<string>('all');

  // Update selected players when the source data changes
  useEffect(() => {
      if (players.length > 0 && !players.find(p => p.player === player1Id)) {
          setPlayer1Id(players[0].player);
      }
      if (players.length > 1 && !players.find(p => p.player === player2Id)) {
          setPlayer2Id(players[1].player);
      }
  }, [players]);

  // Reset filter when closed or tab changes
  useEffect(() => {
      setComparisonFilter('all');
  }, [isOpen, activeWbTab]);

  const player1 = useMemo(() => players.find(p => p.player === player1Id), [players, player1Id]);
  const player2 = useMemo(() => players.find(p => p.player === player2Id), [players, player2Id]);

  const handlePrint = () => {
    window.print();
  };

  // Helper to parse stats from string format
  const parseStat = (val: string | undefined) => {
    if (!val || val === '- (-)' || val === '0 (0)') return null;
    const parts = val.split(' (');
    const kills = parseInt(parts[0], 10) || 0;
    const matches = parseInt(parts[1]?.replace(')', ''), 10) || 0;
    const avg = matches > 0 ? (kills / matches).toFixed(2) : '0.00';
    return { kills, matches, avg };
  };

  // Helper to calculate total based on current filter
  const getFilteredStats = (p: KillStat | undefined) => {
      if (!p) return { kills: 0, matches: 0, kpg: 0 };
      
      // Default to stored values if filter is 'all'
      if (comparisonFilter === 'all') {
          return { kills: p.totalKills, matches: p.matches, kpg: p.kpg };
      }

      let kills = 0;
      let matches = 0;

      const extract = (key: string) => {
          const val = (p as any)[key];
          if (val && val !== '- (-)') {
              const parts = val.split(' (');
              const k = parseInt(parts[0], 10) || 0;
              const m = parseInt(parts[1]?.replace(')', ''), 10) || 0;
              return { k, m };
          }
          return { k: 0, m: 0 };
      };

      let keysToSum: string[] = [];
      if (activeWbTab === 'general') {
          keysToSum = [comparisonFilter]; 
      } else if (activeWbTab === 'wb2024') {
          if (comparisonFilter === 's1') keysToSum = ['wb2024s1'];
          else if (comparisonFilter === 's2') keysToSum = ['wb2024s2'];
      } else if (activeWbTab === 'wb2025') {
          if (comparisonFilter === 's1') keysToSum = ['wb2025s1'];
          else if (comparisonFilter === 's2') keysToSum = ['wb2025s2'];
      }

      keysToSum.forEach(key => {
          const { k, m } = extract(key);
          kills += k;
          matches += m;
      });

      const kpg = matches > 0 ? parseFloat((kills / matches).toFixed(2)) : 0;
      return { kills, matches, kpg };
  };

  if (!isOpen) return null;

  // -- CALCULATE DATA & SCORES --
  const p1Stats = getFilteredStats(player1);
  const p2Stats = getFilteredStats(player2);
  
  let p1Score = 0;
  let p2Score = 0;

  // Helper to check winner
  const checkWinner = (v1: number, v2: number, inverse = false) => {
      if (v1 === v2) return 0;
      if (inverse) return v1 < v2 ? 1 : 2;
      return v1 > v2 ? 1 : 2;
  };

  // Define Main Rows
  const rows = [
      {
          label: "Ranking Geral",
          p1Data: `#${player1?.rank}`,
          p2Data: `#${player2?.rank}`,
          winner: checkWinner(player1?.rank || 9999, player2?.rank || 9999, true)
      },
      {
          label: "Total Abates (Filtrado)",
          p1Data: p1Stats.kills,
          p2Data: p2Stats.kills,
          winner: checkWinner(p1Stats.kills, p2Stats.kills)
      },
      {
          label: "Partidas (Filtrado)",
          p1Data: p1Stats.matches,
          p2Data: p2Stats.matches,
          winner: checkWinner(p1Stats.matches, p2Stats.matches)
      },
      {
          label: "Média (KPG)",
          p1Data: p1Stats.kpg.toFixed(2),
          p2Data: p2Stats.kpg.toFixed(2),
          winner: checkWinner(p1Stats.kpg, p2Stats.kpg)
      }
  ];

  // Optional Split Rows (only if filter is All)
  if (comparisonFilter === 'all') {
      const addSplitRow = (label: string, key: keyof KillStat) => {
          const v1 = (player1 as any)?.[key] || 0;
          const v2 = (player2 as any)?.[key] || 0;
          if (v1 > 0 || v2 > 0) {
               rows.push({
                   label,
                   p1Data: v1,
                   p2Data: v2,
                   winner: checkWinner(v1, v2)
               });
          }
      };

      addSplitRow("Abates 25 S2", "kills25s2");
      addSplitRow("Abates 25 S1", "kills25s1");
      addSplitRow("Abates 24 S2", "kills24s2");
      addSplitRow("Abates 24 S1", "kills24s1");
  }

  // Detailed Stats
  const detailedKeys: {k: keyof KillStat, l: string}[] = [
      { k: 'headshots', l: 'Capas (Total)' },
      { k: 'knockdowns', l: 'Derrubados (Total)' },
      { k: 'gloowalls', l: 'Gelos (Total)' }
  ];

  detailedKeys.forEach(({k, l}) => {
      const v1 = (player1 as any)?.[k];
      const v2 = (player2 as any)?.[k];
      if (v1 !== undefined || v2 !== undefined) {
          const safeV1 = v1 || 0;
          const safeV2 = v2 || 0;
          rows.push({
              label: l,
              p1Data: safeV1,
              p2Data: safeV2,
              winner: checkWinner(safeV1, safeV2)
          });
      }
  });

  // Calculate Score from main rows
  rows.forEach(r => {
      if (r.winner === 1) p1Score++;
      else if (r.winner === 2) p2Score++;
  });


  // Season Rows
  const seasons = [
    { key: 'lbff9', label: 'LBFF 9' },
    { key: 'lbff8', label: 'LBFF 8' },
    { key: 'lbff7', label: 'LBFF 7' },
    { key: 'lbff6', label: 'LBFF 6' },
    { key: 'lbff5', label: 'LBFF 5' },
    { key: 'lbff4', label: 'LBFF 4' },
    { key: 'lbff3', label: 'LBFF 3' },
    { key: 'lbff1', label: 'LBFF 1' },
  ];

  const seasonRows = seasons.map(season => {
       const p1Stat = parseStat((player1 as any)?.[season.key]);
       const p2Stat = parseStat((player2 as any)?.[season.key]);

       if (!p1Stat && !p2Stat) return null;

       let winner: 0|1|2 = 0;
       if (p1Stat && p2Stat) {
          if (p1Stat.kills > p2Stat.kills) winner = 1;
          else if (p2Stat.kills > p1Stat.kills) winner = 2;
       } else if (p1Stat) winner = 1;
       else if (p2Stat) winner = 2;

       return {
           label: season.label,
           p1Data: p1Stat,
           p2Data: p2Stat,
           type: 'season' as const,
           winner
       };
  }).filter(Boolean);

  // Add seasons to score
  seasonRows.forEach(r => {
      if (r?.winner === 1) p1Score++;
      else if (r?.winner === 2) p2Score++;
  });


  // Logic to determine if specific split columns should be shown (Only in 'All' mode) - handled via rows generation logic above.

  // Render Filter Buttons
  const renderFilterButtons = () => {
      if (!activeWbTab) return null;
      
      const FilterBtn = ({ val, label }: { val: string, label: string }) => (
          <button 
             onClick={() => setComparisonFilter(val)}
             className={`px-2 py-1 text-[10px] uppercase font-bold rounded border ${comparisonFilter === val ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' : 'bg-black/20 text-slate-500 border-white/5'}`}
          >
              {label}
          </button>
      );

      return (
          <div className="flex items-center gap-2 justify-center mt-4 p-2 bg-white/5 rounded-lg border border-white/5 w-fit mx-auto">
             <Filter className="w-3 h-3 text-slate-500" />
             <FilterBtn val="all" label="Todos" />
             {activeWbTab === 'general' && (
                 <>
                    <div className="w-px h-3 bg-white/10" />
                    <FilterBtn val="wb24s1" label="24 S1" />
                    <FilterBtn val="wb24s2" label="24 S2" />
                    <div className="w-px h-3 bg-white/10" />
                    <FilterBtn val="wb25s1" label="25 S1" />
                    <FilterBtn val="wb25s2" label="25 S2" />
                 </>
             )}
             {(activeWbTab === 'wb2024' || activeWbTab === 'wb2025') && (
                 <>
                    <div className="w-px h-3 bg-white/10" />
                    <FilterBtn val="s1" label="Split 1" />
                    <FilterBtn val="s2" label="Split 2" />
                 </>
             )}
          </div>
      );
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center ${isReportMode ? 'bg-black' : 'p-4'}`}
      id="comparison-report"
    >
      {!isReportMode && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm transition-opacity" onClick={onClose} />
      )}
      
      <div className={`relative bg-[#0B0F19] border border-white/10 shadow-2xl w-full flex flex-col overflow-hidden ring-1 ring-white/5 transition-all duration-300 ${isReportMode ? 'h-full w-full rounded-none border-0' : 'max-w-4xl max-h-[90vh] rounded-3xl'}`}>
        
        {/* Header / Selectors */}
        <div className="p-6 border-b border-white/5 bg-gradient-to-b from-[#111827] to-[#0B0F19] shrink-0 z-20">
          <div className="flex justify-between items-center mb-6 no-print">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
               <Swords className="w-5 h-5 text-indigo-500" /> Comparativo Direto
            </h2>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setIsReportMode(!isReportMode)} 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${isReportMode ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                >
                    <FileText className="w-4 h-4" /> {isReportMode ? 'Voltar' : 'Gerar Relatório'}
                </button>
                {isReportMode && (
                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-slate-200 transition-colors"
                    >
                        <Printer className="w-4 h-4" /> Imprimir
                    </button>
                )}
                {!isReportMode && (
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                    </button>
                )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 md:gap-12">
            {/* Player 1 Select */}
            <div className="flex-1 relative">
                {isReportMode ? (
                    <div className="text-center md:text-left">
                        <div className="text-3xl font-black text-amber-500 font-mono tracking-tighter">{player1Id}</div>
                    </div>
                ) : (
                    <div className="group">
                        <div className="relative bg-black border border-amber-500/30 rounded-xl p-1 flex items-center shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                            <SearchablePlayerSelect 
                                value={player1Id} 
                                onChange={setPlayer1Id} 
                                players={players} 
                                placeholder="Selecione Jogador 1"
                            />
                        </div>
                    </div>
                )}
                <div className="text-center md:text-left mt-2 px-2 flex flex-col">
                   <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Jogador 01</div>
                   {/* Score for P1 */}
                   <div className="text-xs font-bold text-amber-500 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Vence em {p1Score} categorias
                   </div>
                </div>
            </div>

            {/* VS Badge */}
            <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-black border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] z-10">
               <span className="font-black italic text-slate-600 text-sm">VS</span>
            </div>

            {/* Player 2 Select */}
            <div className="flex-1 relative">
                {isReportMode ? (
                    <div className="text-center md:text-right">
                        <div className="text-3xl font-black text-cyan-400 font-mono tracking-tighter">{player2Id}</div>
                    </div>
                ) : (
                    <div className="group">
                        <div className="relative bg-black border border-cyan-500/30 rounded-xl p-1 flex items-center shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                            <SearchablePlayerSelect 
                                value={player2Id} 
                                onChange={setPlayer2Id} 
                                players={players} 
                                placeholder="Selecione Jogador 2"
                                align="right"
                            />
                        </div>
                    </div>
                )}
                 <div className="text-center md:text-right mt-2 px-2 flex flex-col items-end">
                   <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Jogador 02</div>
                   {/* Score for P2 */}
                   <div className="text-xs font-bold text-cyan-400 mt-1 flex items-center gap-1">
                      Vence em {p2Score} categorias <TrendingUp className="w-3 h-3" /> 
                   </div>
                </div>
            </div>
          </div>
          
          {/* Filters UI */}
          {!isReportMode && renderFilterButtons()}

        </div>

        {/* Scrollable Content */}
        <div className={`custom-scrollbar bg-[#0B0F19] relative ${isReportMode ? 'overflow-visible h-auto' : 'overflow-y-auto'}`}>
           
           {/* Legend Header */}
           <div className="sticky top-0 z-10 bg-[#0B0F19]/95 backdrop-blur-sm border-b border-white/5 py-2 px-4 flex justify-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
               <span>Dados Oficiais: {player1?.events || 'Comparação'}</span>
           </div>

           {/* General Stats Rows */}
           {player1 && player2 && (
             <div className="mb-4">
                 {rows.map((row, idx) => (
                     <ComparisonRow
                        key={idx}
                        label={row.label}
                        p1Data={row.p1Data}
                        p2Data={row.p2Data}
                        winner={row.winner as 0|1|2}
                     />
                 ))}
             </div>
           )}

           {/* Seasons Header */}
           <div className="sticky top-0 z-10 bg-indigo-950/30 backdrop-blur-md border-y border-indigo-500/20 py-3 px-4 flex justify-center items-center gap-2 text-xs text-indigo-300 font-bold uppercase tracking-widest print:bg-slate-200 print:text-black">
               <TrendingUp className="w-4 h-4" /> Histórico LBFF (Legado)
           </div>

           {/* Seasons List */}
           {player1 && player2 && (
               <div className="pb-8">
                   {seasonRows.map((row, idx) => (
                       <ComparisonRow 
                         key={idx}
                         label={row!.label} 
                         p1Data={row!.p1Data} 
                         p2Data={row!.p2Data} 
                         type="season"
                         winner={row!.winner as 0|1|2}
                       />
                   ))}
               </div>
           )}
           
           <div className="p-6 text-center">
              <p className="text-xs text-slate-600">
                Comparação baseada em dados oficiais da Liquipedia. Ø = Média de abates por partida.
              </p>
              {isReportMode && (
                  <p className="text-[10px] text-slate-700 mt-2 font-mono uppercase">
                      Gerado por JhanStats
                  </p>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};