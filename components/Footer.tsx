import React from 'react';
import { Scale } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-auto relative bg-slate-900/50 border-t border-slate-800 backdrop-blur-lg">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-2.5">
            <div className="bg-slate-800 p-1.5 rounded-lg border border-slate-700">
              <Scale className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-slate-300 font-semibold tracking-tight">LegalLens AI</span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
            <span className="hidden md:inline-block w-1 h-1 bg-slate-700 rounded-full"></span>
            <div className="flex items-center gap-1.5">
               <span>Made by</span>
               <span className="text-slate-200 font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">CrossGuild</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};