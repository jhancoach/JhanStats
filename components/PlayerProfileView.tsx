import React, { useState, useMemo } from 'react';
import { KillStat } from '../types';
import html2canvas from 'html2canvas';
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
  Globe,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList
} from 'recharts';

interface PlayerProfileViewProps {
  players: KillStat[];
}

export const PlayerProfileView: React.FC<PlayerProfileViewProps> = ({ players }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0]?.player || '');
  const [isDownloading, setIsDownloading] = useState(false);

  const filteredPlayers = useMemo(() => {
    return players.filter(p => p.player.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [players, searchTerm]);

  const player = useMemo(() => {
    return players.find(p => p.player === selectedPlayerId) || players[0];
  }, [players, selectedPlayerId]);

  // Process data for Chart & Split Cards (Matching Scout Logic)
  const seasonData = useMemo(() => {
    if (!player) return [];

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
          // Try explicit keys if available in object
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('profile-capture-area');
    if (!element) return;

    setIsDownloading(true);
    try {
        // Aguarda um pequeno delay para garantir que re-renderizações (se houver) estejam completas
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(element, {
            backgroundColor: '#0B0F19', // Garante fundo escuro
            scale: 2, // Alta resolução (Retina)
            logging: false,
            useCORS: true, // Para avatares/fontes
            allowTaint: true
        });
        
        const link = document.createElement('a');
        link.download = `JhanStats-${player.player.replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error("Erro ao gerar imagem:", err);
        alert("Erro ao gerar a imagem. Tente novamente.");
    } finally {
        setIsDownloading(false);
    }
  };

  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : '??';

  if (!player) return null;

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
      <div id="printable-profile" className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-10">
         {/* Wrapper para Captura de Imagem (Captura todo o conteúdo, mesmo scrollado) */}
         <div id="profile-capture-area" className="flex flex-col gap-6 p-1">
            
             {/* 1. Header Hero */}
             <div className="bg-[#0B0F19] rounded-3xl p-6 md:p-8 border border-white/10 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6 w-full xl:w-auto">
                        {/* Avatar */}
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 flex items-center justify-center text-4xl md:text-5xl font-black text-white shadow-lg shadow-indigo-500/20 shrink-0">
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
                            <p className="text-slate-400 text-sm max-w-lg hidden md:block">
                                Análise completa de desempenho. Dados consolidados de todas as competições oficiais rastreadas (FFWSBR & World Series).
                            </p>
                        </div>
                    </div>

                    <div className="w-full xl:w-auto flex flex-col items-stretch xl:items-end gap-3">
                        <div className="flex flex-wrap gap-3 no-print justify-end">
                            <button 
                                onClick={handleDownloadImage}
                                disabled={isDownloading}
                                className="flex-1 md:flex-none px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                title="Salvar como Imagem"
                            >
                                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                                {isDownloading ? 'Gerando...' : 'Salvar Imagem'}
                            </button>
                            <button 
                                onClick={handlePrint}
                                disabled={isDownloading}
                                className="flex-1 md:flex-none px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group disabled:opacity-50 whitespace-nowrap"
                                title="Gerar PDF para Impressão"
                            >
                                <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                Relatório
                            </button>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">Total Geral</div>
                            <div className="text-4xl font-mono font-bold text-white tracking-tight">{player.totalKills.toLocaleString()}</div>
                            <div className="text-indigo-400 text-xs font-bold mt-1">Abates Confirmados</div>
                        </div>
                    </div>
                </div>
             </div>

             {/* 2. Stats Grid (4 Cols x 2 Rows) */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

             {/* 3. Evolution Chart & Split History (Vertical Layout) */}
             <div className="flex flex-col gap-8">
                
                {/* Chart Section (Full Width) */}
                <div className="w-full bg-[#0B0F19] rounded-2xl p-6 border border-white/10 shadow-lg">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-white flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-indigo-400" />
                          Evolução Temporal de Performance
                      </h3>
                   </div>
                   <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={seasonData.slice().reverse()} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
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
                              >
                                <LabelList 
                                    dataKey="kills" 
                                    position="top" 
                                    offset={10} 
                                    className="fill-white text-[10px] font-bold" 
                                    formatter={(val: number) => val > 0 ? val : ''}
                                />
                              </Area>
                          </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                {/* Split History Cards (Grid below chart) */}
                <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-2 font-bold text-amber-400">
                     <Target className="w-4 h-4" /> Histórico Detalhado por Split
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     {seasonData.map((s) => (
                        <div key={s.id} className="bg-[#0f1420] border border-white/5 p-4 rounded-xl relative overflow-hidden group hover:border-white/10 transition-colors shadow-lg">
                           <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-xl"></div>
                           <div className="flex justify-between items-start mb-2 pl-2">
                              <div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{s.name}</div>
                                <div className="text-2xl font-bold text-white font-mono">{s.kills} <span className="text-xs text-slate-500 font-sans font-normal">Kills</span></div>
                              </div>
                              <div className="px-2 py-1 bg-white/5 rounded text-[10px] text-slate-400 border border-white/5">
                                {s.matches} Quedas
                              </div>
                           </div>
                           <div className="pl-2 flex items-center justify-between">
                              <span className="text-xs text-slate-500">Média (KPG)</span>
                              <span className={`font-mono font-bold ${Number(s.kpg) > 2 ? 'text-emerald-400' : 'text-indigo-400'}`}>{s.kpg}</span>
                           </div>
                           {/* Mini Progress Bar for KPG visual */}
                           <div className="mt-2 pl-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500" style={{width: `${Math.min(100, (Number(s.kpg) / 3) * 100)}%`}}></div>
                           </div>
                        </div>
                     ))}
                   </div>
                   {seasonData.length === 0 && (
                      <div className="p-4 text-center text-slate-500 text-xs bg-[#0f1420] rounded-xl border border-white/5">Sem histórico de splits recente.</div>
                   )}
                </div>

             </div>

         </div>

      </div>
    </div>
  );
};

const StatBox = ({ icon: Icon, label, value, subLabel, color }: any) => {
  // Map color to classes
  const colorMap: any = {
    indigo: { icon: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    amber: { icon: 'text-amber-400', bg: 'bg-amber-500/10' },
    blue: { icon: 'text-blue-400', bg: 'bg-blue-500/10' },
    emerald: { icon: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    rose: { icon: 'text-rose-400', bg: 'bg-rose-500/10' },
    orange: { icon: 'text-orange-400', bg: 'bg-orange-500/10' },
    cyan: { icon: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    green: { icon: 'text-green-400', bg: 'bg-green-500/10' },
  };
  const theme = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors shadow-lg">
       <div className={`p-3 rounded-xl ${theme.bg}`}>
          <Icon className={`w-6 h-6 ${theme.icon}`} />
       </div>
       <div>
          <div className="text-2xl font-bold text-white font-mono">{value}</div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</div>
          <div className="text-[10px] text-slate-600 mt-0.5">{subLabel}</div>
       </div>
    </div>
  );
};