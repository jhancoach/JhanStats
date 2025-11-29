import React, { useState } from 'react';
import { KillStat } from '../types';
import { X, Save, RotateCcw } from 'lucide-react';

interface EditPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: KillStat;
  onSave: (updatedPlayer: KillStat) => void;
}

export const EditPlayerModal: React.FC<EditPlayerModalProps> = ({ isOpen, onClose, player, onSave }) => {
  const [formData, setFormData] = useState<KillStat>({ ...player });

  if (!isOpen) return null;

  const handleChange = (key: keyof KillStat, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSeasonChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Recalculate KPG automatically when Matches changes
  const handleMatchesChange = (val: string) => {
      const matches = parseInt(val) || 0;
      const kpg = matches > 0 ? parseFloat((formData.totalKills / matches).toFixed(2)) : 0;
      setFormData(prev => ({ ...prev, matches, kpg }));
  };
  
  const handleKillsChange = (val: string) => {
      const kills = parseInt(val) || 0;
      const kpg = formData.matches > 0 ? parseFloat((kills / formData.matches).toFixed(2)) : 0;
      setFormData(prev => ({ ...prev, totalKills: kills, kpg }));
  };

  const seasonKeys = [
    'wb2025s2', 'wb2025s1', 'wb2024s2', 'wb2024s1',
    'lbff9', 'lbff8', 'lbff7', 'lbff6', 'lbff5', 'lbff4', 'lbff3', 'lbff1'
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Editar: <span className="text-amber-500">{player.player}</span>
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-wide mb-1">Nome do Jogador</label>
              <input 
                type="text" 
                value={formData.player} 
                onChange={(e) => handleChange('player', e.target.value)}
                className="w-full bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-wide mb-1">Time / Tag</label>
              <input 
                type="text" 
                value={formData.team} 
                onChange={(e) => handleChange('team', e.target.value)}
                className="w-full bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
            <div>
               <label className="block text-xs text-amber-500 font-bold uppercase tracking-wide mb-1">Total Abates</label>
               <input 
                 type="number" 
                 value={formData.totalKills} 
                 onChange={(e) => handleKillsChange(e.target.value)}
                 className="w-full bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
               />
            </div>
            <div>
               <label className="block text-xs text-blue-400 font-bold uppercase tracking-wide mb-1">Total Partidas</label>
               <input 
                 type="number" 
                 value={formData.matches} 
                 onChange={(e) => handleMatchesChange(e.target.value)}
                 className="w-full bg-black/40 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-blue-500 focus:outline-none"
               />
            </div>
            <div>
               <label className="block text-xs text-slate-400 font-bold uppercase tracking-wide mb-1">Média (KPG)</label>
               <input 
                 type="number" 
                 value={formData.kpg} 
                 disabled
                 className="w-full bg-black/20 border border-slate-800 rounded-lg px-3 py-2 text-slate-400 font-mono cursor-not-allowed"
               />
            </div>
          </div>

          {/* Seasons Stats */}
          <div>
            <h3 className="text-sm font-bold text-slate-300 mb-3 border-b border-white/5 pb-2">Estatísticas por Temporada <span className="text-[10px] font-normal text-slate-500 ml-2">(Formato: "Kills (Matches)" ou "- (-)")</span></h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {seasonKeys.map(key => (
                <div key={key}>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">{key.toUpperCase()}</label>
                  <input 
                    type="text"
                    value={(formData as any)[key] || ''}
                    onChange={(e) => handleSeasonChange(key, e.target.value)}
                    className="w-full bg-black/40 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 font-mono focus:border-amber-500 focus:outline-none"
                    placeholder="- (-)"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/5 bg-slate-900 flex justify-end gap-3">
          <button 
            onClick={() => setFormData({...player})} 
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Restaurar
          </button>
          <button 
            onClick={() => onSave(formData)} 
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-amber-600/20 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" /> Salvar Alterações
          </button>
        </div>

      </div>
    </div>
  );
};