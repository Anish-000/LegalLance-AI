export interface RiskyClause {
  section: string;
  snippet: string;
  explanation: string;
}

export interface AnalysisResult {
  summary: string;
  riskyClauses: RiskyClause[];
  goodPoints: string[];
  concerns: string[];
  safetyRating: number; // 1-10
  riskLevel: 'High' | 'Medium' | 'Low';
}

export type AnalysisMode = 'quick' | 'deep';

export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  result: AnalysisResult | null;
  mode: AnalysisMode;
  audioUrl: string | null;
  isGeneratingAudio: boolean;
}