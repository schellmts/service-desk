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
  readonly results: { length: number; [i: number]: { isFinal: boolean; [j: number]: { transcript: string } } };
}

interface ISpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpeechRecognitionService {
  recognition: ISpeechRecognition | null = null;
  private isListeningSubject = new BehaviorSubject<boolean>(false);
  public isListening$ = this.isListeningSubject.asObservable();

  /** Observable que emite o texto reconhecido (resultado final de cada frase) */
  public textStream$ = new Subject<string>();

  constructor(private zone: NgZone) {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognitionAPI) {
        this.recognition = new SpeechRecognitionAPI() as ISpeechRecognition;
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'pt-BR';

        this.recognition.onresult = (event: ISpeechRecognitionEvent) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript.trim()) {
            this.zone.run(() => {
              this.textStream$.next(finalTranscript.trim());
            });
          }
        };

        this.recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
          this.zone.run(() => {
            this.stop();
            console.error('Erro no reconhecimento de voz:', event.error, event.message);
          });
        };

        this.recognition.onend = () => {
          this.zone.run(() => {
            this.isListeningSubject.next(false);
          });
        };
      } else {
        console.warn('Web Speech API não suportada neste navegador.');
      }
    }
  }

  get isListening(): boolean {
    return this.isListeningSubject.value;
  }

  /** Verifica se o reconhecimento de voz está disponível */
  get isSupported(): boolean {
    return this.recognition != null;
  }

  start(): void {
    if (this.recognition && !this.isListeningSubject.value) {
      this.recognition.start();
      this.isListeningSubject.next(true);
    }
  }

  stop(): void {
    if (this.recognition && this.isListeningSubject.value) {
      this.recognition.stop();
      this.isListeningSubject.next(false);
    }
  }
}
