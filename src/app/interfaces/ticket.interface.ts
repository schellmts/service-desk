export interface Comentario {
  id: string;
  autor: string;
  texto: string;
  data: string;
}

export interface Anexo {
  id: string;
  nome: string;
  tamanho: string;
  data: string;
}

export interface HistoricoEvento {
  id: string;
  tipo: 'criacao' | 'atribuicao' | 'status' | 'prioridade' | 'comentario' | 'resolucao';
  autor: string;
  descricao: string;
  data: string;
}

export interface Ticket {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: 'Alta' | 'Média' | 'Baixa';
  status: 'Aberto' | 'Em Andamento' | 'Aguardando' | 'Resolvido';
  categoria: 'Hardware' | 'Software' | 'Acesso' | 'Rede' | 'Outros';
  criadoPor: string;
  dataCriacao: string;
  dataAtualizacao: string;
  dataResolucao?: string;
  comentarios?: Comentario[];
  atribuidoA?: string;
  localizacao?: string;
  equipamento?: string;
  sla?: string;
  emailSolicitante?: string;
  telefoneSolicitante?: string;
  emailTecnico?: string;
  anexos?: Anexo[];
  historico?: HistoricoEvento[];
}
