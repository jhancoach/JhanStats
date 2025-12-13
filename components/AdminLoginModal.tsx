import React, { useState } from 'react';
import { Lock, Unlock, X } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (success: boolean) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '2211') {
      onLogin(true);
      onClose();
      setPassword('');
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl transform transition-all animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col items-center mb-6">
          <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400 mb-3">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Acesso Administrativo</h2>
          <p className="text-slate-400 text-sm text-center">Digite a senha para habilitar a edição.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className={`w-full bg-black/50 border ${error ? 'border-red-500 text-red-200' : 'border-slate-700 text-white'} rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all`}
              placeholder="Senha..."
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mt-2 ml-1">Senha incorreta.</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" /> Entrar
          </button>
        </form>
      </div>
    </div>
  );
};