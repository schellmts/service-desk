import { Injectable } from '@angular/core';

const KEY_MODEL_SISTEMA = 'gemini_model_sistema';
const KEY_MODEL_CHAT_FLUTUANTE = 'gemini_model_floating_chat';

@Injectable({
  providedIn: 'root'
})
export class AiConfigService {
  /**
   * Modelo usado pelo sistema (chat Axis AI, criação de tickets, etc.)
   */
  getModeloSistema(): string {
    return localStorage.getItem(KEY_MODEL_SISTEMA) || '';
  }

  setModeloSistema(model: string): void {
    if (model) {
      localStorage.setItem(KEY_MODEL_SISTEMA, model);
    } else {
      localStorage.removeItem(KEY_MODEL_SISTEMA);
    }
  }

  /**
   * Modelo usado especificamente pelo chat flutuante
   */
  getModeloChatFlutuante(): string {
    return localStorage.getItem(KEY_MODEL_CHAT_FLUTUANTE) || '';
  }

  setModeloChatFlutuante(model: string): void {
    if (model) {
      localStorage.setItem(KEY_MODEL_CHAT_FLUTUANTE, model);
    } else {
      localStorage.removeItem(KEY_MODEL_CHAT_FLUTUANTE);
    }
  }
}
