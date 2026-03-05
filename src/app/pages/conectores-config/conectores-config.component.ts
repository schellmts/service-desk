import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Layout } from '../../components/layout/layout.component';
import Swal from 'sweetalert2';
import { ConectorConfigService } from '../../services/conector-config.service';
import { ConectorConfig, MetodoIntegracao, ConfiguracaoBackendProprio, ConfiguracaoFluig } from '../../interfaces/conector-config.interface';

@Component({
  selector: 'app-conectores-config',
  imports: [CommonModule, FormsModule, RouterModule, Layout],
  templateUrl: './conectores-config.component.html',
  styleUrl: './conectores-config.component.css'
})
export class ConectoresConfigComponent implements OnInit {
  private conectorConfigService = inject(ConectorConfigService);

  metodoIntegracao = signal<MetodoIntegracao>('backend-proprio');
  
  // Configurações Backend Próprio
  backendUrl = signal('');
  backendTimeout = signal(30);
  backendHeaders = signal<Record<string, string>>({});
  backendHeaderKey = signal('');
  backendHeaderValue = signal('');

  // Configurações Fluig
  fluigUrl = signal('');
  fluigApiKey = signal('');
  fluigApiSecret = signal('');
  fluigProcessoId = signal('');
  fluigDatasetId = signal('');
  fluigFormId = signal('');
  fluigToken = signal('');
  fluigTokenSecret = signal('');

  ativo = signal(true);
  isLoading = signal(false);

  ngOnInit(): void {
    this.carregarConfiguracao();
  }

  private carregarConfiguracao(): void {
    const config = this.conectorConfigService.getConfiguracao();
    if (config) {
      this.metodoIntegracao.set(config.metodoIntegracao);
      this.ativo.set(config.ativo);

      if (config.backendProprio) {
        this.backendUrl.set(config.backendProprio.url || '');
        this.backendTimeout.set(config.backendProprio.timeout || 30);
        this.backendHeaders.set(config.backendProprio.headers || {});
      }

      if (config.fluig) {
        this.fluigUrl.set(config.fluig.url || '');
        this.fluigApiKey.set(config.fluig.apiKey || '');
        this.fluigApiSecret.set(config.fluig.apiSecret || '');
        this.fluigProcessoId.set(config.fluig.processoId || '');
        this.fluigDatasetId.set(config.fluig.datasetId || '');
        this.fluigFormId.set(config.fluig.formId || '');
        this.fluigToken.set(config.fluig.token || '');
        this.fluigTokenSecret.set(config.fluig.tokenSecret || '');
      }
    } else {
      // Valores padrão
      this.fluigUrl.set('https://fluig.grupomidia.com/');
    }
  }

  getHeadersKeys(): string[] {
    return Object.keys(this.backendHeaders());
  }

  getHeaderValue(key: string): string {
    return this.backendHeaders()[key];
  }

  adicionarHeader(): void {
    const key = this.backendHeaderKey().trim();
    const value = this.backendHeaderValue().trim();
    
    if (!key) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo obrigatório',
        text: 'Por favor, informe o nome do header.',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      return;
    }

    if (!value) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo obrigatório',
        text: 'Por favor, informe o valor do header.',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      return;
    }

    const headers = { ...this.backendHeaders() };
    
    // Verifica se já existe um header com o mesmo nome
    if (headers[key]) {
      Swal.fire({
        title: 'Header já existe',
        text: `O header "${key}" já foi adicionado. Deseja substituir o valor?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sim, substituir',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          headers[key] = value;
          this.backendHeaders.set(headers);
          this.backendHeaderKey.set('');
          this.backendHeaderValue.set('');
          
          Swal.fire({
            icon: 'success',
            title: 'Header atualizado',
            text: `O header "${key}" foi atualizado com sucesso.`,
            timer: 1000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        }
      });
    } else {
      headers[key] = value;
      this.backendHeaders.set(headers);
      this.backendHeaderKey.set('');
      this.backendHeaderValue.set('');
      
      Swal.fire({
        icon: 'success',
        title: 'Header adicionado',
        text: `O header "${key}" foi adicionado com sucesso.`,
        timer: 1000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  }

  removerHeader(key: string): void {
    const headers = { ...this.backendHeaders() };
    delete headers[key];
    this.backendHeaders.set(headers);
  }

  salvarConfiguracao(): void {
    this.isLoading.set(true);

    const config: ConectorConfig = {
      metodoIntegracao: this.metodoIntegracao(),
      ativo: this.ativo(),
    };

    if (this.metodoIntegracao() === 'backend-proprio') {
      if (!this.backendUrl().trim()) {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Por favor, informe a URL do backend.',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
        this.isLoading.set(false);
        return;
      }

      config.backendProprio = {
        url: this.backendUrl().trim(),
        timeout: this.backendTimeout(),
        headers: Object.keys(this.backendHeaders()).length > 0 ? this.backendHeaders() : undefined
      };
    } else if (this.metodoIntegracao() === 'fluig') {
      if (!this.fluigUrl().trim() || !this.fluigApiKey().trim() || !this.fluigApiSecret().trim()) {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Por favor, preencha pelo menos URL, API Key e API Secret do Fluig.',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
        this.isLoading.set(false);
        return;
      }

      config.fluig = {
        url: this.fluigUrl().trim(),
        apiKey: this.fluigApiKey().trim(),
        apiSecret: this.fluigApiSecret().trim(),
        processoId: this.fluigProcessoId().trim() || undefined,
        datasetId: this.fluigDatasetId().trim() || undefined,
        formId: this.fluigFormId().trim() || undefined,
        token: this.fluigToken().trim() || undefined,
        tokenSecret: this.fluigTokenSecret().trim() || undefined
      };
    }

    this.conectorConfigService.setConfiguracao(config);

    setTimeout(() => {
      this.isLoading.set(false);
      Swal.fire({
        icon: 'success',
        title: 'Configuração salva',
        text: 'As configurações do conector foram salvas com sucesso.',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }, 500);
  }

  limparConfiguracao(): void {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Isso irá remover todas as configurações salvas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, limpar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.conectorConfigService.clearConfiguracao();
        this.metodoIntegracao.set('backend-proprio');
        this.backendUrl.set('');
        this.backendTimeout.set(30);
        this.backendHeaders.set({});
        this.fluigUrl.set('https://fluig.grupomidia.com/');
        this.fluigApiKey.set('');
        this.fluigApiSecret.set('');
        this.fluigProcessoId.set('');
        this.fluigDatasetId.set('');
        this.fluigFormId.set('');
        this.fluigToken.set('');
        this.fluigTokenSecret.set('');
        this.ativo.set(true);

        Swal.fire({
          icon: 'success',
          title: 'Configuração limpa',
          text: 'Todas as configurações foram removidas.',
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      }
    });
  }
}
