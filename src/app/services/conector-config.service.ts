import { Injectable } from '@angular/core';
import { ConectorConfig, MetodoIntegracao } from '../interfaces/conector-config.interface';

const KEY_CONECTOR_CONFIG = 'conector_config';

@Injectable({
  providedIn: 'root'
})
export class ConectorConfigService {
  /**
   * Obtém a configuração atual do conector
   */
  getConfiguracao(): ConectorConfig | null {
    const config = localStorage.getItem(KEY_CONECTOR_CONFIG);
    if (!config) {
      return null;
    }
    try {
      return JSON.parse(config);
    } catch {
      return null;
    }
  }

  /**
   * Salva a configuração do conector
   */
  setConfiguracao(config: ConectorConfig): void {
    localStorage.setItem(KEY_CONECTOR_CONFIG, JSON.stringify(config));
  }

  /**
   * Remove a configuração do conector
   */
  clearConfiguracao(): void {
    localStorage.removeItem(KEY_CONECTOR_CONFIG);
  }

  /**
   * Obtém o método de integração atual
   */
  getMetodoIntegracao(): MetodoIntegracao | null {
    const config = this.getConfiguracao();
    return config?.metodoIntegracao || null;
  }

  /**
   * Verifica se há uma configuração salva
   */
  hasConfiguracao(): boolean {
    return this.getConfiguracao() !== null;
  }
}
