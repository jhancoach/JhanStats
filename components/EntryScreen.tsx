import React, { useEffect, useState } from 'react';
import { ChevronRight, Database, ShieldCheck, Instagram } from 'lucide-react';

interface EntryScreenProps {
  onEnter: () => void;
}

export const EntryScreen: React.FC<EntryScreenProps> = ({ onEnter }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(onEnter, 800); // Wait for exit animation
  };

  return (
    <div className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-900/10 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Logo Icon */}
        <div className="mb-6 relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="w-20 h-20 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center rotate-45 transform transition-transform duration-700 hover:rotate-90">
             <div className="-rotate-45">
                <Database className="w-8 h-8 text-white" />
             </div>
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-2 animate-title">
          Jhan<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 animate-shine">Stats</span>
        </h1>
        
        {/* Instagram / Analyst Link */}
        <a 
          href="https://www.instagram.com/jhanmedeiros/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 mt-2 mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/50 transition-all duration-300 group opacity-0 animate-fade-in"
          style={{animationDelay: '0.6s', animationFillMode: 'forwards'}}
        >
           <Instagram className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
           <span className="text-slate-200 text-sm md:text-base font-semibold">
             Analista de Dados do Free Fire
           </span>
        </a>
        
        {/* Enter Button */}
        <div className={`mt-10 transition-all duration-700 transform ${showButton ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <button 
            onClick={handleEnter}
            className="group relative px-8 py-4 bg-white text-black font-bold text-sm tracking-widest uppercase rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Acessar Dashboard <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-xs text-slate-600 font-mono tracking-widest opacity-60">
        PREMIUM ANALYTICS • FREE FIRE SERIES A
      </div>
    </div>
  );
};