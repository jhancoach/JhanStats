import React, { useState, useRef, useMemo } from 'react';
import { KillStat } from '../types';
import html2canvas from 'html2canvas';
import { PlayerDetailedProfile } from './PlayerProfileView'; // Import the detailed view
import { 
  User, 
  Shield, 
  Crosshair, 
  Swords, 
  Target, 
  Zap, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Download, 
  HelpCircle, 
  Upload, 
  Edit2, 
  Save, 
  DollarSign,
  Undo2,
  Redo2,
  X,
  Search,
  Briefcase,
  Copy,
  Users,
  LayoutGrid,
  PenTool,
  BarChart2,
  List,
  Table as TableIcon
} from 'lucide-react';

interface SquadBuilderViewProps {
  players: KillStat[];
}

interface SquadSlot {
  id: string;
  type: 'player' | 'coach' | 'analyst' | 'reserve';
  role?: string; // Rush, Sniper, etc.
  assignedPlayer?: string; // Nome do jogador
  customImage?: string; // URL/Base64
  definingWord?: string; // Palavra chave
  salary?: number;
}

// Default roles for dropdowns
const ROLES = ['Rush', 'Rush 1', 'Rush 2', 'CPT', 'Bomba', 'Sniper', 'Suporte', 'Coach', 'Analista', 'Manager'];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const SlotCard: React.FC<{ slot: SquadSlot; onEdit: (id: string) => void; onViewStats: (name: string) => void }> = ({ slot, onEdit, onViewStats }) => {
    const isFilled = !!slot.assignedPlayer;
    
    // Role Badge Color Logic
    let roleBadgeClass = "bg-[#1A1F2E] text-slate-500 border-white/5";
    if (slot.role && slot.role !== 'Player') {
        const r = slot.role.toLowerCase();
        if (r.includes('rush')) roleBadgeClass = "bg-red-500/10 text-red-400 border-red-500/20";
        else if (r.includes('cpt')) roleBadgeClass = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
        else if (r.includes('bomba') || r.includes('granada')) roleBadgeClass = "bg-orange-500/10 text-orange-400 border-orange-500/20";
        else if (r.includes('sniper') || r.includes('awp')) roleBadgeClass = "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
        else if (r.includes('suporte')) roleBadgeClass = "bg-blue-500/10 text-blue-400 border-blue-500/20";
        else if (r.includes('coach') || r.includes('analista')) roleBadgeClass = "bg-purple-500/10 text-purple-400 border-purple-500/20";
        else roleBadgeClass = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    }

    return (
        <div 
          onClick={() => onEdit(slot.id)}
          className={`relative h-[220px] w-full rounded-2xl transition-all duration-300 cursor-pointer group select-none
            ${isFilled 
                ? 'bg-[#0B0F19] border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/5' 
                : 'bg-transparent border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
            }`}
        >
            {/* Badge - Top Right (Wireframe Style) */}
            <div className={`absolute top-3 right-3 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border z-10 backdrop-blur-md ${roleBadgeClass}`}>
                {slot.role || 'FUNÇÃO'}
            </div>

            {isFilled ? (
                // FILLED STATE (Premium Visual)
                <>
                    {/* View Stats Button (Top Left) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent opening edit modal
                            if (slot.assignedPlayer) onViewStats(slot.assignedPlayer);
                        }}
                        className="absolute top-3 left-3 p-1.5 rounded-lg bg-black/40 hover:bg-indigo-600 text-slate-400 hover:text-white border border-white/10 hover:border-indigo-500/50 transition-all z-20 backdrop-blur-md group/stats"
                        title="Ver Estatísticas"
                    >
                        <BarChart2 className="w-4 h-4" />
                    </button>

                    {/* Image Layer */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-800/20 to-[#0B0F19]">
                        {slot.customImage ? (
                            <img src={slot.customImage} alt="Player" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <User className="w-24 h-24 text-slate-700/30" />
                        )}
                        {/* Gradient overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent"></div>
                    </div>

                    {/* Content Layer */}
                    <div className="absolute bottom-0 w-full p-5 flex flex-col items-start">
                        {/* Defining Word */}
                        {slot.definingWord && (
                            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                "{slot.definingWord}"
                            </span>
                        )}
                        
                        <div className="font-black text-2xl text-white leading-none tracking-tight uppercase truncate w-full drop-shadow-lg">
                            {slot.assignedPlayer}
                        </div>
                        
                        {slot.salary && slot.salary > 0 && (
                            <div className="mt-2 text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shadow-lg">
                                {formatCurrency(slot.salary)}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                // EMPTY STATE (Blueprint Visual)
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 group-hover:text-slate-500 transition-colors gap-4">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-current flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                        <User className="w-10 h-10" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-50">
                        Selecionar
                    </span>
                </div>
            )}
        </div>
    );
};

export const SquadBuilderView: React.FC<SquadBuilderViewProps> = ({ players }) => {
  // View Mode State
  const [viewMode, setViewMode] = useState<'builder' | 'list'>('builder');

  // State for Squad Meta
  const [squadName, setSquadName] = useState('Novo Elenco');
  const [teamLogo, setTeamLogo] = useState<string | null>(null);
  
  // State for Slots
  // Initialize with standard lineup: Coach, Analyst, 4 Main Players
  const initialSlots: SquadSlot[] = [
      { id: 'coach', type: 'coach', role: 'Coach' },
      { id: 'analyst', type: 'analyst', role: 'Analista' },
      { id: 'p1', type: 'player', role: 'Rush 1' },
      { id: 'p2', type: 'player', role: 'Rush 2' },
      { id: 'p3', type: 'player', role: 'CPT' },
      { id: 'p4', type: 'player', role: 'Bomba' }, // Or Sniper/Sup
  ];

  const [slots, setSlots] = useState<SquadSlot[]>(initialSlots);
  const [history, setHistory] = useState<SquadSlot[][]>([initialSlots]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Modal State
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingPlayer, setViewingPlayer] = useState<KillStat | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Computed Values
  const totalSalary = useMemo(() => slots.reduce((acc, slot) => acc + (slot.salary || 0), 0), [slots]);

  // Computed Stats for the List View
  const squadStats = useMemo(() => {
    const filledSlots = slots.filter(s => s.assignedPlayer);
    let totalKills = 0;
    let totalMatches = 0;
    let playersCount = 0;
    let totalAvg = 0;

    const roster = filledSlots.map(slot => {
        const stats = players.find(p => p.player.toLowerCase() === slot.assignedPlayer?.toLowerCase());
        
        if (stats && slot.type === 'player' || slot.type === 'reserve') {
            totalKills += stats.totalKills;
            totalMatches += stats.matches;
            playersCount++;
            totalAvg += stats.kpg;
        }

        return {
            ...slot,
            realStats: stats || null
        };
    });

    return {
        roster,
        totalKills,
        totalMatches,
        avgKpg: playersCount > 0 ? (totalAvg / playersCount).toFixed(2) : '0.00'
    };
  }, [slots, players]);

  // -- HISTORY ACTIONS --
  const addToHistory = (newSlots: SquadSlot[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newSlots);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setSlots(newSlots);
  };

  const undo = () => {
      if (historyIndex > 0) {
          setHistoryIndex(historyIndex - 1);
          setSlots(history[historyIndex - 1]);
      }
  };

  const redo = () => {
      if (historyIndex < history.length - 1) {
          setHistoryIndex(historyIndex + 1);
          setSlots(history[historyIndex + 1]);
      }
  };

  // -- SLOT MANAGEMENT --
  const updateSlot = (id: string, updates: Partial<SquadSlot>) => {
      const newSlots = slots.map(s => s.id === id ? { ...s, ...updates } : s);
      addToHistory(newSlots);
  };

  const clearSlot = (id: string) => {
      updateSlot(id, { 
          assignedPlayer: undefined, 
          customImage: undefined, 
          definingWord: undefined, 
          salary: 0 
      });
  };

  const duplicateSlot = (id: string) => {
      const slotToCopy = slots.find(s => s.id === id);
      if (!slotToCopy) return;

      const newId = `extra-${Date.now()}`;
      const newSlot = { ...slotToCopy, id: newId, type: 'reserve' as const };
      
      const newSlots = [...slots, newSlot];
      addToHistory(newSlots);
  };

  const addReserveSlot = () => {
      const newId = `res-${Date.now()}`;
      const newSlot: SquadSlot = { id: newId, type: 'reserve', role: 'Reserva' };
      addToHistory([...slots, newSlot]);
  };
  
  const removeSlot = (id: string) => {
      const newSlots = slots.filter(s => s.id !== id);
      addToHistory(newSlots);
  };

  // -- STATS VIEWING --
  const handleViewStats = (playerName: string) => {
      const playerStats = players.find(p => p.player.toLowerCase() === playerName.toLowerCase());
      if (playerStats) {
          setViewingPlayer(playerStats);
      } else {
          // If player not found in list (manual entry), create a dummy object so modal opens
          setViewingPlayer({
              rank: 0,
              player: playerName,
              team: 'Manual / Coach',
              totalKills: 0,
              matches: 0,
              kpg: 0,
              events: 'Manual'
          });
      }
  };

  // -- IMAGE HANDLING --
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setTeamLogo(reader.result as string);
          reader.readAsDataURL(file);
      }
  };

  const handleCapture = async () => {
      const element = document.getElementById('squad-builder-canvas');
      if (!element) return;
      
      // Temporarily hide UI elements that shouldn't appear in screenshot
      element.classList.add('screenshot-mode');

      try {
          const canvas = await html2canvas(element, {
              backgroundColor: '#0B0F19',
              scale: 2,
              useCORS: true
          });
          const link = document.createElement('a');
          link.download = `squad-${squadName.replace(/\s+/g, '-').toLowerCase()}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
      } finally {
          element.classList.remove('screenshot-mode');
      }
  };

  const filteredPlayers = useMemo(() => {
      return players.filter(p => p.player.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [players, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-fade-in">
        
        {/* TOP TOOLBAR */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 sticky top-24 z-30">
            <div className="flex items-center gap-4 w-full md:w-auto">
                {/* View Toggle */}
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 shadow-inner">
                    <button 
                        onClick={() => setViewMode('builder')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                            viewMode === 'builder' 
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20' 
                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" /> Visual
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                            viewMode === 'list' 
                            ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md shadow-amber-500/20' 
                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <List className="w-3.5 h-3.5" /> Lista & Stats
                    </button>
                </div>

                <div className="h-6 w-px bg-white/10 hidden md:block"></div>

                <div className="flex gap-2">
                    <button onClick={undo} disabled={historyIndex === 0} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Desfazer">
                        <Undo2 className="w-5 h-5 text-slate-300" />
                    </button>
                    <button onClick={redo} disabled={historyIndex === history.length - 1} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Refazer">
                        <Redo2 className="w-5 h-5 text-slate-300" />
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-2"></div>
                    <button 
                        onClick={() => setSlots(initialSlots)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors" 
                        title="Resetar Elenco"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-3 ml-auto w-full md:w-auto justify-end">
                 <div className="px-4 py-2 bg-emerald-900/20 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                     <DollarSign className="w-4 h-4 text-emerald-500" />
                     <span className="text-emerald-300 font-mono font-bold text-sm">{formatCurrency(totalSalary)}</span>
                 </div>
                 {viewMode === 'builder' && (
                     <button 
                        onClick={handleCapture}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 text-sm whitespace-nowrap"
                     >
                        <Download className="w-4 h-4" /> PNG
                     </button>
                 )}
            </div>
        </div>

        {/* --- VIEW MODE 1: VISUAL BUILDER --- */}
        {viewMode === 'builder' && (
            <div id="squad-builder-canvas" className="glass-panel p-8 md:p-12 rounded-3xl min-h-[800px] border border-white/10 relative overflow-hidden bg-gradient-to-b from-[#0B0F19] to-[#05070a] animate-fade-in">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-900/5 rounded-full blur-[150px] pointer-events-none"></div>

                {/* Header: Logo & Name */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16 relative z-10">
                     <div className="flex items-center gap-6">
                         <div className="relative group cursor-pointer" onClick={() => logoInputRef.current?.click()}>
                             <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                             <div className="w-24 h-24 rounded-2xl bg-black/40 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden hover:border-indigo-500/50 transition-colors">
                                 {teamLogo ? (
                                     <img src={teamLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                                 ) : (
                                     <Upload className="w-6 h-6 text-slate-500 group-hover:text-indigo-400" />
                                 )}
                             </div>
                             <div className="absolute -bottom-2 w-full text-center">
                                 <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">LOGO</span>
                             </div>
                         </div>
                         <div>
                             <label className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1 block">Nome do Elenco</label>
                             <input 
                               type="text" 
                               value={squadName} 
                               onChange={(e) => setSquadName(e.target.value)}
                               className="bg-transparent text-4xl md:text-5xl font-black text-white border-b-2 border-transparent hover:border-white/10 focus:border-indigo-500 focus:outline-none transition-all w-full md:w-auto uppercase tracking-tight"
                             />
                         </div>
                     </div>
                </div>

                {/* --- GRID LAYOUT (Blueprint Style) --- */}
                
                <div className="flex flex-col gap-12 relative z-10">
                    
                    {/* 1. Staff Row (Centered) */}
                    <div className="flex flex-col items-center">
                        <div className="flex gap-4 md:gap-8 justify-center w-full max-w-2xl">
                            <div className="w-48 md:w-56">
                                {slots.find(s => s.id === 'coach') && <SlotCard slot={slots.find(s => s.id === 'coach')!} onEdit={setEditingSlotId} onViewStats={handleViewStats} />}
                            </div>
                            <div className="w-48 md:w-56">
                                {slots.find(s => s.id === 'analyst') && <SlotCard slot={slots.find(s => s.id === 'analyst')!} onEdit={setEditingSlotId} onViewStats={handleViewStats} />}
                            </div>
                        </div>
                    </div>

                    {/* 2. Main Lineup Row (Centered, 4 Columns) */}
                    <div className="flex flex-col items-center w-full">
                        <div className="text-center mb-4">
                            <h3 className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mb-2">Lineup Principal</h3>
                            <div className="h-px w-24 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent mx-auto"></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                             {['p1', 'p2', 'p3', 'p4'].map(id => {
                                 const slot = slots.find(s => s.id === id);
                                 return slot ? <SlotCard key={id} slot={slot} onEdit={setEditingSlotId} onViewStats={handleViewStats} /> : null;
                             })}
                        </div>
                    </div>

                    {/* 3. Reserves / Option 2 (Centered Grid) */}
                    <div className="flex flex-col items-center w-full pt-8 border-t border-white/5 border-dashed">
                        <div className="flex items-center justify-between w-full mb-6">
                            <h3 className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                                ↓ Opção 2 / Reservas
                            </h3>
                            <button 
                                onClick={addReserveSlot}
                                className="text-[10px] flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded border border-white/5 text-slate-400 transition-colors uppercase font-bold tracking-wider"
                            >
                                <Plus className="w-3 h-3" /> Add Slot
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                            {slots.filter(s => s.type === 'reserve').map(slot => (
                                <SlotCard key={slot.id} slot={slot} onEdit={setEditingSlotId} onViewStats={handleViewStats} />
                            ))}
                            {slots.filter(s => s.type === 'reserve').length === 0 && (
                                <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-xl text-slate-700 text-xs uppercase tracking-widest">
                                    Nenhum reserva adicionado.
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Branding Footer for Screenshot */}
                <div className="mt-16 pt-6 border-t border-white/5 flex justify-between items-center opacity-40">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-indigo-600 rounded"></div>
                        <span className="font-black text-white tracking-[0.2em] text-xs">JHANSTATS</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase">
                        Squad Builder • 2024
                    </div>
                </div>
            </div>
        )}

        {/* --- VIEW MODE 2: SUMMARY LIST --- */}
        {viewMode === 'list' && (
            <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden animate-fade-in shadow-2xl flex flex-col">
                <div className="p-6 md:p-8 bg-[#0B0F19] border-b border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black text-white mb-2">{squadName}</h2>
                        <p className="text-slate-400 text-sm">Resumo financeiro e estatístico do elenco montado.</p>
                    </div>
                </div>

                {/* Stats Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border-b border-white/5">
                    <div className="bg-[#0B0F19] p-6 flex flex-col items-center justify-center gap-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Custo Mensal</span>
                        <span className="text-2xl md:text-3xl font-mono font-bold text-emerald-400">{formatCurrency(totalSalary)}</span>
                    </div>
                    <div className="bg-[#0B0F19] p-6 flex flex-col items-center justify-center gap-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Poder de Fogo</span>
                        <span className="text-2xl md:text-3xl font-mono font-bold text-amber-400">{squadStats.totalKills} <span className="text-xs text-slate-500">Kills</span></span>
                    </div>
                    <div className="bg-[#0B0F19] p-6 flex flex-col items-center justify-center gap-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Média do Time</span>
                        <span className="text-2xl md:text-3xl font-mono font-bold text-indigo-400">{squadStats.avgKpg} <span className="text-xs text-slate-500">KPG</span></span>
                    </div>
                    <div className="bg-[#0B0F19] p-6 flex flex-col items-center justify-center gap-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Experiência</span>
                        <span className="text-2xl md:text-3xl font-mono font-bold text-blue-400">{squadStats.totalMatches} <span className="text-xs text-slate-500">Jogos</span></span>
                    </div>
                </div>

                {/* Detailed Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#111623] border-b border-white/5 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                                <th className="px-6 py-4">Slot / Função</th>
                                <th className="px-6 py-4">Jogador</th>
                                <th className="px-6 py-4 text-center">Salário</th>
                                <th className="px-6 py-4 text-center">Palavra Chave</th>
                                <th className="px-6 py-4 text-center text-amber-500">Abates</th>
                                <th className="px-6 py-4 text-center text-blue-500">Partidas</th>
                                <th className="px-6 py-4 text-center text-indigo-500">KPG</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-[#0B0F19]">
                            {squadStats.roster.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm">
                                        Nenhum jogador adicionado ao elenco ainda.
                                    </td>
                                </tr>
                            ) : (
                                squadStats.roster.map((slot, idx) => (
                                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded w-fit mb-1 border border-white/5">
                                                    {slot.role}
                                                </span>
                                                <span className="text-[10px] text-slate-500 uppercase">{slot.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {slot.customImage ? (
                                                    <img src={slot.customImage} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-white text-sm">{slot.assignedPlayer}</div>
                                                    {slot.realStats && <div className="text-[10px] text-slate-500">{slot.realStats.team}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-mono text-sm text-emerald-400 font-bold bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                                                {slot.salary ? formatCurrency(slot.salary) : '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {slot.definingWord ? (
                                                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                                                    "{slot.definingWord}"
                                                </span>
                                            ) : (
                                                <span className="text-slate-700">-</span>
                                            )}
                                        </td>
                                        {/* Stats Columns */}
                                        <td className="px-6 py-4 text-center font-mono font-bold text-amber-400">
                                            {slot.realStats ? slot.realStats.totalKills : <span className="text-slate-700">-</span>}
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono text-slate-400">
                                            {slot.realStats ? slot.realStats.matches : <span className="text-slate-700">-</span>}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                             {slot.realStats ? (
                                                 <span className={`font-mono text-xs px-2 py-1 rounded font-bold ${Number(slot.realStats.kpg) > 1.5 ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500'}`}>
                                                     {slot.realStats.kpg}
                                                 </span>
                                             ) : <span className="text-slate-700">-</span>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* --- EDIT MODAL --- */}
        {editingSlotId && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setEditingSlotId(null)}></div>
                <div className="relative bg-[#0F1420] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] animate-fade-in">
                    
                    {/* Header */}
                    <div className="p-5 border-b border-white/5 flex justify-between items-center">
                        <h3 className="font-bold text-white text-lg">Editar Slot</h3>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => {
                                    duplicateSlot(editingSlotId);
                                    setEditingSlotId(null);
                                }}
                                className="p-2 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white" title="Duplicar Slot"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                             <button 
                                onClick={() => {
                                    clearSlot(editingSlotId);
                                    // setEditingSlotId(null); // Keep open to re-edit? Or close. Let's keep open.
                                }}
                                className="p-2 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white" title="Limpar Dados"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            {slots.find(s => s.id === editingSlotId)?.type === 'reserve' && (
                                <button 
                                    onClick={() => {
                                        removeSlot(editingSlotId);
                                        setEditingSlotId(null);
                                    }}
                                    className="p-2 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400" title="Excluir Slot"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <button onClick={() => setEditingSlotId(null)} className="p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white ml-2">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content Scrollable */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                        
                        {/* 1. Select Player (Search or Manual) */}
                        <div>
                            <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Selecionar Jogador / Coach</label>
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar na lista WB..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
                                />
                                {searchTerm && (
                                    <div className="absolute top-full left-0 w-full bg-slate-900 border border-slate-700 rounded-xl mt-2 max-h-48 overflow-y-auto z-50 shadow-xl">
                                        <button 
                                            onClick={() => {
                                                updateSlot(editingSlotId, { assignedPlayer: searchTerm });
                                                setSearchTerm('');
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-emerald-600/20 text-emerald-400 hover:text-emerald-300 border-b border-white/5 font-bold text-xs uppercase tracking-wide flex items-center gap-2"
                                        >
                                            <Plus className="w-3 h-3" /> Usar "{searchTerm}" (Manual)
                                        </button>
                                        {filteredPlayers.slice(0, 20).map(p => (
                                            <button 
                                                key={p.player}
                                                onClick={() => {
                                                    updateSlot(editingSlotId, { assignedPlayer: p.player });
                                                    setSearchTerm('');
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-indigo-600/20 text-sm text-slate-300 hover:text-white border-b border-white/5 last:border-0"
                                            >
                                                {p.player} <span className="text-xs text-slate-500 ml-2">({p.team})</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Explicit Manual Input for clarity */}
                            <div className="flex gap-2 items-center">
                                <div className="h-px bg-white/5 flex-1"></div>
                                <span className="text-[10px] text-slate-600 uppercase font-bold">OU DIGITE MANUALMENTE</span>
                                <div className="h-px bg-white/5 flex-1"></div>
                            </div>

                            <div className="mt-3 relative">
                                <PenTool className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                <input 
                                    type="text" 
                                    placeholder="Nome Manual (Ex: Coach XYZ)" 
                                    value={slots.find(s => s.id === editingSlotId)?.assignedPlayer || ''}
                                    onChange={(e) => updateSlot(editingSlotId, { assignedPlayer: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
                                />
                            </div>
                        </div>

                        {/* 2. Role Selection */}
                        <div>
                            <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Função / Cargo</label>
                            <div className="flex flex-wrap gap-2">
                                {ROLES.map(role => (
                                    <button
                                        key={role}
                                        onClick={() => updateSlot(editingSlotId, { role })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                            slots.find(s => s.id === editingSlotId)?.role === role
                                            ? 'bg-indigo-600 border-indigo-500 text-white'
                                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                                        }`}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Image Upload & Custom Word */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Foto Customizada</label>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-32 bg-black/40 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 transition-colors overflow-hidden"
                                >
                                    {slots.find(s => s.id === editingSlotId)?.customImage ? (
                                        <img src={slots.find(s => s.id === editingSlotId)?.customImage} className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <Upload className="w-6 h-6 text-slate-500 mb-2" />
                                            <span className="text-[10px] text-slate-500">Upload Imagem</span>
                                        </>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => updateSlot(editingSlotId, { customImage: reader.result as string });
                                                reader.readAsDataURL(file);
                                            }
                                        }} 
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Palavra Definição</label>
                                    <input 
                                        type="text" 
                                        maxLength={12}
                                        placeholder="Ex: Lenda"
                                        value={slots.find(s => s.id === editingSlotId)?.definingWord || ''}
                                        onChange={(e) => updateSlot(editingSlotId, { definingWord: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Salário (R$)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-emerald-500" />
                                        <input 
                                            type="number" 
                                            placeholder="20000"
                                            value={slots.find(s => s.id === editingSlotId)?.salary || ''}
                                            onChange={(e) => updateSlot(editingSlotId, { salary: parseFloat(e.target.value) || 0 })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none font-mono"
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        {[10000, 20000, 50000].map(val => (
                                            <button 
                                                key={val}
                                                onClick={() => updateSlot(editingSlotId, { salary: val })}
                                                className="text-[10px] bg-emerald-900/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 hover:bg-emerald-900/40"
                                            >
                                                {val/1000}k
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="p-5 border-t border-white/5 flex justify-end">
                        <button 
                            onClick={() => setEditingSlotId(null)}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors"
                        >
                            Concluir Edição
                        </button>
                    </div>

                </div>
            </div>
        )}

        {/* --- FULL PROFILE STATS MODAL (Replaces simplified modal) --- */}
        {viewingPlayer && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md" onClick={() => setViewingPlayer(null)}></div>
                <div className="relative w-full max-w-7xl h-[90vh] bg-[#0B0F19] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
                    <div className="absolute top-4 right-4 z-50">
                        <button 
                            onClick={() => setViewingPlayer(null)}
                            className="p-2 rounded-full bg-black/50 text-slate-400 hover:text-white border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    {/* Use the exact same component as the Profile Tab */}
                    {/* FIXED: Added flex flex-col to parent wrapper so child flex-1 works and enables scrolling */}
                    <div className="flex-1 flex flex-col overflow-hidden p-6">
                        <PlayerDetailedProfile player={viewingPlayer} />
                    </div>
                </div>
            </div>
        )}

    </div>
  );
};