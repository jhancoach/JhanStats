import React, { useMemo, useState } from 'react';
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
import { X, TrendingUp, Trophy, Crosshair, Swords, Globe, FileText, Printer, Share2, Check } from 'lucide-react';

interface PlayerProgressionModalProps {
  player: KillStat | null;
  onClose: () => void;
}

export const PlayerProgressionModal: React.FC<PlayerProgressionModalProps> = ({ player, onClose }) => {
  const [isReportMode, setIsReportMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const chartData = useMemo(() => {
    if (!player) return [];

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

    const allSeasons = seasons.map(season => {
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

    // Filter logic: If the player has absolutely no LBFF data (likely from FFWS CSVs only), hide LBFF labels
    const hasLBFFActivity = allSeasons.some(s => s.name.includes('LBFF') && s.active);
    
    if (!hasLBFFActivity) {
        return allSeasons.filter(s => s.name.includes('WB'));
    }
    
    return allSeasons;
  }, [player]);

  // Calculate WB Specific Total
  const wbTotal = useMemo(() => {
     if (!player) return { kills: 0, matches: 0 };

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

  if (!player) return null;

  const totalSeasonsPlayed = chartData.filter(d => d.active).length;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const textToShare = `📊 *Relatório de Performance JhanStats*
👤 Jogador: ${player.player}
🏆 Total de Abates: ${player.totalKills}
🎯 Média Geral: ${player.kpg}
🔫 Partidas: ${player.matches}
🌐 WB Total: ${wbTotal.kills} Kills
    
Gerado via JhanStats`;

    navigator.clipboard.writeText(textToShare).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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
    <div 
        className={`fixed inset-0 z-[100] flex items-center justify-center ${isReportMode ? 'bg-black' : 'p-4 overflow-y-auto'}`}
        id="player-report"
    >
      {/* Backdrop - Hide in report/print mode */}
      {!isReportMode && (
        <div 
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm transition-opacity no-print"
            onClick={onClose}
        ></div>
      )}

      {/* Modal Content */}
      <div className={`relative bg-slate-900 border border-slate-700 w-full flex flex-col my-auto transition-all duration-300 ${isReportMode ? 'h-full w-full rounded-none border-0' : 'max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden'}`}>
        
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
                  Média: <span className="text-white font-mono">{player.kpg}</span>
                </span>
                <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur px-3 py-1 rounded-full border border-white/5 shadow-inner">
                   Temporadas: <span className="text-white font-mono">{totalSeasonsPlayed}</span>
                </span>
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="relative z-10 flex items-center gap-2 no-print">
            <button 
                onClick={() => setIsReportMode(!isReportMode)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${isReportMode ? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-400 hover:text-white hover:bg-white/20'}`}
            >
                <FileText className="w-4 h-4" /> {isReportMode ? 'Voltar' : 'Gerar Relatório'}
            </button>
            
            {isReportMode && (
                <>
                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-slate-200 transition-colors"
                    >
                        <Printer className="w-4 h-4" /> Imprimir
                    </button>
                    <button 
                        onClick={handleShare}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                </>
            )}

            {!isReportMode && (
                <button 
                    onClick={onClose}
                    className="ml-2 p-2 rounded-full bg-black/20 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
                >
                    <X className="w-6 h-6" />
                </button>
            )}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className={`custom-scrollbar bg-slate-950/50 p-6 ${isReportMode ? 'overflow-visible h-auto' : 'overflow-y-auto'}`}>
          
          {/* WB Stats Highlight */}
          <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-4 mb-6 flex items-center justify-between print:border-indigo-500 print:bg-white print:text-black">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 print:bg-indigo-100 print:text-indigo-800">
                      <Globe className="w-6 h-6" />
                  </div>
                  <div>
                      <h3 className="text-indigo-200 font-bold print:text-black">World Series (WB) Total</h3>
                      <p className="text-xs text-indigo-400/60 print:text-slate-600">Somatório de performance internacional (2024-2025)</p>
                  </div>
              </div>
              <div className="flex gap-6 text-right">
                  <div>
                      <div className="text-2xl font-mono font-bold text-white print:text-black">{wbTotal.kills}</div>
                      <div className="text-xs text-indigo-400 uppercase tracking-wide print:text-slate-600">Abates</div>
                  </div>
                  <div className="border-l border-indigo-500/20 pl-6 print:border-slate-300">
                      <div className="text-2xl font-mono font-bold text-white print:text-black">{wbTotal.matches}</div>
                      <div className="text-xs text-indigo-400 uppercase tracking-wide print:text-slate-600">Partidas</div>
                  </div>
              </div>
          </div>

          {/* Chart Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 shadow-inner print:bg-white print:border-slate-200">
            <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2 print:text-black">
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
                  {!isReportMode && <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }} />}
                  <Area 
                    type="monotone" 
                    dataKey="kills" 
                    stroke="#EAB308" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorKills)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                    isAnimationActive={!isReportMode} // Disable animation for print/report
                  >
                    <LabelList 
                      dataKey="kills" 
                      position="top" 
                      offset={10} 
                      className="fill-slate-300 text-[10px] font-mono print:fill-black print:font-bold" 
                      formatter={(val: number) => val > 0 ? val : ''}
                    />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Stats Grid */}
          <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2 print:text-black print:mt-6">
            <Crosshair className="w-4 h-4" /> Estatísticas Detalhadas por Temporada
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {chartData.map((data) => (
              <div 
                key={data.name} 
                className={`p-3 rounded-lg border flex flex-col print:bg-white print:border-slate-300 print:text-black ${
                  data.active 
                    ? 'bg-slate-900 border-slate-700' 
                    : 'bg-slate-900/30 border-slate-800 opacity-60'
                }`}
              >
                <span className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2 print:text-slate-600">{data.name}</span>
                <div className="flex justify-between items-end">
                  <div>
                    <span className={`text-xl font-mono font-bold ${data.active ? 'text-white print:text-black' : 'text-slate-600'}`}>
                      {data.active ? data.kills : '-'}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">Abates</span>
                  </div>
                  {data.active && (
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700 print:bg-slate-100 print:border-slate-300 print:text-black">
                        {data.matches} Partidas
                      </div>
                      <div className="text-[10px] text-yellow-500/80 bg-yellow-900/20 px-1.5 py-0.5 rounded border border-yellow-900/30 font-mono print:text-black print:bg-yellow-100 print:border-yellow-300">
                        Média: {data.kpg}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {isReportMode && (
              <div className="mt-8 text-center text-xs text-slate-500 font-mono uppercase border-t border-slate-800 pt-4 print:text-black print:border-slate-300">
                  Relatório gerado automaticamente por JhanStats
              </div>
          )}
        </div>
      </div>
    </div>
  );
};