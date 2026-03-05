import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeminiApiKeyService {
  private readonly STORAGE_KEY = 'gemini_api_key';
  
  // Signal para a chave da API
  apiKey = signal<string>('');

  constructor() {
    // Carregar chave salva do localStorage ao inicializar
    const savedKey = localStorage.getItem(this.STORAGE_KEY);
    if (savedKey) {
      this.apiKey.set(savedKey);
    }
  }

  /**
   * Define a chave da API e salva no localStorage
   */
  setApiKey(key: string): void {
    this.apiKey.set(key);
    if (key) {
      localStorage.setItem(this.STORAGE_KEY, key);
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Retorna a chave atual
   */
  getApiKey(): string {
    return this.apiKey();
  }

  /**
   * Verifica se há uma chave configurada
   */
  hasApiKey(): boolean {
    return !!this.apiKey() && this.apiKey().trim().length > 0;
  }

  /**
   * Remove a chave (limpa)
   */
  clearApiKey(): void {
    this.apiKey.set('');
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
