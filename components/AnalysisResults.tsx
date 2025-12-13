import React, { useRef, useState } from 'react';
import { AlertTriangle, CheckCircle, AlertOctagon, Info, Play, Loader2, StopCircle, FileWarning } from 'lucide-react';
import { AnalysisResult } from '../types';
import { generateSpeech } from '../services/geminiService';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400 border-green-500';
    if (score >= 5) return 'text-yellow-400 border-yellow-500';
    return 'text-red-400 border-red-500';
  };

  const handlePlaySummary = async () => {
    if (isPlaying) {
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
        }
        setIsPlaying(false);
        return;
    }

    setIsGeneratingAudio(true);
    try {
        // Initialize context first
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        // Resume context if suspended (browser policy requires interaction)
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        const audioBuffer = await generateSpeech(result.summary, audioContextRef.current);
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => setIsPlaying(false);
        
        audioSourceRef.current = source;
        source.start();
        setIsPlaying(true);
    } catch (err) {
        console.error("Failed to play audio", err);
        // Fallback for user awareness
        alert("Audio playback failed. Please check your browser audio settings.");
    } finally {
        setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-8">
      
      {/* Top Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`glass-panel p-6 rounded-2xl border flex items-center justify-between ${getRiskColor(result.riskLevel)}`}>
           <div>
             <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Overall Risk Level</p>
             <h2 className="text-3xl font-bold mt-1">{result.riskLevel}</h2>
           </div>
           <AlertOctagon className="w-12 h-12 opacity-80" />
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border border-slate-700/50">
           <div>
             <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Safety Score</p>
             <div className="flex items-baseline gap-1 mt-1">
               <h2 className={`text-4xl font-bold ${getScoreColor(result.safetyRating).split(' ')[0]}`}>{result.safetyRating}</h2>
               <span className="text-slate-500 font-medium">/ 10</span>
             </div>
           </div>
           <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${getScoreColor(result.safetyRating)}`}>
             <span className="text-lg font-bold">{result.safetyRating}</span>
           </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            Quick Summary
            </h3>
            <button 
                onClick={handlePlaySummary}
                disabled={isGeneratingAudio}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-medium text-blue-300 transition-colors disabled:opacity-50"
            >
                {isGeneratingAudio ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPlaying ? (
                    <StopCircle className="w-4 h-4" />
                ) : (
                    <Play className="w-4 h-4" />
                )}
                {isGeneratingAudio ? 'Generating...' : isPlaying ? 'Stop Audio' : 'Listen to Summary'}
            </button>
        </div>
        <p className="text-slate-300 leading-relaxed text-lg">
          {result.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risky Clauses */}
        <div className="glass-panel rounded-2xl p-6 border border-red-500/20 bg-red-500/5">
          <h3 className="text-lg font-bold text-red-300 flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5" />
            Risky Clauses
          </h3>
          <div className="space-y-6">
            {result.riskyClauses.map((item, idx) => (
              <div key={idx} className="bg-slate-900/50 rounded-xl overflow-hidden border border-red-500/10">
                <div className="bg-red-500/10 px-4 py-2 border-b border-red-500/10 flex items-center gap-2">
                  <FileWarning className="w-4 h-4 text-red-400" />
                  <span className="text-red-200 font-semibold text-sm truncate">{item.section}</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="relative pl-3 border-l-2 border-red-500/30">
                     <p className="text-slate-300 text-sm italic opacity-90">"{item.snippet}"</p>
                  </div>
                  <p className="text-red-200 text-sm font-medium pt-1 border-t border-red-500/5 mt-2">
                    <span className="opacity-70 text-xs uppercase tracking-wider block mb-1">Risk Explanation:</span>
                    {item.explanation}
                  </p>
                </div>
              </div>
            ))}
            {result.riskyClauses.length === 0 && (
              <p className="text-slate-400 italic text-center py-4">No significant risky clauses detected.</p>
            )}
          </div>
        </div>

        {/* Good Points */}
        <div className="glass-panel rounded-2xl p-6 border border-green-500/20 bg-green-500/5">
          <h3 className="text-lg font-bold text-green-300 flex items-center gap-2 mb-6">
            <CheckCircle className="w-5 h-5" />
            Good Points
          </h3>
          <ul className="space-y-4">
            {result.goodPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
            {result.goodPoints.length === 0 && (
               <p className="text-slate-400 italic">No specific highlights found.</p>
            )}
          </ul>

          <h3 className="text-lg font-bold text-yellow-300 flex items-center gap-2 mb-4 mt-10 pt-6 border-t border-slate-700/30">
            <Info className="w-5 h-5" />
            General Concerns
          </h3>
          <ul className="space-y-4">
            {result.concerns.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0 shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
             {result.concerns.length === 0 && (
               <p className="text-slate-400 italic">No general concerns noted.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};