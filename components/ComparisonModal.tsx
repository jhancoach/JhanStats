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
  Filter,
  User,
  Medal,
  Trophy
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
  maxValue?: number; // Para cálculo da barra de progresso
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
        className={`w-full bg-black/50 border border-white/10 rounded-xl p-3 flex items-center cursor-pointer hover:border-white/20 transition-all group ${align === 'right' ? 'flex-row-reverse' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <div className={`w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 group-hover:bg-indigo-500/30 transition-colors ${align === 'right' ? 'ml-3' : 'mr-3'}`}>
           <User className="w-4 h-4 text-indigo-300" />
        </div>
        <span className={`flex-1 font-bold text-sm md:text-base truncate ${value ? 'text-white' : 'text-slate-500'} ${align === 'right' ? 'text-right' : 'text-left'}`}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''} ${align === 'right' ? 'mr-auto ml-0' : 'ml-auto'}`} />
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

const ComparisonRow: React.FC<ComparisonRowProps> = ({ label, p1Data, p2Data, type = 'normal', winner = 0, maxValue }) => {
  const isSeason = type === 'season';
  
  // Ensure numeric values for bar calculation
  let val1 = 0, val2 = 0;
  if (isSeason) {
      val1 = p1Data?.kills || 0;
      val2 = p2Data?.kills || 0;
  } else if (typeof p1Data === 'number') {
      val1 = p1Data;
      val2 = p2Data;
  } else if (typeof p1Data === 'string') {
      // Try to parse if it looks like a number
      val1 = parseFloat(p1Data) || 0;
      val2 = parseFloat(p2Data) || 0;
  }

  // Calculate width percentages relative to the max value of the two (or global max)
  const localMax = maxValue || Math.max(val1, val2) || 1;
  // Limit max width to 95% to leave a tiny bit of space
  const p1Width = Math.min(100, (val1 / localMax) * 100);
  const p2Width = Math.min(100, (val2 / localMax) * 100);

  const p1Win = winner === 1;
  const p2Win = winner === 2;

  // Visual Styles
  const p1TextClass = p1Win ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-slate-500';
  const p2TextClass = p2Win ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : 'text-slate-500';
  
  const p1BarGradient = p1Win 
    ? 'bg-gradient-to-l from-amber-400 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
    : 'bg-slate-700/50';
  
  const p2BarGradient = p2Win 
    ? 'bg-gradient-to-r from-indigo-400 to-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
    : 'bg-slate-700/50';

  return (
    <div className="relative flex items-center gap-2 py-3 px-2 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
      
      {/* --- PLAYER 1 (LEFT SIDE) --- */}
      <div className="flex-1 flex flex-col items-end min-w-0">
         
         {/* Stats Display */}
         <div className="flex items-center gap-2 mb-1.5 z-10 relative">
             {isSeason ? (
                 p1Data ? (
                   <div className="flex flex-col items-end leading-none">
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-lg font-mono font-bold ${p1TextClass}`}>{p1Data.kills}</span>
                        {p1Win && <Trophy className="w-3 h-3 text-amber-500 mb-0.5" />}
                      </div>
                      <div className="flex gap-2 text-[10px] text-slate-600 font-medium mt-0.5">
                         <span>{p1Data.matches}J</span>
                         <span>•</span>
                         <span>{p1Data.avg} Ø</span>
                      </div>
                   </div>
                 ) : <Minus className="w-4 h-4 text-slate-800" />
             ) : (
                 <span className={`text-base md:text-xl font-mono font-bold ${p1TextClass}`}>{p1Data}</span>
             )}
         </div>

         {/* Bar Track & Fill (Right to Left) */}
         <div className="w-full h-2 bg-slate-800/40 rounded-full overflow-hidden flex justify-end relative">
            <div 
                className={`h-full rounded-l-full transition-all duration-700 ease-out ${p1BarGradient} ${p1Win ? 'opacity-100' : 'opacity-60 grayscale'}`} 
                style={{ width: `${p1Width}%` }} 
            />
         </div>
      </div>

      {/* --- CENTRAL LABEL --- */}
      <div className="w-20 md:w-32 shrink-0 flex flex-col items-center justify-center relative z-20">
         {/* Connecting Line behind label */}
         <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 -z-10"></div>
         <div className="px-3 py-1 bg-[#0B0F19] border border-white/10 rounded-md shadow-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center whitespace-nowrap z-10 backdrop-blur-sm">
            {label}
         </div>
      </div>

      {/* --- PLAYER 2 (RIGHT SIDE) --- */}
      <div className="flex-1 flex flex-col items-start min-w-0">
         
         {/* Stats Display */}
         <div className="flex items-center gap-2 mb-1.5 z-10 relative">
             {isSeason ? (
                 p2Data ? (
                   <div className="flex flex-col items-start leading-none">
                      <div className="flex items-baseline gap-1.5">
                        {p2Win && <Trophy className="w-3 h-3 text-indigo-500 mb-0.5" />}
                        <span className={`text-lg font-mono font-bold ${p2TextClass}`}>{p2Data.kills}</span>
                      </div>
                      <div className="flex gap-2 text-[10px] text-slate-600 font-medium mt-0.5">
                         <span>{p2Data.matches}J</span>
                         <span>•</span>
                         <span>{p2Data.avg} Ø</span>
                      </div>
                   </div>
                 ) : <Minus className="w-4 h-4 text-slate-800" />
             ) : (
                 <span className={`text-base md:text-xl font-mono font-bold ${p2TextClass}`}>{p2Data}</span>
             )}
         </div>

         {/* Bar Track & Fill (Left to Right) */}
         <div className="w-full h-2 bg-slate-800/40 rounded-full overflow-hidden flex justify-start relative">
            <div 
                className={`h-full rounded-r-full transition-all duration-700 ease-out ${p2BarGradient} ${p2Win ? 'opacity-100' : 'opacity-60 grayscale'}`} 
                style={{ width: `${p2Width}%` }} 
            />
         </div>
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
          winner: checkWinner(player1?.rank || 9999, player2?.rank || 9999, true),
          // For ranking, lower is better, so inverse logic for max value calc not needed visually as it's just text
      },
      {
          label: "Total Abates",
          p1Data: p1Stats.kills,
          p2Data: p2Stats.kills,
          winner: checkWinner(p1Stats.kills, p2Stats.kills)
      },
      {
          label: "Média (KPG)",
          p1Data: p1Stats.kpg.toFixed(2),
          p2Data: p2Stats.kpg.toFixed(2),
          winner: checkWinner(p1Stats.kpg, p2Stats.kpg)
      },
      {
          label: "Partidas",
          p1Data: p1Stats.matches,
          p2Data: p2Stats.matches,
          winner: checkWinner(p1Stats.matches, p2Stats.matches)
      },
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
      { k: 'headshots', l: 'Capas' },
      { k: 'knockdowns', l: 'Derrubados' },
      { k: 'gloowalls', l: 'Gelos' }
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


  // Render Filter Buttons
  const renderFilterButtons = () => {
      if (!activeWbTab) return null;
      
      const FilterBtn = ({ val, label }: { val: string, label: string }) => (
          <button 
             onClick={() => setComparisonFilter(val)}
             className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${comparisonFilter === val ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-black/20 text-slate-500 border-white/5 hover:border-white/10 hover:text-white'}`}
          >
              {label}
          </button>
      );

      return (
          <div className="flex items-center gap-2 justify-center mt-6 p-1.5 bg-black/40 rounded-xl border border-white/5 w-fit mx-auto backdrop-blur-sm">
             <Filter className="w-3.5 h-3.5 text-slate-500 ml-2" />
             <FilterBtn val="all" label="Geral" />
             {activeWbTab === 'general' && (
                 <>
                    <div className="w-px h-4 bg-white/10" />
                    <FilterBtn val="wb24s1" label="24 S1" />
                    <FilterBtn val="wb24s2" label="24 S2" />
                    <div className="w-px h-4 bg-white/10" />
                    <FilterBtn val="wb25s1" label="25 S1" />
                    <FilterBtn val="wb25s2" label="25 S2" />
                 </>
             )}
             {(activeWbTab === 'wb2024' || activeWbTab === 'wb2025') && (
                 <>
                    <div className="w-px h-4 bg-white/10" />
                    <FilterBtn val="s1" label="Split 1" />
                    <FilterBtn val="s2" label="Split 2" />
                 </>
             )}
          </div>
      );
  };

  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : '??';

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center ${isReportMode ? 'bg-black' : 'p-4'}`}
      id="comparison-report"
    >
      {!isReportMode && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm transition-opacity" onClick={onClose} />
      )}
      
      <div className={`relative bg-[#0B0F19] border border-white/10 shadow-2xl w-full flex flex-col overflow-hidden ring-1 ring-white/5 transition-all duration-300 ${isReportMode ? 'h-full w-full rounded-none border-0' : 'max-w-5xl max-h-[90dvh] rounded-3xl'}`}>
        
        {/* Top Actions Bar */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50 pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 bg-black/50 px-3 py-1 rounded-full border border-white/5">
                    {activeWbTab ? 'Modo FFWS' : 'Modo Geral'}
                </span>
            </div>
            <div className="pointer-events-auto flex items-center gap-2 bg-black/50 p-1.5 rounded-full border border-white/5 backdrop-blur-md">
                <button 
                    onClick={() => setIsReportMode(!isReportMode)} 
                    className={`p-2 rounded-full transition-colors ${isReportMode ? 'bg-indigo-600 text-white' : 'hover:bg-white/10 text-slate-400 hover:text-white'}`}
                    title={isReportMode ? "Sair do modo relatório" : "Gerar Relatório"}
                >
                    <FileText className="w-4 h-4" />
                </button>
                {isReportMode && (
                    <button 
                        onClick={handlePrint}
                        className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <Printer className="w-4 h-4" />
                    </button>
                )}
                {!isReportMode && (
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>

        {/* Header / Players Select */}
        <div className="pt-16 md:pt-20 pb-6 md:pb-8 px-4 md:px-12 bg-gradient-to-b from-[#111827] to-[#0B0F19] shrink-0 border-b border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
            
            {/* Player 1 Block */}
            <div className="flex-1 w-full flex flex-col items-center md:items-start relative group">
                <div className="absolute -inset-4 bg-amber-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative flex items-center gap-4 mb-3 w-full">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20 flex items-center justify-center text-black font-black text-2xl md:text-3xl border border-white/10 shrink-0 transform -rotate-3 group-hover:rotate-0 transition-transform">
                        {getInitials(player1Id)}
                    </div>
                    <div className="flex-1 min-w-0">
                         {isReportMode ? (
                            <h2 className="text-3xl font-black text-white truncate">{player1Id}</h2>
                         ) : (
                            <SearchablePlayerSelect 
                                value={player1Id} 
                                onChange={setPlayer1Id} 
                                players={players} 
                                placeholder="Jogador 1"
                            />
                         )}
                         <div className="flex items-center gap-2 mt-1">
                            <div className="px-2 py-0.5 bg-amber-500/10 rounded border border-amber-500/20 text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                                P1
                            </div>
                            {player1 && <span className="text-xs text-slate-400">{player1.team || 'Sem Time'}</span>}
                         </div>
                    </div>
                </div>
                
                {/* Score P1 */}
                <div className="w-full bg-black/40 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Categorias</span>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-white">{p1Score}</span>
                        {p1Score > p2Score && <Medal className="w-5 h-5 text-amber-400 fill-current animate-pulse" />}
                    </div>
                </div>
            </div>

            {/* VS Center */}
            <div className="shrink-0 flex flex-col items-center justify-center">
               <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent hidden md:block mb-2"></div>
               <div className="w-14 h-14 rounded-full bg-black border-2 border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)] z-10">
                   <Swords className="w-6 h-6 text-slate-400" />
               </div>
               <div className="w-px h-12 bg-gradient-to-t from-transparent via-white/20 to-transparent hidden md:block mt-2"></div>
            </div>

            {/* Player 2 Block */}
            <div className="flex-1 w-full flex flex-col items-center md:items-end relative group">
                <div className="absolute -inset-4 bg-indigo-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative flex flex-row-reverse items-center gap-4 mb-3 w-full">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 flex items-center justify-center text-white font-black text-2xl md:text-3xl border border-white/10 shrink-0 transform rotate-3 group-hover:rotate-0 transition-transform">
                        {getInitials(player2Id)}
                    </div>
                    <div className="flex-1 min-w-0 text-right flex flex-col items-end">
                         {isReportMode ? (
                            <h2 className="text-3xl font-black text-white truncate">{player2Id}</h2>
                         ) : (
                            <SearchablePlayerSelect 
                                value={player2Id} 
                                onChange={setPlayer2Id} 
                                players={players} 
                                placeholder="Jogador 2"
                                align="right"
                            />
                         )}
                         <div className="flex items-center gap-2 mt-1">
                            {player2 && <span className="text-xs text-slate-400">{player2.team || 'Sem Time'}</span>}
                            <div className="px-2 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
                                P2
                            </div>
                         </div>
                    </div>
                </div>

                {/* Score P2 */}
                <div className="w-full bg-black/40 rounded-xl p-3 border border-white/5 flex items-center justify-between flex-row-reverse">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Categorias</span>
                    <div className="flex items-center gap-2">
                         {p2Score > p1Score && <Medal className="w-5 h-5 text-indigo-400 fill-current animate-pulse" />}
                        <span className="text-2xl font-black text-white">{p2Score}</span>
                    </div>
                </div>
            </div>
          </div>
          
          {/* Filters UI */}
          {!isReportMode && renderFilterButtons()}

        </div>

        {/* Scrollable Content */}
        <div className={`custom-scrollbar bg-[#0B0F19] relative px-4 md:px-12 py-8 flex-1 min-h-0 ${isReportMode ? 'overflow-visible h-auto' : 'overflow-y-auto'}`}>
           
           {/* General Stats Rows */}
           {player1 && player2 && (
             <div className="space-y-1 mb-12">
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
           <div className="flex items-center gap-4 mb-6">
               <div className="h-px bg-white/10 flex-1"></div>
               <div className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                   <TrendingUp className="w-4 h-4" /> Histórico LBFF
               </div>
               <div className="h-px bg-white/10 flex-1"></div>
           </div>

           {/* Seasons List */}
           {player1 && player2 && (
               <div className="pb-8 space-y-1">
                   {seasonRows.map((row, idx) => (
                       <ComparisonRow 
                         key={idx}
                         label={row!.label} 
                         p1Data={row!.p1Data} 
                         p2Data={row!.p2Data} 
                         type="season"
                         winner={row!.winner as 0|1|2}
                         maxValue={300} // Approximate max kills per season for bar scaling
                       />
                   ))}
               </div>
           )}
           
           <div className="p-6 text-center border-t border-white/5 mt-4">
              <p className="text-xs text-slate-600">
                Comparação baseada em dados oficiais da Liquipedia & Tratamento JhanStats.
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