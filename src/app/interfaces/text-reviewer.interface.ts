// Interface para estruturar os dados do modelo
export interface ModelOption {
  name: string;
  displayName: string;
  isSafe?: boolean;
}

// Interface para o resultado da API
export interface AnalysisResult {
  correctedText: string;
  improvements: string[];
  toneAnalysis: string;
}
