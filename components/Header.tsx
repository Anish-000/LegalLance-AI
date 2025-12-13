import React from 'react';
import { Scale, ShieldCheck, Chrome } from 'lucide-react';

interface HeaderProps {
  onOpenExtension: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenExtension }) => {
  return (
    <header className="flex items-center justify-between py-6 px-4 md:px-8 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
          <Scale className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            LegalLens AI
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">Intelligent Document Analysis</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
         <button 
           onClick={onOpenExtension}
           className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-colors text-xs font-medium text-slate-200"
         >
           <Chrome className="w-3.5 h-3.5" />
           <span>Add to Chrome</span>
         </button>
         <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Secure & Private</span>
         </div>
      </div>
    </header>
  );
};