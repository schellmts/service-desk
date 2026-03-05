export type MetodoIntegracao = 'backend-proprio' | 'fluig';

export interface ConfiguracaoBackendProprio {
  url: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ConfiguracaoFluig {
  url: string;
  apiKey: string;
  apiSecret: string;
  processoId?: string;
  datasetId?: string;
  formId?: string;
  token?: string;
  tokenSecret?: string;
}

export interface ConectorConfig {
  metodoIntegracao: MetodoIntegracao;
  backendProprio?: ConfiguracaoBackendProprio;
  fluig?: ConfiguracaoFluig;
  ativo: boolean;
}
