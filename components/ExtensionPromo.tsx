import React from 'react';
import { Chrome, X, Download, MousePointerClick, LayoutTemplate } from 'lucide-react';

interface ExtensionPromoProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMock: () => void;
}

export const ExtensionPromo: React.FC<ExtensionPromoProps> = ({ isOpen, onClose, onOpenMock }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden">
        
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -z-10" />

        <div className="p-6">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600/20 p-3 rounded-xl border border-blue-500/30">
              <Chrome className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Get LegalLens for Chrome</h3>
              <p className="text-slate-400 text-sm">Analyze legal documents directly in your browser.</p>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* Mock Install Button */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <h4 className="font-semibold text-slate-200">Install Extension</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Add the official extension to your browser for one-click analysis on any website.
                  </p>
                  <button className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors w-full flex items-center justify-center gap-2">
                    <Chrome className="w-4 h-4" />
                    Add to Chrome (Free)
                  </button>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-500">Or try these methods</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mock Preview Trigger */}
                <button 
                    onClick={() => { onClose(); onOpenMock(); }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-700 bg-slate-800/30 hover:bg-slate-800 hover:border-blue-500/50 transition-all group text-center"
                >
                    <LayoutTemplate className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                    <div>
                        <span className="block text-sm font-semibold text-slate-200">Preview Popup</span>
                        <span className="text-[10px] text-slate-400">Launch the mock extension interface</span>
                    </div>
                </button>

                {/* Bookmarklet Info */}
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-700 bg-slate-800/30 text-center">
                    <MousePointerClick className="w-6 h-6 text-yellow-400" />
                    <div>
                        <span className="block text-sm font-semibold text-slate-200">Bookmarklet</span>
                        <span className="text-[10px] text-slate-400">Drag this to your bookmarks bar:</span>
                        <a 
                            href="javascript:(function(){alert('LegalLens AI Analysis Started (Demo)');})();" 
                            className="mt-1 block px-2 py-1 bg-slate-700 rounded text-xs font-mono text-blue-300 cursor-grab active:cursor-grabbing hover:bg-slate-600 border border-slate-600"
                            onClick={(e) => e.preventDefault()}
                        >
                            🔍 LegalLens It!
                        </a>
                    </div>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};