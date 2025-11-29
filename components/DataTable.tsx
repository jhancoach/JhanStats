import React, { useState, useMemo } from 'react';
import { KillStat, EarningStat, SortConfig } from '../types';
import { ArrowUpDown, Download, Search, Trophy, TrendingUp, Filter, ChevronDown, Pencil, Globe } from 'lucide-react';
import { WBSubTab } from '../App';

interface DataTableProps {
  data: any[];
  type: 'kills' | 'earnings' | 'ffwsbr';
  subTab?: WBSubTab;
  onPlayerClick?: (player: any) => void;
  isAdmin?: boolean;
  onEditPlayer?: (player: any) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ data, type, subTab, onPlayerClick, isAdmin, onEditPlayer }) => {
  const [filter, setFilter] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<SortConfig<any>>({
    key: type === 'earnings' ? 'earnings' : 'totalKills',
    direction: 'desc',
  });

  const isKills = type === 'kills';
  const isFFWS = type === 'ffwsbr';
  
  // Dynamic colors based on type
  const accentColor = isFFWS ? "text-indigo-400" : isKills ? "text-amber-400" : "text-cyan-400";
  const glowColor = isFFWS ? "shadow-indigo-500/20" : isKills ? "shadow-amber-500/20" : "shadow-cyan-500/20";

  const seasonOptions = [
    { value: 'all', label: 'Todas as Temporadas' },
    { value: 'lbff1', label: 'LBFF 1' },
    { value: 'lbff3', label: 'LBFF 3' },
    { value: 'lbff4', label: 'LBFF 4' },
    { value: 'lbff5', label: 'LBFF 5' },
    { value: 'lbff6', label: 'LBFF 6' },
    { value: 'lbff7', label: 'LBFF 7' },
    { value: 'lbff8', label: 'LBFF 8' },
    { value: 'lbff9', label: 'LBFF 9' },
    { value: 'wb2024s1', label: 'WB 2024 S1' },
    { value: 'wb2024s2', label: 'WB 2024 S2' },
    { value: 'wb2025s1', label: 'WB 2025 S1' },
    { value: 'wb2025s2', label: 'WB 2025 S2' },
  ];

  // Process data to include WB Total (Only for Main Kills Tab as legacy calc)
  const processedData = useMemo(() => {
    if (type !== 'kills') return data;
    return data.map(item => {
      const wbCols = ['wb2024s1', 'wb2024s2', 'wb2025s1', 'wb2025s2'];
      let kills = 0;
      let matches = 0;

      wbCols.forEach(key => {
        const val = item[key];
        if (val && val !== '- (-)') {
          const parts = val.split(' (');
          kills += parseInt(parts[0], 10) || 0;
          matches += parseInt(parts[1]?.replace(')', ''), 10) || 0;
        }
      });

      return {
        ...item,
        wb_total: `${kills} (${matches})`,
        wb_total_val: kills
      };
    });
  }, [data, type]);

  // Columns Configuration
  const columns = useMemo(() => {
    let cols = [];
    if (isFFWS) {
         cols = [
            { key: 'rank', label: '#', width: 'w-16 min-w-[60px]', sticky: true },
            { key: 'player', label: 'Jogador', width: 'w-48 min-w-[150px]', sticky: true },
            { key: 'totalKills', label: 'Total Abates', width: 'w-24 min-w-[80px]', highlight: true },
            { key: 'matches', label: 'Quedas', width: 'w-24 min-w-[80px]' },
         ];

         // Inject Split specific columns based on active subtab
         if (subTab === 'wb2024' || subTab === 'general') {
            cols.push(
               { key: 'kills24s1', label: 'Abates 24 S1', width: 'w-24 min-w-[90px]', special: true },
               { key: 'kills24s2', label: 'Abates 24 S2', width: 'w-24 min-w-[90px]', special: true }
            );
         }
         if (subTab === 'wb2025' || subTab === 'general') {
            cols.push(
               { key: 'kills25s1', label: 'Abates 25 S1', width: 'w-24 min-w-[90px]', special: true },
               { key: 'kills25s2', label: 'Abates 25 S2', width: 'w-24 min-w-[90px]', special: true }
            );
         }

         // Add remaining detailed columns
         cols.push(
            { key: 'headshots', label: 'Capas', width: 'w-24 min-w-[80px]' },
            { key: 'knockdowns', label: 'Derrubados', width: 'w-28 min-w-[100px]' },
            { key: 'gloowalls', label: 'Gelos', width: 'w-24 min-w-[80px]' },
            { key: 'gloowallsDestroyed', label: 'Gelos Destr.', width: 'w-28 min-w-[100px]' },
            { key: 'revives', label: 'Reviveu', width: 'w-24 min-w-[80px]' },
            { key: 'alliesRevived', label: 'Aliados Rev.', width: 'w-28 min-w-[100px]' },
         );

    } else if (isKills) {
      cols = [
        { key: 'rank', label: '#', width: 'w-16 min-w-[70px]', sticky: true },
        { key: 'player', label: 'Jogador', width: 'w-56 min-w-[200px]', sticky: true },
        { key: 'totalKills', label: 'Abates', width: 'w-32 min-w-[120px]' },
        { key: 'matches', label: 'Partidas', width: 'w-28 min-w-[100px]' },
        { key: 'kpg', label: 'KPG', width: 'w-24 min-w-[90px]' },
        { key: 'wb_total', label: 'WB Total', width: 'min-w-[140px]', highlight: true },
        { key: 'lbff1', label: 'LBFF 1', width: 'min-w-[100px]' },
        { key: 'lbff3', label: 'LBFF 3', width: 'min-w-[100px]' },
        { key: 'lbff4', label: 'LBFF 4', width: 'min-w-[100px]' },
        { key: 'lbff5', label: 'LBFF 5', width: 'min-w-[100px]' },
        { key: 'lbff6', label: 'LBFF 6', width: 'min-w-[100px]' },
        { key: 'lbff7', label: 'LBFF 7', width: 'min-w-[100px]' },
        { key: 'lbff8', label: 'LBFF 8', width: 'min-w-[100px]' },
        { key: 'lbff9', label: 'LBFF 9', width: 'min-w-[100px]' },
        { key: 'wb2024s1', label: 'WB 24 S1', width: 'min-w-[110px]' },
        { key: 'wb2024s2', label: 'WB 24 S2', width: 'min-w-[110px]' },
        { key: 'wb2025s1', label: 'WB 25 S1', width: 'min-w-[110px]' },
        { key: 'wb2025s2', label: 'WB 25 S2', width: 'min-w-[110px]' },
      ];
    } else {
      cols = [
        { key: 'rank', label: '#', width: 'w-16 min-w-[50px]', sticky: true },
        { key: 'player', label: 'Player', width: 'w-56 min-w-[180px]', sticky: true },
        { key: 'gold', label: '🥇', width: 'w-16 text-center' },
        { key: 'silver', label: '🥈', width: 'w-16 text-center' },
        { key: 'bronze', label: '🥉', width: 'w-16 text-center' },
        { key: 's_tier', label: 'S-Tier', width: 'w-20 text-center' },
        { key: 'earnings', label: 'Earnings (USD)', width: 'w-32 text-right' },
      ];
    }
    
    // Add Admin Edit Column if active and is Kills or FFWS
    if (isAdmin && (isKills || isFFWS)) {
      cols.push({ key: 'actions', label: 'Admin', width: 'w-16 text-center', sticky: false });
    }

    return cols;
  }, [isKills, isFFWS, isAdmin, subTab]);

  const sortedAndFilteredData = useMemo(() => {
    let output = [...processedData];

    if (filter) {
      output = output.filter(item => 
        item.player.toLowerCase().includes(filter.toLowerCase())
      );
    }

    if (isKills && seasonFilter !== 'all') {
      output = output.filter(item => {
        const val = item[seasonFilter];
        return val && val !== '- (-)' && val !== '0 (0)';
      });
    }

    if (sortConfig.key) {
      output.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'wb_total') {
            valA = a.wb_total_val;
            valB = b.wb_total_val;
        }

        if (valA === undefined || valA === '-') return 1;
        if (valB === undefined || valB === '-') return -1;

        const isStatString = (v: any) => typeof v === 'string' && v.includes('(') && v.includes(')');
        
        let compareA = valA;
        let compareB = valB;

        if (isStatString(valA) && isStatString(valB)) {
           compareA = parseInt(valA.split(' ')[0], 10) || 0;
           compareB = parseInt(valB.split(' ')[0], 10) || 0;
        }

        if (compareA < compareB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (compareA > compareB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return output;
  }, [processedData, filter, sortConfig, seasonFilter, isKills]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const downloadCSV = () => {
    const headers = columns.map(c => c.label).join(',');
    const rows = sortedAndFilteredData.map(row => columns.map(c => `"${row[c.key] || ''}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `jhanstats_${type}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate a unique key for the tbody to trigger animation on sort/filter change
  const viewKey = `${type}-${sortConfig.key}-${sortConfig.direction}-${filter}-${seasonFilter}`;

  return (
    <div className={`glass-panel rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[800px] ring-1 ring-white/5 ${glowColor}`}>
      {/* Table Toolbar */}
      <div className="p-5 border-b border-white/5 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-black/20 z-20">
        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-72 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-xl leading-5 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 sm:text-sm transition duration-200"
              placeholder="Buscar jogador..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          {/* Season Filter Dropdown */}
          {isKills && (
            <div className="relative w-full sm:w-56 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
              </div>
              <select
                value={seasonFilter}
                onChange={(e) => setSeasonFilter(e.target.value)}
                className="block w-full pl-10 pr-10 py-2.5 bg-black/40 border border-white/10 rounded-xl leading-5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 sm:text-sm appearance-none cursor-pointer hover:bg-black/60 transition-colors"
              >
                {seasonOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-900">
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 w-full xl:w-auto justify-between xl:justify-end">
          {isFFWS && (
              <div className="hidden sm:flex items-center text-xs text-indigo-400/80 bg-indigo-500/5 px-4 py-2 rounded-full border border-indigo-500/10 whitespace-nowrap">
                  <Globe className="w-3 h-3 mr-1.5" /> Dados Completos FFWSBR
              </div>
          )}
          {isKills && (
            <div className="hidden sm:flex items-center text-xs text-amber-400/80 bg-amber-500/5 px-4 py-2 rounded-full border border-amber-500/10 whitespace-nowrap">
               <TrendingUp className="w-3 h-3 mr-1.5" /> Clique no nome para ver gráficos
            </div>
          )}
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm font-medium transition-all border border-white/5 hover:border-white/10 whitespace-nowrap active:scale-95"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Main Scrollable Table Area */}
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <table className="min-w-max w-full text-left text-sm whitespace-nowrap border-collapse">
          <thead className="bg-black/40 text-slate-400 uppercase font-bold text-[10px] tracking-widest sticky top-0 z-10 backdrop-blur-md">
            <tr>
              {columns.map((col, index) => (
                <th 
                  key={col.key} 
                  className={`px-6 py-5 cursor-pointer hover:text-white hover:bg-white/5 transition-all border-b border-white/5 ${col.width} ${col.sticky ? 'sticky z-20 bg-slate-950/80 backdrop-blur-xl' : ''} ${ (col as any).highlight ? (isFFWS ? 'text-indigo-400' : 'text-indigo-400') : ''} ${ (col as any).special ? 'text-emerald-400 bg-emerald-500/5' : ''}`}
                  style={col.sticky ? { left: index === 0 ? 0 : '70px', boxShadow: index > 0 ? '4px 0 10px -2px rgba(0,0,0,0.3)' : 'none' } : {}}
                  onClick={() => col.key !== 'actions' && requestSort(col.key)}
                >
                  <div className={`flex items-center gap-1.5 ${col.key === 'earnings' ? 'justify-end' : (col.width.includes('text-center') ? 'justify-center' : '')}`}>
                    {col.label}
                    {col.key !== 'actions' && (
                        <ArrowUpDown className={`w-3 h-3 transition-all ${sortConfig.key === col.key ? 'text-amber-500 opacity-100 scale-110' : 'opacity-30'}`} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody 
            key={viewKey}
            className="divide-y divide-white/5 animate-fade-in"
          >
            {sortedAndFilteredData.map((row, idx) => (
              <tr 
                key={idx} 
                className={`group hover:bg-white/[0.03] transition-colors duration-150 ease-in-out`}
              >
                {columns.map((col, index) => {
                  const val = row[col.key];
                  const isRank = col.key === 'rank';
                  const isMainMetric = col.key === 'totalKills' || col.key === 'earnings';
                  const isPlayer = col.key === 'player';
                  const isWBTotal = col.key === 'wb_total';
                  const isMedal = ['gold', 'silver', 'bronze', 's_tier'].includes(col.key as string);
                  const isAction = col.key === 'actions';
                  const isSpecial = (col as any).special;

                  return (
                    <td 
                      key={col.key} 
                      className={`px-6 py-4 text-slate-300 ${col.sticky ? 'sticky left-0 z-10 bg-[#0A0A0A] group-hover:bg-[#121212] transition-colors duration-150 ease-in-out' : ''} ${isSpecial ? 'bg-emerald-500/5 group-hover:bg-emerald-500/10 text-emerald-300 font-mono font-bold' : ''}`}
                      style={col.sticky ? { left: index === 0 ? 0 : '70px', boxShadow: index > 0 ? '4px 0 10px -2px rgba(0,0,0,0.3)' : 'none' } : {}}
                    >
                      {isAction ? (
                         <div className="flex justify-center">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onEditPlayer && onEditPlayer(row); }}
                                className="p-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black rounded transition-all"
                                title="Editar Jogador"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                         </div>
                      ) : isRank ? (
                         <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold shadow-lg ${
                           val === 1 ? 'bg-gradient-to-br from-yellow-300 to-amber-600 text-black border border-amber-300' : 
                           val === 2 ? 'bg-gradient-to-br from-slate-200 to-slate-500 text-black border border-slate-300' : 
                           val === 3 ? 'bg-gradient-to-br from-orange-300 to-red-600 text-black border border-orange-300' : 
                           'text-slate-500 bg-white/5 border border-white/5'
                         }`}>
                           {val <= 3 ? <Trophy className="w-4 h-4 fill-current" /> : <span className="text-xs">#{val}</span>}
                         </div>
                      ) : isPlayer ? (
                        <div 
                          className={`font-bold text-base transition-all flex items-center gap-2 ${isKills || isFFWS ? 'cursor-pointer hover:text-amber-400' : 'text-slate-100'}`}
                          onClick={() => (isKills || isFFWS) && onPlayerClick && onPlayerClick(row)}
                        >
                          {val}
                          {(isKills || isFFWS) && (
                            <TrendingUp className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all text-amber-500" />
                          )}
                        </div>
                      ) : isMainMetric ? (
                        <div className={`font-mono font-bold text-lg tracking-tight ${accentColor} drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] ${col.key === 'earnings' ? 'text-right' : ''}`}>
                          {isKills || isFFWS ? val : `$${val.toLocaleString()}`}
                        </div>
                      ) : isWBTotal ? (
                         <span className="font-mono font-bold text-xs text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]">{val}</span>
                      ) : isMedal ? (
                         <div className={`font-mono font-bold text-center ${val > 0 ? 'text-white' : 'text-slate-700'}`}>
                            {val}
                         </div>
                      ) : (
                        col.key === 'kpg' 
                        ? <span className="font-mono bg-white/5 border border-white/10 px-2 py-1 rounded text-xs text-slate-400">{val}</span> 
                        : (val !== undefined ? val : <span className="text-slate-700 text-xs">-</span>)
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Empty State */}
        {sortedAndFilteredData.length === 0 && (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">Nenhum resultado encontrado.</p>
            <p className="text-sm opacity-60">Tente ajustar seus filtros.</p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-6 py-4 bg-black/40 border-t border-white/5 text-xs text-slate-500 flex justify-between items-center z-20 backdrop-blur-xl">
        <span>Mostrando <span className="text-white font-mono">{sortedAndFilteredData.length}</span> registros</span>
        <span className="flex items-center gap-1 opacity-70">Dados: <span className="font-semibold text-slate-400">Liquipedia</span></span>
      </div>
    </div>
  );
};