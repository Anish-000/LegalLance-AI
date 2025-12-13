import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { InputPanel } from './components/InputPanel';
import { AnalysisResults } from './components/AnalysisResults';
import { ExtensionPromo } from './components/ExtensionPromo';
import { ExtensionMock } from './components/ExtensionMock';
import { AnalysisResult, AnalysisMode } from './types';
import { analyzeDocument } from './services/geminiService';

const App: React.FC = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExtensionPromoOpen, setIsExtensionPromoOpen] = useState(false);
  const [isExtensionMockOpen, setIsExtensionMockOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async (text: string, mode: AnalysisMode) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeDocument(text, mode);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black text-slate-200">
      <Header onOpenExtension={() => setIsExtensionPromoOpen(true)} />

      <ExtensionPromo 
        isOpen={isExtensionPromoOpen} 
        onClose={() => setIsExtensionPromoOpen(false)}
        onOpenMock={() => setIsExtensionMockOpen(true)}
      />

      {isExtensionMockOpen && (
        <ExtensionMock onClose={() => setIsExtensionMockOpen(false)} />
      )}

      <main className="container mx-auto px-4 pt-8 md:pt-12 pb-12 flex-grow">
        
        {!result && (
           <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
               Simplify Legal Jargon.
               <br />
               <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                 Know What You Sign.
               </span>
             </h2>
             <p className="text-slate-400 text-lg max-w-2xl mx-auto">
               Instantly analyze Terms & Conditions, Privacy Policies, and Contracts.
             </p>
           </div>
        )}

        <div className="relative z-10 flex flex-col gap-12">
            <InputPanel onAnalyze={handleAnalyze} isLoading={isLoading} />
            
            {error && (
              <div className="max-w-md mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{error}</p>
              </div>
            )}

            {result && (
              <div ref={resultsRef} className="border-t border-slate-800 pt-12">
                  <AnalysisResults result={result} />
              </div>
            )}
        </div>
      </main>

      <Footer />
      
      {/* Background decorations - Hidden in Print */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none no-print">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>
    </div>
  );
};

export default App;