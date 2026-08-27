import React from 'react';
import { Scale } from 'lucide-react';
import { ViewMode } from '../types';

interface FooterBarProps {
  currentView?: ViewMode;
  onSelectView?: (view: ViewMode) => void;
}

export const FooterBar: React.FC<FooterBarProps> = () => {
  return (
    <footer id="footer-bar" className="w-full max-w-7xl mx-auto mt-auto pt-4 pb-4 px-4 border-t border-[#132238] text-slate-400 text-xs">
      <div className="text-center text-[11px] text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-2 py-1">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          © 2026 Bee Campaign AI Suite. Todos los derechos reservados.
        </span>
        <span className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors">
          <Scale className="w-3.5 h-3.5 text-amber-400" />
          Aviso de Privacidad y Hábeas Data según Ley 1581 de 2012
        </span>
      </div>
    </footer>
  );
};
