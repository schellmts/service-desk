import { Injectable, NgZone } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface ISpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: { length: number; [i:number]: { isFinal: boolean; [j:number]: { transcript: string } } };
}

interface ISpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message?: string;
}

const STORAGE_KEY_WAKE_WORD_ENABLED = 'wake_word_enabled';

@Injectable({
  providedIn: 'root'
})
export class WakeWordService {
  private recognition: ISpeechRecognition | null = null;
  private isListeningSubject = new BehaviorSubject<boolean>(false);
  public isListening$ = this.isListeningSubject.asObservable();
  
  /** Observable que emite quando a wake word é detectada */
  public wakeWordDetected$ = new Subject<void>();
  
  /** Wake word única: apenas "ei axis" */
  private wakeWord = 'ei axis';
  
  /**
   * Verifica se a wake word "ei axis" foi detectada de forma precisa
   * Apenas detecta quando a frase começa com "ei axis"
   */
  private isWakeWordDetected(transcript: string): boolean {
    const normalizedTranscript = transcript.toLowerCase().trim();
    
    // Remove pontuação no final para análise
    const cleanTranscript = normalizedTranscript.replace(/[.,!?;:]+$/, '').trim();
    
    // Deve começar exatamente com "ei axis"
    if (cleanTranscript.startsWith(this.wakeWord.toLowerCase())) {
      return true;
    }
    
    return false;
  }
  
  /** Se o serviço está ativo */
  private enabled = false;
  
  /** Carrega a configuração do localStorage */
  private loadEnabledState(): boolean {
    if (typeof localStorage === 'undefined') return false;
    const stored = localStorage.getItem(STORAGE_KEY_WAKE_WORD_ENABLED);
    return stored === 'true';
  }
  
  /** Salva a configuração no localStorage */
  private saveEnabledState(enabled: boolean): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_WAKE_WORD_ENABLED, enabled.toString());
    }
  }
  
  /** Obtém o estado atual da configuração */
  get isEnabled(): boolean {
    return this.enabled;
  }

  constructor(private zone: NgZone) {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognitionAPI) {
        this.recognition = new SpeechRecognitionAPI() as ISpeechRecognition;
        this.recognition.continuous = true;
        this.recognition.interimResults = true; // Precisamos de resultados intermediários para detectar a wake word rapidamente
        this.recognition.lang = 'pt-BR';
        
        // Não inicializa automaticamente aqui - será inicializado pelo Layout quando necessário

        this.recognition.onresult = (event: ISpeechRecognitionEvent) => {
          // Verifica tanto resultados intermediários quanto finais
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript.toLowerCase().trim();
            
            // Verifica se alguma wake word foi detectada de forma precisa
            const detected = this.isWakeWordDetected(transcript);
            
            if (detected) {
              this.zone.run(() => {
                this.wakeWordDetected$.next();
                // Para temporariamente para evitar múltiplas detecções
                this.pause();
                // Reinicia após um pequeno delay
                setTimeout(() => {
                  if (this.enabled) {
                    this.start();
                  }
                }, 2000);
              });
              break;
            }
          }
        };

        this.recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
          // Ignora erros comuns que não são críticos
          if (event.error === 'no-speech' || event.error === 'audio-capture') {
            // Tenta reiniciar automaticamente
            if (this.enabled && !this.isListeningSubject.value) {
              setTimeout(() => {
                if (this.enabled) {
                  this.start();
                }
              }, 1000);
            }
          } else {
            console.warn('Erro no wake word detection:', event.error, event.message);
          }
        };

        this.recognition.onend = () => {
          this.zone.run(() => {
            this.isListeningSubject.next(false);
            // Reinicia automaticamente se ainda estiver habilitado
            if (this.enabled) {
              setTimeout(() => {
                if (this.enabled && !this.isListeningSubject.value) {
                  this.start();
                }
              }, 500);
            }
          });
        };
      }
    }
  }

  /** Verifica se o reconhecimento de voz está disponível */
  get isSupported(): boolean {
    return this.recognition != null;
  }

  /** Verifica se está ouvindo */
  get isListening(): boolean {
    return this.isListeningSubject.value;
  }

  /** Habilita o wake word detection */
  enable(): void {
    if (this.isSupported) {
      this.enabled = true;
      this.saveEnabledState(true);
      if (!this.isListeningSubject.value) {
        this.start();
      }
    }
  }

  /** Desabilita o wake word detection */
  disable(): void {
    this.enabled = false;
    this.saveEnabledState(false);
    this.stop();
  }
  
  /** Alterna o estado do wake word detection */
  toggle(): boolean {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this.enabled;
  }
  
  /** Inicializa o serviço baseado na configuração salva (chamado pelo app ou layout) */
  initialize(): void {
    const savedEnabled = this.loadEnabledState();
    if (savedEnabled && this.isSupported && !this.enabled) {
      this.enabled = true;
      // Aguarda um pouco antes de iniciar para garantir que tudo está pronto
      setTimeout(() => {
        if (this.enabled && !this.isListeningSubject.value) {
          this.start();
        }
      }, 1000);
    }
  }

  private start(): void {
    if (this.recognition && !this.isListeningSubject.value && this.enabled) {
      try {
        this.recognition.start();
        this.isListeningSubject.next(true);
      } catch (error) {
        // Ignora erros de já estar iniciado
        if (error instanceof Error && !error.message.includes('already started')) {
          console.warn('Erro ao iniciar wake word detection:', error);
        }
      }
    }
  }

  private stop(): void {
    if (this.recognition && this.isListeningSubject.value) {
      try {
        this.recognition.stop();
        this.isListeningSubject.next(false);
      } catch (error) {
        console.warn('Erro ao parar wake word detection:', error);
      }
    }
  }

  private pause(): void {
    this.stop();
  }
}
