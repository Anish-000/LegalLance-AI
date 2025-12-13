import React, { useState } from 'react';
import { FileText, Link as LinkIcon, AlertCircle, Zap, BrainCircuit, Loader2 } from 'lucide-react';
import { AnalysisMode } from '../types';

interface InputPanelProps {
  onAnalyze: (text: string, mode: AnalysisMode) => void;
  isLoading: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({ onAnalyze, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'url'>('text');
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<AnalysisMode>('deep');
  const [urlError, setUrlError] = useState('');
  const [isScraping, setIsScraping] = useState(false);

  const handleAnalyze = () => {
    if (activeTab === 'text' && inputText.trim()) {
      onAnalyze(inputText, mode);
    } else if (activeTab === 'url' && url.trim()) {
      fetchUrlAndAnalyze();
    }
  };

  const fetchUrlAndAnalyze = async () => {
    setUrlError('');
    setIsScraping(true);
    try {
      // Use Jina Reader API to get clean text from URL
      // This handles CORS and basic scraping better than direct fetch
      const jinaUrl = `https://r.jina.ai/${url}`;
      
      const response = await fetch(jinaUrl);
      if (!response.ok) throw new Error("Failed to fetch content from the URL.");
      
      const text = await response.text();
      
      // Jina sometimes returns error text in the body if it fails
      if (!text || text.trim().length < 20) {
         throw new Error("Content retrieved was too empty.");
      }

      // Pass the scraped text to the main analysis function
      onAnalyze(text, mode);
    } catch (err) {
      console.error(err);
      setUrlError("Could not extract text from this URL using Jina Reader. The website might be blocking bots. Please copy and paste the text manually.");
    } finally {
      setIsScraping(false);
    }
  };

  const isBusy = isLoading || isScraping;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="glass-panel rounded-2xl p-1 overflow-hidden flex text-sm font-medium">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'text' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FileText className="w-4 h-4" />
          Paste Text
        </button>
        <button
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'url' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          Paste URL
        </button>
      </div>

      <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl shadow-black/40">
        <div className="space-y-4">
          {activeTab === 'text' ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300 ml-1">Document Text</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste Terms & Conditions, Privacy Policy, or Contract text here..."
                className="w-full h-64 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed"
              />
            </div>
          ) : (
            <div className="space-y-4">
               <label className="block text-sm font-medium text-slate-300 ml-1">Document URL</label>
               <div className="relative">
                 <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/terms"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 pl-12 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
               </div>
               {urlError && (
                 <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                   <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                   <p>{urlError}</p>
                 </div>
               )}
               <p className="text-xs text-slate-500 ml-1">
                 Powered by Jina Reader API for reliable web scraping.
               </p>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-700/50">
           <div className="flex bg-slate-800/80 p-1 rounded-lg">
             <button
               onClick={() => setMode('quick')}
               className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                 mode === 'quick' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
               }`}
               title="Uses gemini-2.5-flash for instant results"
             >
               <Zap className="w-3 h-3" />
               Quick Scan
             </button>
             <button
               onClick={() => setMode('deep')}
               className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                 mode === 'deep' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
               }`}
               title="Uses gemini-3-pro-preview with Thinking Mode"
             >
               <BrainCircuit className="w-3 h-3" />
               Deep Analysis
             </button>
           </div>

           <div className="flex gap-3 w-full md:w-auto">
             <button
               onClick={() => { setInputText(''); setUrl(''); setUrlError(''); }}
               className="px-6 py-3 rounded-xl border border-slate-600 text-slate-300 font-medium hover:bg-slate-800 transition-colors flex-1 md:flex-none"
               disabled={isBusy}
             >
               Clear
             </button>
             <button
               onClick={handleAnalyze}
               disabled={isBusy || (activeTab === 'text' ? !inputText.trim() : !url.trim())}
               className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-500/25 flex-1 md:flex-none transition-all ${
                 isBusy 
                  ? 'bg-blue-700 cursor-not-allowed opacity-80' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-[1.02] active:scale-[0.98]'
               }`}
             >
               {isBusy ? (
                 <span className="flex items-center justify-center gap-2">
                   <Loader2 className="animate-spin h-5 w-5 text-white" />
                   {isScraping ? "Scraping content..." : "Analyzing..."}
                 </span>
               ) : (
                 "Analyze Document"
               )}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};