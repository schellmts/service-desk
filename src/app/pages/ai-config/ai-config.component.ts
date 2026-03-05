import { Component, inject, signal, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Layout } from '../../components/layout/layout.component';
import Swal from 'sweetalert2';
import { TicketAIService } from '../../services/ticket-ai.service';
import { GeminiApiKeyService } from '../../services/gemini-api-key.service';
import { AiConfigService } from '../../services/ai-config.service';
import { ModelOption } from '../../interfaces/text-reviewer.interface';

@Component({
  selector: 'app-ai-config',
  imports: [CommonModule, FormsModule, Layout],
  templateUrl: './ai-config.component.html',
  styleUrl: './ai-config.component.css'
})
export class AiConfigComponent implements OnInit, OnDestroy {
  private ticketAIService = inject(TicketAIService);
  private apiKeyService = inject(GeminiApiKeyService);
  private aiConfigService = inject(AiConfigService);
  private destroy$ = new Subject<void>();

  apiKeyInput = signal('');
  showApiKeyInput = signal(false);
  keyValidated = signal(false);
  isValidatingKey = signal(false);
  error = signal('');

  availableModels = signal<ModelOption[]>([]);
  modeloSistema = signal('');
  modeloChatFlutuante = signal('');
  isLoadingModels = signal(false);

  ngOnInit(): void {
    const savedKey = this.apiKeyService.getApiKey();
    if (savedKey) {
      this.apiKeyInput.set(savedKey);
      this.validateKeyAndFetchModels();
    } else {
      this.showApiKeyInput.set(true);
    }
    this.carregarModelosSalvos();
  }

  private carregarModelosSalvos(): void {
    this.modeloSistema.set(this.aiConfigService.getModeloSistema());
    this.modeloChatFlutuante.set(this.aiConfigService.getModeloChatFlutuante());
  }

  saveApiKey(): void {
    const key = this.apiKeyInput().trim();
    if (!key) {
      this.error.set('Por favor, insira uma chave da API válida.');
      return;
    }
    this.apiKeyService.setApiKey(key);
    this.showApiKeyInput.set(false);
    this.validateKeyAndFetchModels();
  }

  changeApiKey(): void {
    this.showApiKeyInput.set(true);
    this.keyValidated.set(false);
  }

  clearApiKey(): void {
    this.apiKeyService.clearApiKey();
    this.apiKeyInput.set('');
    this.showApiKeyInput.set(true);
    this.keyValidated.set(false);
    this.availableModels.set([]);
  }

  validateKeyAndFetchModels(): void {
    this.isValidatingKey.set(true);
    this.error.set('');
    this.ticketAIService.buscarModelosDisponiveis()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isValidatingKey.set(false))
      )
      .subscribe({
        next: (models) => {
          this.availableModels.set(models);
          this.keyValidated.set(true);
          this.aplicarModelosSeNaoDefinidos(models);
        },
        error: (err: Error) => {
          this.keyValidated.set(false);
          this.error.set(`Erro ao validar: ${err.message}`);
        }
      });
  }

  private aplicarModelosSeNaoDefinidos(models: ModelOption[]): void {
    if (!this.modeloSistema() && models.length > 0) {
      this.modeloSistema.set(models[0].name);
      this.aiConfigService.setModeloSistema(models[0].name);
    }
    if (!this.modeloChatFlutuante() && models.length > 0) {
      this.modeloChatFlutuante.set(models[0].name);
      this.aiConfigService.setModeloChatFlutuante(models[0].name);
    }
  }

  salvarModelos(): void {
    this.aiConfigService.setModeloSistema(this.modeloSistema());
    this.aiConfigService.setModeloChatFlutuante(this.modeloChatFlutuante());
    Swal.fire({
      icon: 'success',
      title: 'Modelos salvos',
      text: 'As configurações foram aplicadas com sucesso.',
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
