import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Layout } from '../../components/layout/layout.component';
import { WakeWordService } from '../../services/wake-word.service';
import { SpeechRecognitionService } from '../../services/speech-recognition.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-voice-config',
  imports: [CommonModule, FormsModule, RouterModule, Layout],
  templateUrl: './voice-config.component.html',
  styleUrl: './voice-config.component.css'
})
export class VoiceConfigComponent implements OnInit {
  private wakeWordService = inject(WakeWordService);
  private speechService = inject(SpeechRecognitionService);

  wakeWordEnabled = signal(false);
  speechSupported = signal(false);
  wakeWordSupported = signal(false);
  isListening = signal(false);

  ngOnInit(): void {
    this.speechSupported.set(this.speechService.isSupported);
    this.wakeWordSupported.set(this.wakeWordService.isSupported);
    this.wakeWordEnabled.set(this.wakeWordService.isEnabled);
    this.isListening.set(this.wakeWordService.isListening);

    // Observa mudanças no estado de escuta
    if (this.wakeWordService.isSupported) {
      this.wakeWordService.isListening$.subscribe(listening => {
        this.isListening.set(listening);
      });
    }
  }

  toggleWakeWord(): void {
    const newState = this.wakeWordService.toggle();
    this.wakeWordEnabled.set(newState);

    Swal.fire({
      icon: newState ? 'success' : 'info',
      title: newState ? 'Wake Word Ativado' : 'Wake Word Desativado',
      text: newState 
        ? 'Agora você pode dizer "ei axis" em qualquer página para abrir o chat.'
        : 'O reconhecimento de wake word foi desativado.',
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  }

  testWakeWord(): void {
    if (!this.wakeWordService.isSupported) {
      Swal.fire({
        icon: 'warning',
        title: 'Não suportado',
        text: 'Seu navegador não suporta reconhecimento de voz.',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      return;
    }

    if (!this.wakeWordEnabled()) {
      Swal.fire({
        icon: 'info',
        title: 'Wake Word Desativado',
        text: 'Por favor, ative o wake word primeiro.',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      return;
    }

    Swal.fire({
      icon: 'info',
      title: 'Testando Wake Word',
      html: `
        <p>O sistema está ouvindo...</p>
        <p class="small text-muted">Tente dizer: <strong>"ei axis"</strong></p>
        <p class="small text-muted mt-2">Status: <span id="test-status">Aguardando...</span></p>
      `,
      showConfirmButton: true,
      confirmButtonText: 'Fechar',
      allowOutsideClick: true,
      didOpen: () => {
        const subscription = this.wakeWordService.wakeWordDetected$.subscribe(() => {
          const statusEl = document.getElementById('test-status');
          if (statusEl) {
            statusEl.textContent = 'Wake word detectada! ✓';
            statusEl.className = 'small text-success';
          }
          Swal.update({
            icon: 'success',
            title: 'Wake Word Detectada!',
            html: '<p>O sistema detectou a wake word com sucesso!</p>'
          });
          subscription.unsubscribe();
        });
        
        // Remove a subscription quando o modal fechar
        Swal.getContainer()?.addEventListener('hidden.bs.modal', () => {
          subscription.unsubscribe();
        }, { once: true });
      }
    });
  }
}
