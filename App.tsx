import React, { useState, useEffect, useMemo } from 'react';
import { KILL_STATS, EARNING_STATS } from './constants';
import { KillStat } from './types';
import { DataTable } from './components/DataTable';
import { StatsPanel } from './components/StatsPanel';
import { PlayerProgressionModal } from './components/PlayerProgressionModal';
import { ComparisonModal } from './components/ComparisonModal';
import { PlayerProfileView } from './components/PlayerProfileView';
import { EntryScreen } from './components/EntryScreen';
import { AdminLoginModal } from './components/AdminLoginModal';
import { EditPlayerModal } from './components/EditPlayerModal';
import { Skull, DollarSign, LayoutDashboard, Menu, Swords, Sparkles, Home, Lock, Unlock, Globe, Calendar, Layers, Filter, User } from 'lucide-react';

// New Split CSV Links
const WB_2024_S1_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQYc8m8JZnDeFr3FeN97I4NJwwuc0P1uN8v6JEv06_OflL5QCr_4t75yOe-xkqC9TnS3Cf-tRLT4aDZ/pub?output=csv';
const WB_2024_S2_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSNiiD9Bc1WutM_N1_R5bVnml85Y2sL3WqoRkmWYM3nvoqAMR5qXt2lEhhs6m_I9r-qQmvUvWX6Z7a6/pub?output=csv';
const WB_2025_S1_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSuAwNL2Ua0wcDHioiHDxxdNajprbptsOm1UdUNo4EoK-XyVzFYPrVYT_3WjMt2xZykLlaDh93L7TkR/pub?output=csv';
const WB_2025_S2_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRoO1Pp7JVxMOkf29n3_A4LYISkXrkqglqsL9ajgw68igKnk_7TtUXaLFJuJZ4whzaRpWD2akh8YeK9/pub?output=csv';

export type WBSubTab = 'wb2024' | 'wb2025' | 'general' | 'profile';
export type SplitFilter = 'all' | 's1' | 's2' | 'wb24s1' | 'wb24s2' | 'wb25s1' | 'wb25s2';

const App: React.FC = () => {
  const [showEntry, setShowEntry] = useState(true);
  const [activeTab, setActiveTab] = useState<'kills' | 'earnings' | 'ffwsbr'>('kills');
  const [wbSubTab, setWbSubTab] = useState<WBSubTab>('general'); // Default to General as requested
  const [splitFilter, setSplitFilter] = useState<SplitFilter>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<KillStat | null>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  
  // Data State
  const [killStats, setKillStats] = useState<KillStat[]>(KILL_STATS);
  
  // Raw Data storage
  const [raw24s1, setRaw24s1] = useState<KillStat[]>([]);
  const [raw24s2, setRaw24s2] = useState<KillStat[]>([]);
  const [raw25s1, setRaw25s1] = useState<KillStat[]>([]);
  const [raw25s2, setRaw25s2] = useState<KillStat[]>([]);

  const [isLoadingFFWS, setIsLoadingFFWS] = useState(false);
  
  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState<KillStat | null>(null);

  // Reset filter when subtab changes
  useEffect(() => {
    setSplitFilter('all');
  }, [wbSubTab]);

  // Fetch all WB Data
  useEffect(() => {
    const fetchAllWBData = async () => {
      setIsLoadingFFWS(true);
      
      const parseCSV = (csvText: string, eventName: string, splitKey: 'kills24s1' | 'kills24s2' | 'kills25s1' | 'kills25s2'): KillStat[] => {
          const lines = csvText.split('\n').filter(l => l.trim() !== '');
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          const findIdx = (keywords: string[]) => headers.findIndex(h => keywords.some(k => h === k || h.includes(k)));
          const findGelosIdx = () => headers.findIndex(h => h === 'gelos' || h === 'walls');

          const idxName = findIdx(['player', 'jogador', 'nome']);
          const idxTeam = findIdx(['team', 'time', 'equipe']);
          const idxKills = findIdx(['kills', 'abates']);
          const idxMatches = findIdx(['matches', 'partidas', 'jogos', 'quedas']);
          const idxHeadshots = findIdx(['capas', 'headshots']);
          const idxKnockdowns = findIdx(['derrubados', 'knockdowns', 'knocks']);
          const idxGelos = findGelosIdx();
          const idxGelosDestr = findIdx(['destruído', 'destruido', 'destroyed']);
          const idxRevives = findIdx(['reviveu', 'resurrections']);
          const idxAlliesRev = findIdx(['aliados revividos', 'allies revived']);

          return lines.slice(1).map((line, index) => {
              const row = line.split(','); 
              const getVal = (idx: number) => {
                  if (idx === -1) return 0;
                  const val = row[idx]?.trim().replace(/\./g, '') || '0';
                  return parseInt(val, 10) || 0;
              };

              const kills = getVal(idxKills);
              const matches = getVal(idxMatches);

              const statObj: KillStat = {
                  rank: index + 1,
                  player: row[idxName]?.trim() || 'Unknown',
                  team: row[idxTeam]?.trim() || '-',
                  totalKills: kills,
                  matches: matches,
                  kpg: matches > 0 ? parseFloat((kills / matches).toFixed(2)) : 0,
                  events: eventName,
                  headshots: getVal(idxHeadshots),
                  knockdowns: getVal(idxKnockdowns),
                  gloowalls: getVal(idxGelos),
                  gloowallsDestroyed: getVal(idxGelosDestr),
                  revives: getVal(idxRevives),
                  alliesRevived: getVal(idxAlliesRev),
                  // Initialize specific split data (will be populated during merge)
                  kills24s1: 0, kills24s2: 0, kills25s1: 0, kills25s2: 0
              };
              
              // Assign the current split kills to the specific property for this row
              statObj[splitKey] = kills;

              // VITAL: Populate the string format "Kills (Matches)" for the Modal Chart
              if (splitKey === 'kills24s1') (statObj as any).wb2024s1 = `${kills} (${matches})`;
              if (splitKey === 'kills24s2') (statObj as any).wb2024s2 = `${kills} (${matches})`;
              if (splitKey === 'kills25s1') (statObj as any).wb2025s1 = `${kills} (${matches})`;
              if (splitKey === 'kills25s2') (statObj as any).wb2025s2 = `${kills} (${matches})`;

              return statObj;
          });
      };

      try {
        const [r24s1, r24s2, r25s1, r25s2] = await Promise.all([
             fetch(WB_2024_S1_URL).then(r => r.text()),
             fetch(WB_2024_S2_URL).then(r => r.text()),
             fetch(WB_2025_S1_URL).then(r => r.text()),
             fetch(WB_2025_S2_URL).then(r => r.text()),
        ]);

        setRaw24s1(parseCSV(r24s1, 'WB 24 S1', 'kills24s1'));
        setRaw24s2(parseCSV(r24s2, 'WB 24 S2', 'kills24s2'));
        setRaw25s1(parseCSV(r25s1, 'WB 25 S1', 'kills25s1'));
        setRaw25s2(parseCSV(r25s2, 'WB 25 S2', 'kills25s2'));

      } catch (error) {
        console.error("Failed to fetch WB CSVs", error);
      } finally {
        setIsLoadingFFWS(false);
      }
    };

    fetchAllWBData();
  }, []);

  // Merge Logic with Filtering
  const mergedFFWSData = useMemo(() => {
      let datasets: KillStat[][] = [];

      // Determine datasets based on active tab AND split filter
      // For 'profile' tab, we want all data available to search
      if (wbSubTab === 'general' || wbSubTab === 'profile') {
          if (splitFilter === 'all') datasets = [raw24s1, raw24s2, raw25s1, raw25s2];
          else if (splitFilter === 'wb24s1') datasets = [raw24s1];
          else if (splitFilter === 'wb24s2') datasets = [raw24s2];
          else if (splitFilter === 'wb25s1') datasets = [raw25s1];
          else if (splitFilter === 'wb25s2') datasets = [raw25s2];
      } else if (wbSubTab === 'wb2024') {
          if (splitFilter === 'all') datasets = [raw24s1, raw24s2];
          else if (splitFilter === 's1') datasets = [raw24s1];
          else if (splitFilter === 's2') datasets = [raw24s2];
      } else if (wbSubTab === 'wb2025') {
          if (splitFilter === 'all') datasets = [raw25s1, raw25s2];
          else if (splitFilter === 's1') datasets = [raw25s1];
          else if (splitFilter === 's2') datasets = [raw25s2];
      }

      const playerMap = new Map<string, KillStat>();

      const normalizeName = (name: string): string => {
         const n = name.trim();
         const lower = n.toLowerCase();
         // ... normalization rules same as before ...
         if (lower === 'nickz7') return 'Nickz7';
         if (lower === 'but' || lower === 'butzin') return 'BuTziN';
         if (lower === 'motovea' || lower === 'motovea7') return 'Motovea';
         if (lower === 'rigby' || lower === 'rigby245') return 'Rigby245';
         if (lower === 'lost' || lower === 'lost21') return 'Lost21';
         if (lower === 'honey' || lower === 'honeyzl') return 'HoneyZL';
         if (lower === 'pitbull') return 'Pitbull';
         if (lower === 'bops') return 'Bops';
         if (lower === 'bahiaz7') return 'BahiaZ7';
         if (lower === 'nando9') return 'NANDO9';
         if (lower === 'xtrap7' || lower === 'trap' || lower === 'trap7') return 'TRAP7';
         if (lower === 'yago.exe' || lower === 'yago') return 'Yago';
         if (lower === 'cauan7' || lower === 'cauan') return 'Cauan';
         if (lower === 'italo7' || lower === 'italo') return 'ITALO$$';
         if (lower === 'xguaxa7' || lower === 'guaxa' || lower === 'guaxa7') return 'GUAXA7';
         if (lower === 'bombom7' || lower === 'bombom') return 'BOMBOM';
         return n;
      };

      datasets.forEach(dataset => {
          dataset.forEach(p => {
              const standardizedName = normalizeName(p.player);
              const key = standardizedName.toLowerCase();
              
              if (!playerMap.has(key)) {
                  playerMap.set(key, { ...p, player: standardizedName });
              } else {
                  const existing = playerMap.get(key)!;
                  
                  if (existing.player !== standardizedName) {
                      const isUpper = (s: string) => s === s.toUpperCase() && s !== s.toLowerCase();
                      if (isUpper(existing.player) && !isUpper(standardizedName)) {
                          existing.player = standardizedName;
                      }
                  }

                  // Sum detailed stats based on filtered datasets
                  existing.totalKills += p.totalKills;
                  existing.matches += p.matches;
                  existing.headshots = (existing.headshots || 0) + (p.headshots || 0);
                  existing.knockdowns = (existing.knockdowns || 0) + (p.knockdowns || 0);
                  existing.gloowalls = (existing.gloowalls || 0) + (p.gloowalls || 0);
                  existing.gloowallsDestroyed = (existing.gloowallsDestroyed || 0) + (p.gloowallsDestroyed || 0);
                  existing.revives = (existing.revives || 0) + (p.revives || 0);
                  existing.alliesRevived = (existing.alliesRevived || 0) + (p.alliesRevived || 0);

                  // Accumulate split specific totals regardless of filter (for chart context, etc)
                  // Note: Since 'datasets' only contains what we want to show in Total/Rank,
                  // we still want to preserve the specific split data properties if they exist on 'p'
                  existing.kills24s1 = (existing.kills24s1 || 0) + (p.kills24s1 || 0);
                  existing.kills24s2 = (existing.kills24s2 || 0) + (p.kills24s2 || 0);
                  existing.kills25s1 = (existing.kills25s1 || 0) + (p.kills25s1 || 0);
                  existing.kills25s2 = (existing.kills25s2 || 0) + (p.kills25s2 || 0);

                  if ((p as any).wb2024s1) (existing as any).wb2024s1 = (p as any).wb2024s1;
                  if ((p as any).wb2024s2) (existing as any).wb2024s2 = (p as any).wb2024s2;
                  if ((p as any).wb2025s1) (existing as any).wb2025s1 = (p as any).wb2025s1;
                  if ((p as any).wb2025s2) (existing as any).wb2025s2 = (p as any).wb2025s2;
                  
                  if (p.team && p.team !== '-' && p.team !== existing.team) {
                      existing.team = p.team;
                  }
              }
          });
      });

      return Array.from(playerMap.values())
          .map(p => ({
              ...p,
              kpg: p.matches > 0 ? parseFloat((p.totalKills / p.matches).toFixed(2)) : 0,
              events: wbSubTab === 'general' ? 'WB Geral' : (wbSubTab === 'wb2024' ? 'WB 2024' : 'WB 2025')
          }))
          .sort((a, b) => b.totalKills - a.totalKills)
          .map((p, i) => ({ ...p, rank: i + 1 }));

  }, [raw24s1, raw24s2, raw25s1, raw25s2, wbSubTab, splitFilter]);

  // Helper for filter buttons style
  const FilterButton = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
        active 
          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' 
          : 'bg-black/40 border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10'
      }`}
    >
      {label}
    </button>
  );


  const handlePlayerClick = (player: any) => {
    if (activeTab === 'kills' || activeTab === 'ffwsbr') {
      setSelectedPlayer(player);
    }
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setShowAdminLogin(true);
    }
  };

  const getCurrentData = () => {
      if (activeTab === 'earnings') return EARNING_STATS;
      if (activeTab === 'ffwsbr') return mergedFFWSData;
      return killStats;
  };

  return (
    <>
      {showEntry && <EntryScreen onEnter={() => setShowEntry(false)} />}
      
      {/* Dedicated Fixed Background to prevent Scroll Performance issues on Mobile */}
      <div 
        className="fixed inset-0 -z-50 pointer-events-none"
        style={{
          backgroundColor: '#000000',
          backgroundImage: `
            radial-gradient(circle at 50% 0%, #1e1b4b 0%, transparent 40%),
            radial-gradient(circle at 0% 50%, #172554 0%, transparent 25%),
            radial-gradient(circle at 100% 50%, #312e81 0%, transparent 25%)
          `
        }}
      />
      
      <div className={`min-h-screen text-slate-200 selection:bg-indigo-500/30 flex flex-col relative transition-opacity duration-700 ${showEntry ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Background ambient light overlay */}
        <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none z-0" />

        {/* Navigation Bar */}
        <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center gap-4">
                <div className="relative group cursor-pointer" onClick={() => setShowEntry(true)}>
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-lg blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative w-10 h-10 bg-black rounded-lg flex items-center justify-center border border-white/10">
                    <LayoutDashboard className="w-5 h-5 text-amber-500" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight">
                    JhanStats
                  </span>
                </div>
              </div>
              
              <div className="hidden md:block">
                <div className="ml-10 flex items-center space-x-2 bg-white/5 p-1.5 rounded-xl border border-white/5 backdrop-blur-sm">
                  <button 
                    onClick={() => setActiveTab('kills')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                      activeTab === 'kills' 
                      ? 'bg-gradient-to-b from-slate-800 to-black text-amber-400 shadow-lg shadow-black/50 border border-white/10 ring-1 ring-amber-500/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Skull className={`w-4 h-4 ${activeTab === 'kills' ? 'text-amber-500' : ''}`} />
                    Mais Abates
                  </button>
                  <button 
                    onClick={() => setActiveTab('ffwsbr')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                      activeTab === 'ffwsbr' 
                      ? 'bg-gradient-to-b from-slate-800 to-black text-indigo-400 shadow-lg shadow-black/50 border border-white/10 ring-1 ring-indigo-500/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Globe className={`w-4 h-4 ${activeTab === 'ffwsbr' ? 'text-indigo-500' : ''}`} />
                    FFWSBR
                  </button>
                  <button 
                     onClick={() => setActiveTab('earnings')}
                     className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                      activeTab === 'earnings' 
                      ? 'bg-gradient-to-b from-slate-800 to-black text-cyan-400 shadow-lg shadow-black/50 border border-white/10 ring-1 ring-cyan-500/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <DollarSign className={`w-4 h-4 ${activeTab === 'earnings' ? 'text-cyan-500' : ''}`} />
                    Ganhos
                  </button>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-4">
                  {/* Home Button */}
                  <button 
                    onClick={() => setShowEntry(true)}
                    className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Voltar ao Início"
                  >
                    <Home className="w-5 h-5" />
                  </button>

                  {/* Admin Toggle */}
                  <button 
                    onClick={handleAdminToggle}
                    className={`p-2 rounded-full hover:bg-white/10 transition-colors ${isAdmin ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400'}`}
                    title={isAdmin ? "Modo Admin Ativo (Clique para sair)" : "Acesso Admin"}
                  >
                    {isAdmin ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </button>

                  {/* Comparison Button */}
                  {(activeTab === 'kills' || activeTab === 'ffwsbr') && (
                    <button 
                      onClick={() => setIsComparisonOpen(true)}
                      className="group relative px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all duration-200 overflow-hidden"
                    >
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-violet-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-white/10"></div>
                      <div className="relative flex items-center gap-2">
                        <Swords className="w-4 h-4" />
                        Comparar
                      </div>
                    </button>
                  )}
              </div>

              <div className="-mr-2 flex md:hidden">
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 focus:outline-none"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
             <div className="md:hidden bg-black/90 border-b border-white/10 backdrop-blur-xl">
               <div className="px-4 pt-4 pb-6 space-y-2">
                  <button 
                    onClick={() => { setActiveTab('kills'); setMobileMenuOpen(false); }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium flex items-center gap-3 ${
                      activeTab === 'kills' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-slate-300'
                    }`}
                  >
                    <Skull className="w-5 h-5" /> Mais Abates
                  </button>
                  <button 
                    onClick={() => { setActiveTab('ffwsbr'); setMobileMenuOpen(false); }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium flex items-center gap-3 ${
                      activeTab === 'ffwsbr' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' : 'text-slate-300'
                    }`}
                  >
                    <Globe className="w-5 h-5" /> FFWSBR
                  </button>
                  <button 
                     onClick={() => { setActiveTab('earnings'); setMobileMenuOpen(false); }}
                     className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium flex items-center gap-3 ${
                      activeTab === 'earnings' ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20' : 'text-slate-300'
                    }`}
                  >
                    <DollarSign className="w-5 h-5" /> Ganhos
                  </button>
                  <div className="flex gap-2 mt-4 px-2">
                     <button onClick={() => { setShowEntry(true); setMobileMenuOpen(false); }} className="flex-1 py-2 bg-white/5 rounded text-sm">Início</button>
                     <button onClick={() => { handleAdminToggle(); setMobileMenuOpen(false); }} className={`flex-1 py-2 rounded text-sm ${isAdmin ? 'bg-amber-600' : 'bg-white/5'}`}>{isAdmin ? 'Sair Admin' : 'Admin'}</button>
                  </div>
                  {(activeTab === 'kills' || activeTab === 'ffwsbr') && (
                    <button 
                      onClick={() => { setIsComparisonOpen(true); setMobileMenuOpen(false); }}
                      className="mt-4 w-full px-4 py-3 rounded-lg text-base font-medium bg-indigo-600 text-white flex items-center gap-3 justify-center"
                    >
                      <Swords className="w-5 h-5" /> Modo Comparação
                    </button>
                  )}
               </div>
             </div>
          )}
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full z-10">
          
          {/* Header Section */}
          <div className="mb-8 relative">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight drop-shadow-lg">
                  {activeTab === 'kills' ? (
                    <>
                      Lenda dos <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Abates</span>
                    </>
                  ) : activeTab === 'ffwsbr' ? (
                    <>
                       FFWSBR <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">2025</span>
                    </>
                  ) : (
                    <>
                      Elite dos <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Ganhos</span>
                    </>
                  )}
                </h1>
                <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">
                  {activeTab === 'kills' 
                    ? 'Ranking oficial da LBFF Série A. Analise o desempenho histórico das maiores lendas do cenário competitivo.'
                    : activeTab === 'ffwsbr'
                    ? 'Hub oficial de estatísticas do FFWS Brasil. Dados combinados e segmentados por temporada.'
                    : 'Monitoramento em tempo real das premiações globais e valores de mercado dos pro-players.'
                  }
                </p>
              </div>
              
              {(activeTab === 'kills' || activeTab === 'ffwsbr') && (
                <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm text-xs font-medium text-slate-400">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{activeTab === 'ffwsbr' ? '4 Planilhas Sincronizadas' : 'Dados atualizados da Era World Series'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sub Navigation for WB */}
          {activeTab === 'ffwsbr' && (
            <div className="mb-8 flex flex-col gap-4">
                {/* Main Tabs */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setWbSubTab('general')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${wbSubTab === 'general' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 ring-1 ring-purple-400' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                    >
                        <Layers className="w-4 h-4" /> WB GERAL (TODOS)
                    </button>
                    <button
                        onClick={() => setWbSubTab('wb2024')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${wbSubTab === 'wb2024' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-indigo-400' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                    >
                        <Calendar className="w-4 h-4" /> WB 2024 DADOS GERAIS
                    </button>
                    <button
                        onClick={() => setWbSubTab('wb2025')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${wbSubTab === 'wb2025' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-indigo-400' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                    >
                        <Calendar className="w-4 h-4" /> WB 2025 DADOS GERAIS
                    </button>
                    <div className="hidden md:block w-px h-8 bg-white/10 mx-2"></div>
                    <button
                        onClick={() => setWbSubTab('profile')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${wbSubTab === 'profile' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 ring-1 ring-amber-400' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                    >
                        <User className="w-4 h-4" /> PERFIL DO JOGADOR
                    </button>
                </div>

                {/* Split Filters (Hide in Profile mode) */}
                {wbSubTab !== 'profile' && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl border border-white/5 w-fit">
                      <Filter className="w-4 h-4 text-slate-500 mr-2" />
                      
                      <FilterButton label="Todos" active={splitFilter === 'all'} onClick={() => setSplitFilter('all')} />

                      {wbSubTab === 'general' && (
                          <>
                            <div className="w-px h-4 bg-white/10 mx-1"></div>
                            <FilterButton label="24 Split 1" active={splitFilter === 'wb24s1'} onClick={() => setSplitFilter('wb24s1')} />
                            <FilterButton label="24 Split 2" active={splitFilter === 'wb24s2'} onClick={() => setSplitFilter('wb24s2')} />
                            <div className="w-px h-4 bg-white/10 mx-1"></div>
                            <FilterButton label="25 Split 1" active={splitFilter === 'wb25s1'} onClick={() => setSplitFilter('wb25s1')} />
                            <FilterButton label="25 Split 2" active={splitFilter === 'wb25s2'} onClick={() => setSplitFilter('wb25s2')} />
                          </>
                      )}

                      {(wbSubTab === 'wb2024' || wbSubTab === 'wb2025') && (
                          <>
                            <div className="w-px h-4 bg-white/10 mx-1"></div>
                            <FilterButton label="Split 1" active={splitFilter === 's1'} onClick={() => setSplitFilter('s1')} />
                            <FilterButton label="Split 2" active={splitFilter === 's2'} onClick={() => setSplitFilter('s2')} />
                          </>
                      )}
                  </div>
                )}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Column */}
            <div className="flex-1 min-w-0">
              {activeTab === 'ffwsbr' && isLoadingFFWS ? (
                  <div className="h-[400px] flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 animate-pulse">
                      <div className="flex flex-col items-center gap-4">
                          <Globe className="w-10 h-10 text-indigo-500 animate-spin" />
                          <span className="text-slate-400 font-mono text-sm">Carregando e Mesclando Dados...</span>
                      </div>
                  </div>
              ) : (
                  <>
                    {/* Render Profile View if selected subtab is profile */}
                    {activeTab === 'ffwsbr' && wbSubTab === 'profile' ? (
                       <PlayerProfileView players={mergedFFWSData} />
                    ) : (
                       <DataTable 
                          key={`${activeTab}-${wbSubTab}-${splitFilter}`} 
                          type={activeTab}
                          subTab={wbSubTab === 'profile' ? 'general' : wbSubTab}
                          splitFilter={splitFilter}
                          data={getCurrentData()}
                          onPlayerClick={handlePlayerClick}
                          isAdmin={isAdmin}
                          onEditPlayer={setPlayerToEdit}
                        />
                    )}
                  </>
              )}
            </div>

            {/* Sidebar (Hide in Profile View to give full width) */}
            {(activeTab !== 'ffwsbr' || wbSubTab !== 'profile') && (
              <StatsPanel 
                killsData={activeTab === 'ffwsbr' ? mergedFFWSData : killStats} 
                earningsData={EARNING_STATS} 
                activeTab={activeTab}
              />
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-white/5 bg-black/40 backdrop-blur-md py-8 mt-auto z-10">
          <div className="max-w-7xl mx-auto px-4 text-center">
             <div className="flex items-center justify-center gap-2 mb-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               <div className="h-px w-12 bg-gradient-to-r from-transparent to-slate-500"></div>
               <span className="text-slate-400 text-xs tracking-[0.2em] uppercase font-bold">JhanStats Ecosystem</span>
               <div className="h-px w-12 bg-gradient-to-l from-transparent to-slate-500"></div>
             </div>
             <p className="text-slate-500 text-sm">
               &copy; 2024 JhanStats.
               {activeTab === 'ffwsbr' ? (
                  <> Dados tratados por <span className="text-slate-400 font-medium">Jhan</span>.</>
               ) : (
                  <> Dados fornecidos por <span className="text-slate-400 font-medium">Liquipedia</span>.</>
               )}
             </p>
             <p className="text-slate-600 text-sm mt-2">
               Site Desenvolvido por <span className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors cursor-default drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">Jhan Medeiros</span>
             </p>
          </div>
        </footer>

        {/* Player Progression Modal */}
        <PlayerProgressionModal 
          player={selectedPlayer} 
          onClose={() => setSelectedPlayer(null)} 
        />
        
        {/* Comparison Modal */}
        <ComparisonModal 
          isOpen={isComparisonOpen}
          onClose={() => setIsComparisonOpen(false)}
          players={activeTab === 'ffwsbr' ? mergedFFWSData : killStats}
          activeWbTab={wbSubTab === 'profile' ? 'general' : wbSubTab} 
        />

        {/* Admin Login Modal */}
        <AdminLoginModal 
           isOpen={showAdminLogin}
           onClose={() => setShowAdminLogin(false)}
           onLogin={setIsAdmin}
        />

        {/* Edit Player Modal */}
        {playerToEdit && (
            <EditPlayerModal 
              isOpen={!!playerToEdit}
              onClose={() => setPlayerToEdit(null)}
              player={playerToEdit}
              onSave={() => {}} // Disabled for now on merged view
            />
        )}
      </div>
    </>
  );
};

export default App;