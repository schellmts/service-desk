import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Ticket } from '../interfaces/ticket.interface';
import { environment } from '../environment/environment';
import { GeminiApiKeyService } from './gemini-api-key.service';
import { ModelOption } from '../interfaces/text-reviewer.interface';

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    code?: number;
    message?: string;
  };
}

interface GeminiModelsResponse {
  models: Array<{
    name: string;
    displayName?: string;
    supportedGenerationMethods?: string[];
  }>;
}

interface TicketAICreation {
  titulo: string;
  descricao: string;
  prioridade: 'Alta' | 'Média' | 'Baixa';
  categoria: 'Hardware' | 'Software' | 'Acesso' | 'Rede' | 'Outros';
}

/** Resposta do assistente genérico - cria ticket ou retorna texto */
export type AssistenteResponse =
  | { type: 'create_ticket'; data: TicketAICreation }
  | { type: 'text'; data: string };

@Injectable({
  providedIn: 'root'
})
export class TicketAIService {
  private readonly http = inject(HttpClient);
  private readonly API_BASE_URL = environment.APP_GEMINI_URL;
  private readonly geminiApiKeyService = inject(GeminiApiKeyService);

  /**
   * Busca os modelos disponíveis da API Gemini (método público)
   */
  buscarModelosDisponiveis(): Observable<ModelOption[]> {
    return this.http.get<GeminiModelsResponse>(`${this.API_BASE_URL}/models`).pipe(
      map((data) => {
        const supportedModels = data.models
          .filter((m) =>
            m.supportedGenerationMethods &&
            m.supportedGenerationMethods.includes('generateContent')
          )
          .map((m) => {
            let displayName = m.displayName || m.name.replace('models/', '');
            let isSafe = false;

            if (m.name.includes('flash')) {
              displayName = `(Free) ${displayName} (Ideal para Plano Grátis)`;
              isSafe = true;
            } else if (m.name.includes('pro') || m.name.includes('ultra')) {
              displayName = `(Pro) ${displayName} (Limite de Cota Rígido)`;
            } else {
              displayName = `(Unknown) ${displayName}`;
            }

            return {
              name: m.name,
              displayName,
              isSafe
            };
          });

        // Ordenar: preferir flash (especialmente 1.5-flash), depois safe models
        supportedModels.sort((a: ModelOption, b: ModelOption) => {
          if (a.name.includes('1.5-flash') && !a.name.includes('8b')) return -1;
          if (b.name.includes('1.5-flash') && !b.name.includes('8b')) return 1;
          if (a.name.includes('2.0-flash')) return -1;
          if (b.name.includes('2.0-flash')) return 1;
          if (a.isSafe && !b.isSafe) return -1;
          if (!a.isSafe && b.isSafe) return 1;
          return 0;
        });

        return supportedModels;
      }),
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error.error?.error?.message || 'Falha ao buscar modelos disponíveis.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Seleciona o melhor modelo disponível (preferencialmente flash)
   */
  private selecionarMelhorModelo(modelos: ModelOption[]): string {
    if (modelos.length === 0) {
      throw new Error('Nenhum modelo compatível encontrado.');
    }

    // Preferir modelos flash (gratuitos e rápidos)
    const flashModel = modelos.find(m => m.name.includes('flash') && !m.name.includes('8b'));
    if (flashModel) {
      return flashModel.name;
    }

    // Se não houver flash, usar o primeiro disponível
    return modelos[0].name;
  }

  /**
   * Analisa a mensagem do usuário e cria um ticket automaticamente usando IA
   * @param mensagem Mensagem do usuário
   * @param usuarioNome Nome do usuário
   * @param modeloSelecionado Modelo de IA a ser usado (opcional, se não informado busca automaticamente)
   * @param anexo Anexo (imagem ou documento) para análise
   */
  criarTicketComIA(mensagem: string, usuarioNome: string, modeloSelecionado?: string, anexo?: { mimeType: string; data: string; name: string }): Observable<TicketAICreation> {
    if (!mensagem.trim() && !anexo) {
      return throwError(() => new Error('Por favor, descreva seu problema ou anexe um arquivo.'));
    }

    // A chave será adicionada automaticamente pelo interceptor
    // Mas verificamos se existe para dar feedback melhor ao usuário
    const apiKey = this.geminiApiKeyService.getApiKey();
    if (!apiKey) {
      return throwError(() => new Error('Chave da API Gemini não configurada. Configure em Config IA.'));
    }

    const promptTexto = mensagem.trim() || 'Analise o anexo fornecido e crie um ticket baseado no conteúdo.';
    
    const prompt = `
Você é um assistente de Service Desk especializado em criar tickets de suporte técnico.

${anexo ? `O usuário anexou um arquivo (${anexo.name}). Analise o conteúdo do anexo cuidadosamente e:` : ''}

Analise a seguinte solicitação do usuário e extraia as informações necessárias para criar um ticket:

${mensagem.trim() ? `Solicitação do usuário: "${mensagem}"` : 'O usuário não forneceu uma descrição textual, então analise apenas o anexo fornecido.'}

${anexo ? `\nIMPORTANTE: Analise detalhadamente o anexo fornecido. Se for uma imagem, descreva o que você vê. Se for um documento PDF, extraia as informações relevantes.` : ''}

Retorne APENAS um JSON válido no seguinte formato (sem markdown, sem código, apenas o JSON puro):
{
  "titulo": "Título resumido do problema (máximo 60 caracteres)",
  "descricao": "Descrição detalhada do problema com contexto completo${anexo ? '. Inclua informações relevantes extraídas do anexo.' : ''}",
  "prioridade": "Alta" ou "Média" ou "Baixa",
  "categoria": "Hardware" ou "Software" ou "Acesso" ou "Rede" ou "Outros"
}

Regras para prioridade:
- Alta: Problemas críticos que impedem trabalho, sistemas offline, segurança comprometida
- Média: Problemas que afetam produtividade mas não impedem completamente o trabalho
- Baixa: Solicitações de melhoria, dúvidas, configurações não urgentes

Regras para categoria:
- Hardware: Problemas físicos com equipamentos (computador, impressora, monitor, etc)
- Software: Problemas com programas, aplicativos, sistemas
- Acesso: Solicitações de acesso, permissões, senhas, contas
- Rede: Problemas de conexão, internet, VPN, servidores
- Outros: Qualquer coisa que não se encaixe nas categorias acima

IMPORTANTE: Retorne APENAS o JSON, sem explicações adicionais, sem markdown, sem código.
`;

    // Se um modelo foi especificado, usar ele; senão buscar automaticamente
    const modeloObservable = modeloSelecionado 
      ? of([{ name: modeloSelecionado, displayName: modeloSelecionado }] as ModelOption[])
      : this.buscarModelosDisponiveis();

    return modeloObservable.pipe(
      switchMap((modelos) => {
        const modelo = modeloSelecionado || this.selecionarMelhorModelo(modelos);
        const modelId = modelo.startsWith('models/') 
          ? modelo.replace('models/', '') 
          : modelo;
        
        console.log(`Usando modelo: ${modelo}`);
        return this.tentarGerarComModelo(modelId, prompt, anexo);
      }),
      map((data) => {
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
          throw new Error('Sem resposta da IA. Tente novamente.');
        }

        // Limpar a resposta removendo markdown e espaços
        let cleanJson = textResponse
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();

        // Tentar extrair JSON se estiver dentro de um texto maior
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanJson = jsonMatch[0];
        }

        try {
          const parsed = JSON.parse(cleanJson) as TicketAICreation;
          
          // Validação dos campos
          if (!parsed.titulo || !parsed.descricao) {
            throw new Error('Resposta da IA incompleta');
          }

          // Garantir que prioridade e categoria são válidos
          if (!['Alta', 'Média', 'Baixa'].includes(parsed.prioridade)) {
            parsed.prioridade = 'Média';
          }

          if (!['Hardware', 'Software', 'Acesso', 'Rede', 'Outros'].includes(parsed.categoria)) {
            parsed.categoria = 'Outros';
          }

          return parsed;
        } catch (e) {
          console.error('Erro ao parsear JSON da IA:', e);
          console.error('Resposta recebida:', textResponse);
          
          // Fallback: criar ticket básico com a mensagem original
          return {
            titulo: this.extrairTitulo(mensagem),
            descricao: mensagem,
            prioridade: 'Média' as const,
            categoria: 'Outros' as const
          };
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.error?.error?.code === 429 ||
            error.error?.error?.message?.toLowerCase().includes('quota')) {
          return throwError(() => new Error('Cota da API excedida. Tente novamente mais tarde.'));
        }
        const errorMessage = error.error?.error?.message || 'Erro ao processar com IA';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Método auxiliar para tentar gerar conteúdo com um modelo específico
   */
  private tentarGerarComModelo(modelId: string, prompt: string, anexo?: { mimeType: string; data: string; name: string }): Observable<GeminiGenerateResponse> {
    const parts: any[] = [{ text: prompt }];
    
    // Se houver anexo, adicionar como parte da requisição
    if (anexo) {
      // A API Gemini aceita imagens em base64
      if (anexo.mimeType.startsWith('image/')) {
        parts.push({
          inline_data: {
            mime_type: anexo.mimeType,
            data: anexo.data
          }
        });
      } else if (anexo.mimeType === 'application/pdf') {
        // PDFs também podem ser enviados como base64
        parts.push({
          inline_data: {
            mime_type: anexo.mimeType,
            data: anexo.data
          }
        });
      }
    }
    
    return this.http.post<GeminiGenerateResponse>(
      `${this.API_BASE_URL}/models/${modelId}:generateContent`,
      {
        contents: [{
          parts: parts
        }]
      }
    );
  }

  /**
   * Processa comando do assistente (voz ou texto) - pode criar ticket, criar sala ou responder texto.
   * Usado no chat com reconhecimento de voz.
   */
  processarComandoAssistente(mensagem: string, modeloSelecionado?: string): Observable<AssistenteResponse> {
    if (!mensagem.trim()) {
      return throwError(() => new Error('Mensagem vazia.'));
    }

    const apiKey = this.geminiApiKeyService.getApiKey();
    if (!apiKey) {
      return throwError(() => new Error('Chave da API Gemini não configurada. Configure em Config IA.'));
    }

    const systemInstruction = `Você é um assistente de Service Desk do sistema Taskye.
- Se o usuário descrever um problema ou pedir criar um CHAMADO/TICKET, responda com JSON: {"action":"create_ticket","parameters":{"titulo":"...","descricao":"...","prioridade":"Alta|Média|Baixa","categoria":"Hardware|Software|Acesso|Rede|Outros"}}
- Para qualquer outra conversa, responda em texto simples e direto (não use JSON).
IMPORTANTE: Nunca use crases ou markdown. Retorne JSON puro ou texto puro.`;

    const modeloObservable = modeloSelecionado
      ? of([{ name: modeloSelecionado }] as ModelOption[])
      : this.buscarModelosDisponiveis();

    return modeloObservable.pipe(
      switchMap((modelos) => {
        const modelo = modeloSelecionado || this.selecionarMelhorModelo(modelos);
        const modelId = modelo.startsWith('models/') ? modelo.replace('models/', '') : modelo;
        return this.http.post<GeminiGenerateResponse>(
          `${this.API_BASE_URL}/models/${modelId}:generateContent`,
          {
            contents: [{ parts: [{ text: mensagem }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] }
          }
        );
      }),
      map((data) => {
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textResponse) throw new Error('Sem resposta da IA.');

        const trimmed = textResponse.trim();
        const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]) as { action?: string; parameters?: any };
            if (parsed.action === 'create_ticket' && parsed.parameters) {
              const p = parsed.parameters;
              const ticket: TicketAICreation = {
                titulo: String(p.titulo || this.extrairTitulo(mensagem)),
                descricao: String(p.descricao || mensagem),
                prioridade: ['Alta', 'Média', 'Baixa'].includes(p.prioridade) ? p.prioridade : 'Média',
                categoria: ['Hardware', 'Software', 'Acesso', 'Rede', 'Outros'].includes(p.categoria) ? p.categoria : 'Outros'
              };
              return { type: 'create_ticket' as const, data: ticket };
            }
          } catch {
            /* fallback para texto */
          }
        }
        return { type: 'text' as const, data: trimmed };
      }),
      catchError((error: HttpErrorResponse) => {
        const msg = error.error?.error?.message || 'Erro ao processar com IA';
        return throwError(() => new Error(msg));
      })
    );
  }

  private extrairTitulo(mensagem: string): string {
    const palavras = mensagem.split(' ');
    if (palavras.length <= 8) {
      return mensagem.substring(0, 60);
    }
    return palavras.slice(0, 8).join(' ') + '...';
  }
}
