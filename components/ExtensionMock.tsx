import React, { useState } from 'react';
import { Scale, X, Loader2, AlertTriangle, CheckCircle, FileText, Globe } from 'lucide-react';
import { analyzeDocument } from '../services/geminiService';
import { AnalysisResult } from '../types';

interface ExtensionMockProps {
  onClose: () => void;
}

export const ExtensionMock: React.FC<ExtensionMockProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'current' | 'input'>('current');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const mockCurrentPageText = `
    TERMS OF SERVICE (SAMPLE)
    1. We reserve the right to sell your personal data to third-party advertisers without explicit consent.
    2. You waive your right to a trial by jury and agree to binding arbitration.
    3. Subscription renews automatically at a 200% higher rate unless cancelled 30 days prior.
    4. We may terminate your account at any time for any reason.
    5. Users retain ownership of content created on the platform.
  `;

  const handleAnalyze = async () => {
    setIsLoading(true);
    setResult(null);
    
    const textToAnalyze = activeTab === 'current' ? mockCurrentPageText : inputText;

    try {
      // Use 'quick' mode for extension to be fast
      const data = await analyzeDocument(textToAnalyze, 'quick');
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400 border-green-500';
    if (score >= 5) return 'text-yellow-400 border-yellow-500';
    return 'text-red-400 border-red-500';
  };

  return (
    <div className="fixed top-20 right-4 w-[380px] h-[600px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden z-[90] animate-in slide-in-from-right duration-300">
      
      {/* Extension Header */}
      <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-md">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-100">LegalLens AI</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        
        {!result ? (
          <>
             <div className="bg-slate-800/50 p-1 rounded-lg flex text-xs font-medium mb-4">
                <button
                  onClick={() => setActiveTab('current')}
                  className={`flex-1 py-2 rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'current' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  This Page
                </button>
                <button
                  onClick={() => setActiveTab('input')}
                  className={`flex-1 py-2 rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'input' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Paste Text
                </button>
             </div>

             {activeTab === 'current' ? (
               <div className="text-center py-8 space-y-4">
                 <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-slate-700">
                    <Globe className="w-8 h-8 text-blue-400" />
                 </div>
                 <div>
                   <h3 className="text-slate-200 font-medium">Ready to Analyze</h3>
                   <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">
                     LegalLens will scan the visible text on this page for risky terms.
                   </p>
                 </div>
               </div>
             ) : (
               <textarea
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
                 placeholder="Paste text here..."
                 className="w-full h-40 bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500"
               />
             )}

             <button
               onClick={handleAnalyze}
               disabled={isLoading || (activeTab === 'input' && !inputText.trim())}
               className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
             >
               {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze Now"}
             </button>
             
             <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-[10px] text-blue-300 text-center">
                  <strong>Demo Mode:</strong> "This Page" analyzes a sample risky contract.
                </p>
             </div>
          </>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
             {/* Score Card */}
             <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center justify-between">
                <div>
                   <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Safety Score</p>
                   <div className={`text-2xl font-bold ${getScoreColor(result.safetyRating).split(' ')[0]}`}>
                     {result.safetyRating}/10
                   </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(result.safetyRating)} bg-opacity-10`}>
                   {result.riskLevel} Risk
                </div>
             </div>

             {/* Risky Clauses Compact */}
             <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Risky Clauses ({result.riskyClauses.length})
                </h4>
                {result.riskyClauses.slice(0, 3).map((rc, i) => (
                  <div key={i} className="bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
                     <p className="text-[10px] text-red-300 font-bold mb-0.5">{rc.section}</p>
                     <p className="text-[11px] text-slate-300 leading-snug">"{rc.snippet}"</p>
                  </div>
                ))}
                {result.riskyClauses.length > 3 && (
                  <p className="text-[10px] text-center text-slate-500">+{result.riskyClauses.length - 3} more...</p>
                )}
             </div>

             {/* Summary Compact */}
             <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Summary</h4>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
                  {result.summary}
                </p>
             </div>

             <button 
               onClick={() => setResult(null)} 
               className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-medium text-slate-300 transition-colors"
             >
               Start New Scan
             </button>
          </div>
        )}

      </div>
      
      <div className="p-3 bg-slate-800 border-t border-slate-700 text-center">
         <p className="text-[10px] text-slate-500">LegalLens AI Extension (Preview)</p>
      </div>
    </div>
  );
};