import React, { useState, useEffect, useRef } from 'react';
import { KillStat, ValuationForm } from '../types';
import { 
  Calculator, 
  Trophy, 
  Target, 
  Instagram, 
  TrendingUp, 
  Crown, 
  AlertCircle, 
  Save, 
  RotateCcw, 
  Printer, 
  Download, 
  ChevronDown, 
  Plus, 
  Trash2, 
  HelpCircle, 
  CheckCircle2, 
  DollarSign, 
  Share2, 
  Layout, 
  ArrowLeft 
} from 'lucide-react';
import html2canvas from 'html2canvas';

// --- TYPES & CONSTANTS ---

interface ValuationViewProps {
  players: KillStat[];
  savedForm?: ValuationForm | null;
  onSaveForm?: (form: ValuationForm) => void;
}

interface Competition {
  id: string;
  name: string;
  type: 'ONLINE' | 'PRESENCIAL';
  tier: 'S' | 'A' | 'B' | 'C';
}

const PREDEFINED_COMPETITIONS: Competition[] = [
  { id: 'ewc', name: 'Esports World Cup (EWC)', type: 'PRESENCIAL', tier: 'S' },
  { id: 'ffws_world', name: 'FFWS Mundial', type: 'PRESENCIAL', tier: 'S' },
  { id: 'ffws_br', name: 'FFWS Brasil', type: 'PRESENCIAL', tier: 'A' },
  { id: 'copa_ff', name: 'Copa FF', type: 'ONLINE', tier: 'A' },
  { id: 'laff', name: 'Liga Amadora (LAFF)', type: 'ONLINE', tier: 'B' },
  { id: 'lbff', name: 'LBFF (Histórico)', type: 'PRESENCIAL', tier: 'A' },
  { id: 'nfa', name: 'Liga NFA', type: 'ONLINE', tier: 'B' },
];

const ROLES = [
  { id: 'rush1', label: 'RUSH 1', weight: 1.2 }, // Peso alto
  { id: 'rush2', label: 'RUSH 2', weight: 1.1 }, // Peso médio-alto
  { id: 'grandeiro', label: 'GRANDEIRO', weight: 1.0 }, // Médio
  { id: 'sniper', label: 'SNIPER', weight: 1.0 }, // Médio
  { id: 'flex', label: 'FLEX', weight: 1.15 }, // Versatilidade
];

const INITIAL_FORM: ValuationForm = {
  playerName: '',
  role: 'rush1',
  isCaptain: false,
  officialKills: 0,
  booyahs: 0,
  followers: 0,
  engagement: 0,
  competitionsDisputed: [],
  titles: [],
  participations: [],
  recentCompetitions: [{ name: '', type: 'ONLINE', position: 0 }]
};

// --- COMPONENTS ---

const Tooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-block ml-2">
    <HelpCircle className="w-4 h-4 text-slate-500 hover:text-indigo-400 transition-colors cursor-help" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-300 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center backdrop-blur-md">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-2 border-8 border-transparent border-t-slate-900"></div>
    </div>
  </div>
);

// --- MAIN VIEW ---

export const ValuationView: React.FC<ValuationViewProps> = ({ players, savedForm, onSaveForm }) => {
  // Initialize form with saved state OR initial state
  const [form, setForm] = useState<ValuationForm>(savedForm || INITIAL_FORM);
  
  const [step, setStep] = useState<'form' | 'result' | 'report'>('form');
  const [score, setScore] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [tier, setTier] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [playerSearch, setPlayerSearch] = useState('');
  const [showPlayerDropdown, setShowPlayerDropdown] = useState(false);

  // Sync local form changes to parent component
  useEffect(() => {
      if (onSaveForm) {
          onSaveForm(form);
      }
  }, [form, onSaveForm]);

  // Sync player search input if form has a name (when loading saved state)
  useEffect(() => {
      if (form.playerName && !playerSearch) {
          setPlayerSearch(form.playerName);
      }
  }, []);

  // Filter players for dropdown
  const filteredPlayers = players.filter(p => p.player.toLowerCase().includes(playerSearch.toLowerCase())).slice(0, 10);

  // --- CALCULATION ENGINE ---
  const calculateValuation = () => {
    // 1. Validar campos obrigatórios básicos
    if (!form.playerName) {
        alert("Por favor, informe o nome do jogador.");
        return;
    }

    let rawScore = 0;

    // A. PESO: ROLE & CAPITÃO (Max ~20 pts)
    const roleWeight = ROLES.find(r => r.id === form.role)?.weight || 1;
    let roleScore = 10 * roleWeight;
    if (form.isCaptain) {
        roleScore += 5; // Bônus capitão
        // Bônus Booyah (apenas se capitão) - Max 3 pts
        roleScore += Math.min(3, form.booyahs * 0.2); 
    }
    rawScore += roleScore;

    // B. PESO: KILLS (Max ~20 pts)
    // Escala logarítmica suave. 1000 kills = 10 pts, 2000 = 15 pts, 3000+ = 20 pts
    let killsScore = 0;
    if (form.officialKills > 0) {
        killsScore = Math.min(20, Math.log10(form.officialKills) * 5); 
    }
    rawScore += killsScore;

    // C. PESO: SOCIAL (Max ~10 pts)
    let socialScore = 0;
    if (form.followers > 1000000) socialScore += 7;
    else if (form.followers > 100000) socialScore += 5;
    else if (form.followers > 10000) socialScore += 2;
    
    // Engajamento bônus
    if (form.engagement > 10) socialScore += 3;
    else if (form.engagement > 5) socialScore += 1.5;
    
    rawScore += Math.min(10, socialScore);

    // D. COMPETIÇÕES & TÍTULOS (Max ~30 pts)
    let compScore = 0;
    
    // Títulos
    form.titles.forEach(t => {
        const comp = PREDEFINED_COMPETITIONS.find(c => c.name === t.name);
        const multiplier = comp?.tier === 'S' ? 5 : comp?.tier === 'A' ? 3 : 1;
        compScore += t.count * multiplier;
    });

    // Participações (Experiência)
    form.participations.forEach(p => {
         compScore += p.count * 0.5; // 0.5 ponto por participação
    });

    // Competições Chanceladas (Qualidade do calendário)
    form.competitionsDisputed.forEach(c => {
        if (c.tier === 'S') compScore += 2;
        if (c.tier === 'A') compScore += 1;
    });

    rawScore += Math.min(30, compScore);

    // E. RECÊNCIA (Últimas 3) (Max ~20 pts)
    let recentScore = 0;
    form.recentCompetitions.forEach(rc => {
        if (!rc.name) return;
        
        let posPoints = 0;
        if (rc.position === 1) posPoints = 7;
        else if (rc.position <= 3) posPoints = 5;
        else if (rc.position <= 12) posPoints = 2;
        
        // Peso por tipo
        if (rc.type === 'PRESENCIAL') posPoints *= 1.2;
        
        recentScore += posPoints;
    });
    
    rawScore += Math.min(20, recentScore);

    // NORMALIZAÇÃO (0-100)
    // O rawScore teórico máximo é ~100. Vamos clamp.
    const finalScore = Math.min(100, Math.round(rawScore));
    setScore(finalScore);

    // DEFINIR TIER & SALÁRIO
    if (finalScore >= 80) {
        setTier('TIER S');
        setSalaryRange('R$ 8.000 a R$ 20.000+');
    } else if (finalScore >= 60) {
        setTier('TIER A');
        setSalaryRange('R$ 5.000 a R$ 7.999');
    } else if (finalScore >= 40) {
        setTier('TIER B');
        setSalaryRange('R$ 3.000 a R$ 4.999');
    } else if (finalScore >= 20) {
        setTier('TIER C');
        setSalaryRange('R$ 1.500 a R$ 2.999');
    } else {
        setTier('TIER D');
        setSalaryRange('Até R$ 1.499');
    }

    setStep('result');
  };

  // Animation Effect
  useEffect(() => {
    if (step === 'result' || step === 'report') {
        let start = 0;
        const duration = 1500;
        const increment = score / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= score) {
                setAnimatedScore(score);
                clearInterval(timer);
            } else {
                setAnimatedScore(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }
  }, [step, score]);

  // --- ACTIONS ---

  const handleReset = () => {
      setForm(INITIAL_FORM);
      setPlayerSearch('');
      setStep('form');
      setShowResetConfirm(false);
  };

  const handleCapture = async (elementId: string, filename: string) => {
      const element = document.getElementById(elementId);
      if (!element) return;
      
      // Add specific print styles temporarily
      element.classList.add('print-capture-mode');
      
      try {
          const canvas = await html2canvas(element, {
              backgroundColor: '#0B0F19',
              scale: 2,
              useCORS: true,
              logging: false
          });
          const link = document.createElement('a');
          link.download = `${filename}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
      } finally {
          element.classList.remove('print-capture-mode');
      }
  };

  // --- DYNAMIC FIELD HELPERS ---

  const addCompetition = () => {
      setForm(prev => ({
          ...prev,
          competitionsDisputed: [...prev.competitionsDisputed, { name: 'FFWS Brasil', type: 'PRESENCIAL', tier: 'A' }]
      }));
  };

  const removeCompetition = (idx: number) => {
      const newList = [...form.competitionsDisputed];
      newList.splice(idx, 1);
      setForm(prev => ({ ...prev, competitionsDisputed: newList }));
  };

  const updateCompetition = (idx: number, field: string, value: string) => {
      const newList = [...form.competitionsDisputed];
      (newList[idx] as any)[field] = value;
      
      // Auto-update Tier/Type if predefined selected
      if (field === 'name') {
          const pre = PREDEFINED_COMPETITIONS.find(p => p.name === value);
          if (pre) {
              newList[idx].type = pre.type;
              newList[idx].tier = pre.tier;
          }
      }
      
      setForm(prev => ({ ...prev, competitionsDisputed: newList }));
  };
  
  // Reuse similiar logic for Titles and Participations
  const addTitle = () => setForm(prev => ({ ...prev, titles: [...prev.titles, { name: 'FFWS Brasil', count: 1 }] }));
  const removeTitle = (idx: number) => { const n = [...form.titles]; n.splice(idx, 1); setForm(p => ({...p, titles: n})); };
  const updateTitle = (idx: number, f: string, v: any) => { const n = [...form.titles]; (n[idx] as any)[f] = v; setForm(p => ({...p, titles: n})); };

  const addPart = () => setForm(prev => ({ ...prev, participations: [...prev.participations, { name: 'FFWS Brasil', count: 1 }] }));
  const removePart = (idx: number) => { const n = [...form.participations]; n.splice(idx, 1); setForm(p => ({...p, participations: n})); };
  const updatePart = (idx: number, f: string, v: any) => { const n = [...form.participations]; (n[idx] as any)[f] = v; setForm(p => ({...p, participations: n})); };

  const updateRecent = (idx: number, f: string, v: any) => { 
      const n = [...form.recentCompetitions]; 
      (n[idx] as any)[f] = v; 
      
      if (f === 'name') {
          const pre = PREDEFINED_COMPETITIONS.find(p => p.name === v);
          if (pre) n[idx].type = pre.type;
      }
      
      setForm(p => ({...p, recentCompetitions: n})); 
  };


  // --- RENDERERS ---

  if (step === 'form') {
      return (
          <div className="max-w-5xl mx-auto pb-20 animate-fade-in relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                  <div>
                      <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
                          Valuation <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">WB</span>
                      </h1>
                      <p className="text-slate-400 text-sm">
                          Calculadora de valor de mercado e definição salarial de atletas.
                      </p>
                  </div>
                  <div className="flex gap-3">
                      <button onClick={() => setShowHelp(true)} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                          <HelpCircle className="w-6 h-6" />
                      </button>
                      <button onClick={() => setShowResetConfirm(true)} className="p-2 rounded-full hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-6 h-6" />
                      </button>
                  </div>
              </div>

              {/* Form Container */}
              <div className="glass-panel border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                   {/* Background Elements */}
                   <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                       
                       {/* 1. PLAYER DATA */}
                       <div className="space-y-6">
                           <div className="flex items-center gap-2 mb-4 text-indigo-400 font-bold uppercase tracking-wider text-sm border-b border-white/5 pb-2">
                               <CheckCircle2 className="w-4 h-4" /> Dados do Jogador
                           </div>
                           
                           <div className="relative z-20">
                               <label className="block text-xs text-slate-500 font-bold uppercase mb-2">Nome do Jogador *</label>
                               <div className="relative">
                                   <input 
                                       type="text" 
                                       value={playerSearch}
                                       onChange={(e) => {
                                           setPlayerSearch(e.target.value);
                                           setForm(prev => ({...prev, playerName: e.target.value}));
                                           setShowPlayerDropdown(true);
                                       }}
                                       onFocus={() => setShowPlayerDropdown(true)}
                                       placeholder="Digite ou selecione..."
                                       className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                                   />
                                   {showPlayerDropdown && playerSearch && (
                                       <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar z-50">
                                           {filteredPlayers.map(p => (
                                               <button
                                                   key={p.player}
                                                   onClick={() => {
                                                       setForm(prev => ({...prev, playerName: p.player, officialKills: p.totalKills}));
                                                       setPlayerSearch(p.player);
                                                       setShowPlayerDropdown(false);
                                                   }}
                                                   className="w-full text-left px-4 py-3 hover:bg-indigo-600/20 text-slate-300 hover:text-white text-sm border-b border-white/5 last:border-0"
                                               >
                                                   <span className="font-bold">{p.player}</span> <span className="text-xs text-slate-500 ml-2">({p.team})</span>
                                               </button>
                                           ))}
                                       </div>
                                   )}
                               </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                               <div>
                                   <label className="block text-xs text-slate-500 font-bold uppercase mb-2 flex items-center">
                                       Função <Tooltip text="A função influencia o peso. Rush e Flex tendem a ter maior valorização de mercado." />
                                   </label>
                                   <select 
                                       value={form.role}
                                       onChange={(e) => setForm(prev => ({...prev, role: e.target.value}))}
                                       className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-indigo-500 appearance-none"
                                   >
                                       {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                                   </select>
                               </div>
                               <div>
                                   <label className="block text-xs text-slate-500 font-bold uppercase mb-2 flex items-center">
                                       Capitão? <Tooltip text="Capitães recebem bônus de liderança no valuation." />
                                   </label>
                                   <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/10">
                                       <button 
                                           onClick={() => setForm(prev => ({...prev, isCaptain: true}))}
                                           className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${form.isCaptain ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-white'}`}
                                       >
                                           SIM
                                       </button>
                                       <button 
                                           onClick={() => setForm(prev => ({...prev, isCaptain: false}))}
                                           className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!form.isCaptain ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-white'}`}
                                       >
                                           NÃO
                                       </button>
                                   </div>
                               </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                               <div>
                                   <label className="block text-xs text-slate-500 font-bold uppercase mb-2 flex items-center">
                                       Kills Oficiais <Tooltip text="Total de abates em competições oficiais chanceladas." />
                                   </label>
                                   <input 
                                       type="number"
                                       value={form.officialKills}
                                       onChange={(e) => setForm(prev => ({...prev, officialKills: parseInt(e.target.value)||0}))}
                                       className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-white font-mono focus:outline-none focus:border-indigo-500"
                                   />
                               </div>
                               <div className={`${!form.isCaptain ? 'opacity-50 pointer-events-none' : ''}`}>
                                   <label className="block text-xs text-slate-500 font-bold uppercase mb-2 flex items-center">
                                       Booyahs (Last) <Tooltip text="Critério exclusivo para Capitães." />
                                   </label>
                                   <input 
                                       type="number"
                                       value={form.booyahs}
                                       onChange={(e) => setForm(prev => ({...prev, booyahs: parseInt(e.target.value)||0}))}
                                       className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-white font-mono focus:outline-none focus:border-indigo-500"
                                   />
                               </div>
                           </div>
                           
                           {/* Social */}
                           <div>
                               <div className="flex items-center gap-2 mb-4 mt-6 text-pink-400 font-bold uppercase tracking-wider text-sm border-b border-white/5 pb-2">
                                   <Instagram className="w-4 h-4" /> Alcance & Mídia
                               </div>
                               <div className="grid grid-cols-2 gap-4">
                                   <div>
                                       <label className="block text-xs text-slate-500 font-bold uppercase mb-2">Seguidores</label>
                                       <input 
                                           type="number"
                                           placeholder="Ex: 50000"
                                           value={form.followers || ''}
                                           onChange={(e) => setForm(prev => ({...prev, followers: parseInt(e.target.value)||0}))}
                                           className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-white font-mono focus:outline-none focus:border-pink-500"
                                       />
                                   </div>
                                   <div>
                                       <label className="block text-xs text-slate-500 font-bold uppercase mb-2">Engajamento (%)</label>
                                       <input 
                                           type="number"
                                           placeholder="Ex: 5.5"
                                           value={form.engagement || ''}
                                           onChange={(e) => setForm(prev => ({...prev, engagement: parseFloat(e.target.value)||0}))}
                                           className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-white font-mono focus:outline-none focus:border-pink-500"
                                       />
                                   </div>
                               </div>
                           </div>
                       </div>

                       {/* 2. COMPETITIVE HISTORY */}
                       <div className="space-y-6">
                           <div className="flex items-center gap-2 mb-4 text-amber-400 font-bold uppercase tracking-wider text-sm border-b border-white/5 pb-2">
                               <Trophy className="w-4 h-4" /> Histórico Competitivo
                           </div>
                           
                           {/* Competitions Disputed */}
                           <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                               <div className="flex justify-between items-center mb-2">
                                   <label className="text-xs text-slate-400 font-bold uppercase">Competições Disputadas</label>
                                   <button onClick={addCompetition} className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-white flex items-center gap-1 transition-colors"><Plus className="w-3 h-3" /> Add</button>
                               </div>
                               <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                                   {form.competitionsDisputed.map((c, idx) => (
                                       <div key={idx} className="flex gap-2 items-center">
                                           <select 
                                               value={c.name} 
                                               onChange={(e) => updateCompetition(idx, 'name', e.target.value)}
                                               className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                                           >
                                               <option value="">Selecione...</option>
                                               {PREDEFINED_COMPETITIONS.map(pc => <option key={pc.id} value={pc.name}>{pc.name}</option>)}
                                               <option value="Outro">Outro (Manual)</option>
                                           </select>
                                           <select 
                                               value={c.type} 
                                               onChange={(e) => updateCompetition(idx, 'type', e.target.value)}
                                               className="w-24 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-300"
                                           >
                                               <option value="ONLINE">Online</option>
                                               <option value="PRESENCIAL">Presencial</option>
                                           </select>
                                           <button onClick={() => removeCompetition(idx)} className="text-slate-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                       </div>
                                   ))}
                                   {form.competitionsDisputed.length === 0 && <div className="text-center text-xs text-slate-600 py-2">Nenhuma adicionada.</div>}
                               </div>
                           </div>

                           {/* Titles */}
                           <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                               <div className="flex justify-between items-center mb-2">
                                   <label className="text-xs text-slate-400 font-bold uppercase">Títulos Oficiais</label>
                                   <button onClick={addTitle} className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-white flex items-center gap-1 transition-colors"><Plus className="w-3 h-3" /> Add</button>
                               </div>
                               <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                                   {form.titles.map((t, idx) => (
                                       <div key={idx} className="flex gap-2 items-center">
                                            <select 
                                               value={t.name} 
                                               onChange={(e) => updateTitle(idx, 'name', e.target.value)}
                                               className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                                           >
                                               {PREDEFINED_COMPETITIONS.map(pc => <option key={pc.id} value={pc.name}>{pc.name}</option>)}
                                           </select>
                                           <input 
                                               type="number" 
                                               value={t.count}
                                               onChange={(e) => updateTitle(idx, 'count', parseInt(e.target.value))}
                                               className="w-16 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white text-center"
                                               min="1"
                                           />
                                           <button onClick={() => removeTitle(idx)} className="text-slate-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                       </div>
                                   ))}
                                    {form.titles.length === 0 && <div className="text-center text-xs text-slate-600 py-2">Sem títulos registrados.</div>}
                               </div>
                           </div>
                           
                           {/* Recent Performance */}
                           <div>
                               <label className="block text-xs text-slate-500 font-bold uppercase mb-2 flex items-center">
                                   Últimas 3 Competições <Tooltip text="O desempenho recente tem grande peso no valuation atual." />
                               </label>
                               <div className="space-y-2">
                                   {[0, 1, 2].map(idx => (
                                       <div key={idx} className="flex gap-2 items-center">
                                            <span className="text-[10px] text-slate-600 font-mono w-4">{idx+1}.</span>
                                            <select 
                                               value={form.recentCompetitions[idx]?.name || ''} 
                                               onChange={(e) => {
                                                   const newList = [...form.recentCompetitions];
                                                   if (!newList[idx]) newList[idx] = { name: '', type: 'ONLINE', position: 0 };
                                                   updateRecent(idx, 'name', e.target.value);
                                               }}
                                               className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-xs text-white"
                                           >
                                               <option value="">Selecione a competição...</option>
                                               {PREDEFINED_COMPETITIONS.map(pc => <option key={pc.id} value={pc.name}>{pc.name}</option>)}
                                           </select>
                                           <input 
                                               type="number" 
                                               placeholder="Pos"
                                               value={form.recentCompetitions[idx]?.position || ''}
                                               onChange={(e) => updateRecent(idx, 'position', parseInt(e.target.value))}
                                               className="w-16 bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-xs text-white text-center placeholder-slate-600"
                                           />
                                       </div>
                                   ))}
                               </div>
                           </div>

                       </div>
                   </div>

                   {/* CALCULATE BUTTON */}
                   <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                       <button 
                           onClick={calculateValuation}
                           className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg uppercase tracking-widest rounded-xl overflow-hidden transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:scale-105 active:scale-95"
                       >
                           <span className="relative z-10 flex items-center gap-3">
                               <Calculator className="w-5 h-5" /> Calcular Valuation
                           </span>
                           <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity animate-shine bg-[length:200%_100%]"></div>
                       </button>
                   </div>
              </div>

              {/* Reset Confirm Modal */}
              {showResetConfirm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                      <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
                          <h3 className="text-white font-bold text-lg mb-2">Limpar todos os campos?</h3>
                          <p className="text-slate-400 text-sm mb-6">Todos os dados inseridos serão perdidos. Esta ação não pode ser desfeita.</p>
                          <div className="flex justify-end gap-3">
                              <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancelar</button>
                              <button onClick={handleReset} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold">Confirmar</button>
                          </div>
                      </div>
                  </div>
              )}

              {/* Help Modal */}
              {showHelp && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4" onClick={() => setShowHelp(false)}>
                      <div className="bg-[#0B0F19] border border-white/10 w-full max-w-2xl max-h-[80vh] overflow-y-auto custom-scrollbar rounded-3xl p-8 relative shadow-2xl" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><Trash2 className="w-5 h-5 rotate-45" /></button>
                          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2"><HelpCircle className="w-6 h-6 text-indigo-500" /> Como funciona o Valuation?</h2>
                          
                          <div className="space-y-6 text-slate-300 text-sm">
                              <p>O algoritmo do JhanStats utiliza um sistema de pesos ponderados para calcular o valor de mercado de um jogador (0 a 100).</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="bg-white/5 p-4 rounded-xl">
                                      <h3 className="font-bold text-white mb-2 text-indigo-400">Pesos Principais</h3>
                                      <ul className="space-y-2 list-disc pl-4">
                                          <li><strong>Função:</strong> Rush e Flex possuem multiplicadores maiores. Capitães ganham bônus.</li>
                                          <li><strong>Performance:</strong> Kills em competições oficiais usam escala logarítmica.</li>
                                          <li><strong>Mídia:</strong> Seguidores e engajamento somam até 10% do score.</li>
                                          <li><strong>Conquistas:</strong> Títulos em Tiers S e A têm peso massivo.</li>
                                      </ul>
                                  </div>
                                  <div className="bg-white/5 p-4 rounded-xl">
                                      <h3 className="font-bold text-white mb-2 text-emerald-400">Faixas Salariais</h3>
                                      <ul className="space-y-2">
                                          <li className="flex justify-between"><span>Tier S (80+)</span> <span className="font-mono text-white">R$ 8k - 20k+</span></li>
                                          <li className="flex justify-between"><span>Tier A (60-79)</span> <span className="font-mono text-white">R$ 5k - 8k</span></li>
                                          <li className="flex justify-between"><span>Tier B (40-59)</span> <span className="font-mono text-white">R$ 3k - 5k</span></li>
                                          <li className="flex justify-between"><span>Tier C (20-39)</span> <span className="font-mono text-white">R$ 1.5k - 3k</span></li>
                                      </ul>
                                  </div>
                              </div>
                              
                              <p className="text-xs text-slate-500 mt-4 border-t border-white/5 pt-4">
                                  Nota: Os valores são estimativas baseadas no mercado atual e não garantem propostas reais.
                              </p>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  // ... rest of the component (Step Result and Report) stays exactly the same, 
  // just re-including it implicitly since we are replacing the whole file content block.
  // --- RESULT VIEW ---
  if (step === 'result') {
      return (
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[600px] animate-fade-in text-center relative">
              <div className="absolute inset-0 bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none"></div>
              
              <div className="relative z-10 w-full max-w-lg">
                  <div className="mb-2 text-indigo-400 font-bold tracking-[0.3em] text-sm uppercase">Score Calculado</div>
                  <div className="text-7xl md:text-9xl font-black text-white mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] tabular-nums">
                      {animatedScore}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-800 rounded-full mb-8 overflow-hidden relative">
                      <div 
                          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 transition-all duration-[1500ms] ease-out"
                          style={{ width: `${animatedScore}%` }}
                      ></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-black/40 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                          <div className="text-slate-500 text-xs font-bold uppercase mb-1">Classificação</div>
                          <div className={`text-3xl font-black ${score >= 80 ? 'text-amber-400' : score >= 60 ? 'text-indigo-400' : 'text-slate-300'}`}>{tier}</div>
                      </div>
                      <div className="bg-black/40 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                          <div className="text-slate-500 text-xs font-bold uppercase mb-1">Valor de Mercado</div>
                          <div className="text-lg md:text-xl font-bold text-emerald-400 font-mono">{salaryRange}</div>
                      </div>
                  </div>

                  <div className="flex flex-col gap-3">
                      <button 
                          onClick={() => setStep('report')}
                          className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors shadow-lg shadow-white/10 flex items-center justify-center gap-2"
                      >
                          <Layout className="w-5 h-5" /> Visualizar Relatório Completo
                      </button>
                      <button 
                          onClick={handleReset}
                          className="w-full py-4 bg-black/40 border border-white/10 text-slate-400 font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 hover:text-white transition-colors"
                      >
                          Novo Cálculo
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  // --- REPORT VIEW (PRINTABLE) ---
  if (step === 'report') {
      return (
          <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-8 sticky top-24 z-50 bg-[#0B0F19]/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl">
                  <button onClick={() => setStep('result')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-sm">
                      <ArrowLeft className="w-4 h-4" /> Voltar
                  </button>
                  <div className="flex gap-3">
                      <button onClick={() => handleCapture('valuation-report-card', `Valuation-${form.playerName}`)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs uppercase flex items-center gap-2 transition-colors">
                          <Download className="w-4 h-4" /> Salvar Imagem
                      </button>
                      <button onClick={() => window.print()} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-xs uppercase flex items-center gap-2 transition-colors">
                          <Printer className="w-4 h-4" /> Imprimir
                      </button>
                      <button onClick={handleReset} className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg font-bold text-xs uppercase flex items-center gap-2 transition-colors">
                          <RotateCcw className="w-4 h-4" /> Início
                      </button>
                  </div>
              </div>

              {/* REPORT CARD */}
              <div id="valuation-report-card" className="bg-[#0B0F19] rounded-[2rem] border border-white/10 p-8 md:p-12 relative overflow-hidden shadow-2xl">
                  {/* Watermarks / Backgrounds */}
                  <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-indigo-900/20 to-transparent rounded-full blur-[120px] pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-t from-amber-900/10 to-transparent rounded-full blur-[100px] pointer-events-none"></div>

                  <div className="relative z-10">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-12 border-b border-white/10 pb-8">
                          <div>
                              <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-[0.3em] text-xs mb-2">
                                  <Crown className="w-4 h-4" /> Relatório Oficial
                              </div>
                              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-2">{form.playerName}</h1>
                              <div className="flex items-center gap-4 text-slate-400 text-sm">
                                  <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5 uppercase font-bold">{ROLES.find(r => r.id === form.role)?.label}</span>
                                  {form.isCaptain && <span className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20 uppercase font-bold flex items-center gap-1"><Crown className="w-3 h-3" /> Capitão</span>}
                              </div>
                          </div>
                          <div className="text-right">
                              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Score Final</div>
                              <div className="text-6xl font-black text-white leading-none">{score}<span className="text-2xl text-slate-600">/100</span></div>
                          </div>
                      </div>

                      {/* Main Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                          {/* Col 1: Financial & Tier */}
                          <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900/50 p-6 rounded-2xl border border-indigo-500/20 relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                  <TrendingUp className="w-24 h-24 text-indigo-400" />
                              </div>
                              <h3 className="text-indigo-300 font-bold uppercase tracking-wider text-xs mb-4">Classificação de Mercado</h3>
                              <div className="mb-6">
                                  <div className="text-slate-500 text-xs mb-1">Tier Definido</div>
                                  <div className={`text-4xl font-black ${score >= 80 ? 'text-amber-400' : 'text-white'}`}>{tier}</div>
                              </div>
                              <div>
                                  <div className="text-slate-500 text-xs mb-1">Faixa Salarial Estimada</div>
                                  <div className="text-2xl font-mono font-bold text-emerald-400">{salaryRange}</div>
                              </div>
                          </div>

                          {/* Col 2: Performance Stats */}
                          <div className="md:col-span-2 grid grid-cols-2 gap-4">
                              <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                  <div className="text-slate-500 text-xs font-bold uppercase mb-2">Poder de Fogo</div>
                                  <div className="flex items-baseline gap-2">
                                      <span className="text-3xl font-mono font-bold text-white">{form.officialKills.toLocaleString()}</span>
                                      <span className="text-xs text-slate-400">Kills Oficiais</span>
                                  </div>
                              </div>
                              <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                  <div className="text-slate-500 text-xs font-bold uppercase mb-2">Influência</div>
                                  <div className="flex items-baseline gap-2">
                                      <span className="text-3xl font-mono font-bold text-pink-400">{(form.followers / 1000).toFixed(1)}k</span>
                                      <span className="text-xs text-slate-400">Seguidores</span>
                                  </div>
                              </div>
                              {/* Titles */}
                              <div className="col-span-2 bg-white/5 p-5 rounded-2xl border border-white/5">
                                  <div className="text-slate-500 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                                      <Trophy className="w-3 h-3" /> Títulos & Conquistas
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                      {form.titles.length > 0 ? (
                                          form.titles.map((t, i) => (
                                              <span key={i} className="px-3 py-1 bg-amber-500/10 text-amber-300 rounded border border-amber-500/20 text-xs font-bold">
                                                  {t.count}x {t.name}
                                              </span>
                                          ))
                                      ) : <span className="text-xs text-slate-600 italic">Sem títulos registrados.</span>}
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Recent History */}
                      <div className="mb-8">
                           <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Histórico Recente</h3>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               {form.recentCompetitions.filter(c => c.name).map((c, i) => (
                                   <div key={i} className="bg-black/20 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                                       <div>
                                           <div className="font-bold text-white text-sm">{c.name}</div>
                                           <div className="text-[10px] text-slate-500">{c.type}</div>
                                       </div>
                                       <div className={`text-lg font-black font-mono ${c.position <= 3 ? 'text-amber-400' : 'text-slate-300'}`}>#{c.position}</div>
                                   </div>
                               ))}
                               {form.recentCompetitions.filter(c => c.name).length === 0 && <span className="text-xs text-slate-600">Sem dados recentes.</span>}
                           </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-12 pt-6 border-t border-white/5 flex justify-between items-end opacity-50">
                          <div>
                              <div className="text-2xl font-black text-white tracking-tighter mb-1">JhanStats</div>
                              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Valuation Algorithm v1.0</div>
                          </div>
                          <div className="text-right text-[10px] text-slate-600 font-mono">
                              Gerado em {new Date().toLocaleDateString()}
                          </div>
                      </div>
                  </div>
              </div>

              {/* Print CSS Injection */}
              <style>{`
                  @media print {
                      body * { visibility: hidden; }
                      #valuation-report-card, #valuation-report-card * { visibility: visible; }
                      #valuation-report-card {
                          position: absolute;
                          left: 0;
                          top: 0;
                          width: 100%;
                          height: auto;
                          margin: 0;
                          padding: 40px;
                          background-color: #0B0F19 !important;
                          -webkit-print-color-adjust: exact;
                          print-color-adjust: exact;
                          border: none;
                      }
                      /* Hide scrollbars, buttons, navs */
                      nav, footer, .sticky { display: none !important; }
                  }
              `}</style>
          </div>
      );
  }

  return null;
};