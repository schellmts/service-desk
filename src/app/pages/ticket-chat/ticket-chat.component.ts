import { Component, inject, signal, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Layout } from '../../components/layout/layout.component';
import { TicketAIService, AssistenteResponse } from '../../services/ticket-ai.service';
import { TicketService } from '../../services/ticket';
import { AuthService } from '../../services/auth.service';
import { SpeechRecognitionService } from '../../services/speech-recognition.service';
import { AiConfigService } from '../../services/ai-config.service';
import Swal from 'sweetalert2';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  loading?: boolean;
  data?: any; // Para armazenar dados extras (ex: ticketData)
  attachment?: {
    name: string;
    type: string;
    data: string; // base64
  };
}

@Component({
  selector: 'app-ticket-chat',
  imports: [CommonModule, FormsModule, Layout],
  templateUrl: './ticket-chat.component.html',
  styleUrl: './ticket-chat.component.css'
})
export class TicketChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  private ticketAIService = inject(TicketAIService);
  private ticketService = inject(TicketService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private speechService = inject(SpeechRecognitionService);
  private aiConfigService = inject(AiConfigService);
  private destroy$ = new Subject<void>();

  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  private readonly SILENCE_TIMEOUT_MS = 2500;
  private parouManualmente = false;
  private silenceTimerId: ReturnType<typeof setTimeout> | null = null;

  messages = signal<ChatMessage[]>([]);
  currentMessage = signal('');
  loading = signal(false);
  shouldScroll = signal(false);
  selectedFile = signal<File | null>(null);
  filePreview = signal<string | null>(null);

  gravandoAudio = signal(false);
  modoAutomatico = signal(false);
  speechSupported = signal(false);

  ngOnInit(): void {
    this.speechSupported.set(this.speechService.isSupported);

    if (this.speechService.isSupported) {
      this.speechService.textStream$.pipe(takeUntil(this.destroy$)).subscribe((texto: string) => {
        const espaco = this.currentMessage().trim() ? ' ' : '';
        this.currentMessage.update(msg => msg + espaco + texto);
        this.agendarEnvioAutomatico();
      });

      this.speechService.isListening$.pipe(takeUntil(this.destroy$)).subscribe((estaOuvindo: boolean) => {
        this.gravandoAudio.set(estaOuvindo);
        if (!estaOuvindo) {
          this.cancelarEnvioAutomatico();
          this.parouManualmente = false;
        }
      });
    }

    this.addSystemMessage('Olá! Sou o Axis AI, seu assistente virtual para abertura de chamados. Descreva seu problema e eu criarei um ticket automaticamente para você.');
  }

  private agendarEnvioAutomatico(): void {
    this.cancelarEnvioAutomatico();
    if (!this.modoAutomatico() || this.loading()) return;
    this.silenceTimerId = setTimeout(() => {
      this.silenceTimerId = null;
      if (!this.parouManualmente && this.modoAutomatico() && this.currentMessage().trim().length > 0 && !this.loading()) {
        Swal.fire({ icon: 'info', title: 'Enviando...', timer: 1200, timerProgressBar: true, showConfirmButton: false, toast: true, position: 'top-end' });
        this.sendMessage();
      }
    }, this.SILENCE_TIMEOUT_MS);
  }

  private cancelarEnvioAutomatico(): void {
    if (this.silenceTimerId) {
      clearTimeout(this.silenceTimerId);
      this.silenceTimerId = null;
    }
  }

  toggleGravacao(): void {
    if (!this.speechService.isSupported) return;
    if (this.gravandoAudio()) {
      this.parouManualmente = true;
      this.cancelarEnvioAutomatico();
      this.speechService.stop();
      Swal.fire({ icon: 'info', title: 'Microfone pausado', timer: 800, showConfirmButton: false, toast: true, position: 'top-end' });
    } else {
      this.parouManualmente = false;
      if (this.modoAutomatico()) this.currentMessage.set('');
      this.speechService.start();
      Swal.fire({ icon: 'info', title: 'Ouvindo...', timer: 800, showConfirmButton: false, toast: true, position: 'top-end' });
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll()) {
      this.scrollToBottom();
      this.shouldScroll.set(false);
    }
  }

  ngOnDestroy(): void {
    this.cancelarEnvioAutomatico();
    this.destroy$.next();
    this.destroy$.complete();
  }

  sendMessage(): void {
    const message = this.currentMessage().trim();
    const file = this.selectedFile();
    
    if ((!message && !file) || this.loading()) {
      return;
    }

    // Adiciona mensagem do usuário (com anexo se houver)
    const userMessage = message || (file ? `Anexo: ${file.name}` : '');
    this.addUserMessage(userMessage, file);
    this.currentMessage.set('');
    this.clearFile();
    
    // Foca no input novamente
    setTimeout(() => {
      this.messageInput.nativeElement.focus();
    }, 100);

    // Processa com IA
    this.processWithAI(message, file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validar tipo de arquivo (imagens e PDFs)
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Tipo de arquivo não suportado',
          text: 'Por favor, envie apenas imagens (JPG, PNG, GIF, WEBP) ou PDFs.',
          confirmButtonColor: '#06002E'
        });
        return;
      }

      // Validar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'Arquivo muito grande',
          text: 'O arquivo deve ter no máximo 10MB.',
          confirmButtonColor: '#06002E'
        });
        return;
      }

      this.selectedFile.set(file);
      
      // Criar preview se for imagem
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.filePreview.set(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        this.filePreview.set(null);
      }
    }
  }

  clearFile(): void {
    this.selectedFile.set(null);
    this.filePreview.set(null);
    // Limpar o input file
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getFileIcon(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return 'bi-image';
    } else if (ext === 'pdf') {
      return 'bi-file-pdf';
    }
    return 'bi-file';
  }

  private processWithAI(userMessage: string, file?: File | null): void {
    this.loading.set(true);
    const loadingMessage = this.addAssistantMessage('Analisando sua solicitação' + (file ? ' e anexo' : '') + '...', true);

    const currentUser = this.authService.getCurrentUser();
    const userName = currentUser?.nome || 'Usuário';
    const modelo = this.aiConfigService.getModeloSistema() || undefined;

    // Se houver arquivo, converter para base64 primeiro
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1]; // Remove o prefixo data:image/...
        const mimeType = file.type;
        
        this.ticketAIService.criarTicketComIA(userMessage || 'Analise o anexo fornecido', userName, modelo, {
          mimeType,
          data: base64Data,
          name: file.name
        }).pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.loading.set(false);
            this.messages.update(msgs => msgs.filter(m => m.id !== loadingMessage.id));
          })
        ).subscribe({
          next: (ticketData) => this.handleTicketResponse(ticketData),
          error: (err: Error) => this.handleError(err)
        });
      };
      reader.onerror = () => {
        this.loading.set(false);
        this.messages.update(msgs => msgs.filter(m => m.id !== loadingMessage.id));
        this.addAssistantMessage('Erro ao processar o arquivo. Tente novamente.');
      };
      reader.readAsDataURL(file);
    } else {
      this.ticketAIService.processarComandoAssistente(userMessage, modelo)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.loading.set(false);
            this.messages.update(msgs => msgs.filter(m => m.id !== loadingMessage.id));
          })
        )
        .subscribe({
          next: (res) => this.handleAssistenteResponse(res),
          error: (err: Error) => this.handleError(err)
        });
    }
  }

  private handleAssistenteResponse(res: AssistenteResponse): void {
    if (res.type === 'create_ticket') {
      this.handleTicketResponse(res.data);
    } else {
      this.addAssistantMessage(res.data);
    }
  }

  private handleTicketResponse(ticketData: any): void {
    // Mostra resumo do ticket criado pela IA
    this.addAssistantMessage(
      `Entendi! Vou criar um ticket com as seguintes informações:\n\n` +
      `📋 **Título:** ${ticketData.titulo}\n` +
      `📝 **Descrição:** ${ticketData.descricao}\n` +
      `⚡ **Prioridade:** ${ticketData.prioridade}\n` +
      `🏷️ **Categoria:** ${ticketData.categoria}\n\n` +
      `Deseja criar este ticket?`
    );

    // Adiciona botões de ação
    this.addSystemMessage('CONFIRM_TICKET', ticketData);
  }

  private handleError(err: Error): void {
    let errorMsg = 'Desculpe, ocorreu um erro ao processar sua solicitação.';
    
    if (err.message.includes('Chave da API')) {
      errorMsg = '⚠️ Chave da API Gemini não configurada. Configure em Config IA.';
    } else if (err.message.includes('Cota')) {
      errorMsg = '⚠️ Cota da API excedida. Tente novamente mais tarde.';
    } else {
      errorMsg = `Erro: ${err.message}`;
    }

    this.addAssistantMessage(errorMsg);
  }

  confirmTicketCreation(ticketData: any): void {
    const currentUser = this.authService.getCurrentUser();
    
    const novoTicket = this.ticketService.adicionarTicket({
      titulo: ticketData.titulo,
      descricao: ticketData.descricao,
      prioridade: ticketData.prioridade,
      status: 'Aberto',
      categoria: ticketData.categoria,
      criadoPor: currentUser?.nome || 'Usuário'
    });

    Swal.fire({
      icon: 'success',
      title: 'Ticket criado!',
      html: `
        <p><strong>ID:</strong> ${novoTicket.id}</p>
        <p><strong>Título:</strong> ${novoTicket.titulo}</p>
        <p><strong>Prioridade:</strong> ${novoTicket.prioridade}</p>
      `,
      confirmButtonText: 'Ver Ticket',
      cancelButtonText: 'Fechar',
      showCancelButton: true,
      confirmButtonColor: '#06002E'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/tickets', novoTicket.id]);
      } else {
        // Limpa o chat e reinicia
        this.messages.set([]);
        this.addSystemMessage('Ticket criado com sucesso! Deseja abrir outro chamado?');
      }
    });
  }

  cancelTicketCreation(): void {
    this.addSystemMessage('Operação cancelada. Descreva seu problema novamente para criar um novo ticket.');
  }

  private addUserMessage(content: string, file?: File | null): ChatMessage {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        message.attachment = {
          name: file.name,
          type: file.type,
          data: (reader.result as string).split(',')[1]
        };
      };
      reader.readAsDataURL(file);
    }
    
    this.messages.update(msgs => [...msgs, message]);
    this.shouldScroll.set(true);
    return message;
  }

  private addAssistantMessage(content: string, loading: boolean = false): ChatMessage {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      content,
      timestamp: new Date(),
      loading
    };
    this.messages.update(msgs => [...msgs, message]);
    this.shouldScroll.set(true);
    return message;
  }

  private addSystemMessage(content: string, data?: any): void {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type: 'system',
      content,
      timestamp: new Date()
    };
    // Adiciona dados extras se necessário
    if (data) {
      (message as any).data = data;
    }
    this.messages.update(msgs => [...msgs, message]);
    this.shouldScroll.set(true);
  }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Erro ao fazer scroll:', err);
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  formatMessage(content: string): string {
    // Converte markdown simples para HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }
}
