import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Layout } from '../../components/layout/layout.component';
import { AuthService } from '../../services/auth.service';

interface AdminCard {
  title: string;
  description: string;
  route: string;
  icon: string;
  color: string;
}

interface AdminSection {
  title: string;
  subtitle?: string;
  icon: string;
  cards: AdminCard[];
}

@Component({
  selector: 'app-painel-admin',
  imports: [CommonModule, RouterModule, Layout],
  templateUrl: './painel-admin.component.html',
  styleUrl: './painel-admin.component.css'
})
export class PainelAdminComponent {
  private authService = inject(AuthService);

  currentUser = signal(this.authService.getCurrentUser());

  sections: AdminSection[] = [
    {
      title: 'Configurações da IA',
      subtitle: 'Chave de API, modelos e assistente',
      icon: 'bi-cpu',
      cards: [
        {
          title: 'Config IA',
          description: 'Chave da API Gemini e modelos do sistema e chat',
          route: '/config-ia',
          icon: 'bi-gear-wide-connected',
          color: '#fd7e14'
        },
        {
          title: 'Configuração de Voz',
          description: 'Reconhecimento de voz e wake word "ei axis"',
          route: '/config-voz',
          icon: 'bi-mic',
          color: '#6f42c1'
        },
        {
          title: 'Axis AI',
          description: 'Assistente virtual para tickets e comandos por voz',
          route: '/chat',
          icon: 'bi-chat-dots',
          color: '#20c997'
        }
      ]
    },
    {
      title: 'Métodos de integração',
      subtitle: 'APIs, webhooks e conectores',
      icon: 'bi-plug',
      cards: [
        {
          title: 'Integrações',
          description: 'APIs REST, webhooks e conectores (Fluig, e-mail, Slack)',
          route: '/integracao',
          icon: 'bi-link-45deg',
          color: '#06002E'
        }
      ]
    }
  ];
}
