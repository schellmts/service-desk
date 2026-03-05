import { Routes } from '@angular/router';
import { ServiceDeskDashboardComponent } from './pages/service-desk-dashboard/service-desk-dashboard.component';
import { TicketListComponent } from './pages/ticket-list/ticket-list.component';
import { KanbanBoardComponent } from './pages/kanban-board/kanban-board.component';
import { CreateTicketComponent } from './pages/create-ticket/create-ticket.component';
import { TicketDetailComponent } from './pages/ticket-detail/ticket-detail.component';
import { AiConfigComponent } from './pages/ai-config/ai-config.component';
import { LoginComponent } from './pages/login/login.component';
import { TicketChatComponent } from './pages/ticket-chat/ticket-chat.component';
import { PainelAdminComponent } from './pages/painel-admin/painel-admin.component';
import { IntegracaoComponent } from './pages/integracao/integracao.component';
import { ConectoresConfigComponent } from './pages/conectores-config/conectores-config.component';
import { VoiceConfigComponent } from './pages/voice-config/voice-config.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: ServiceDeskDashboardComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: ServiceDeskDashboardComponent, canActivate: [authGuard] },
  { path: 'painel-admin', component: PainelAdminComponent, canActivate: [authGuard] },
  { path: 'tickets', component: TicketListComponent, canActivate: [authGuard] },
  { path: 'tickets/create', component: CreateTicketComponent, canActivate: [authGuard] },
  { path: 'tickets/:id', component: TicketDetailComponent, canActivate: [authGuard] },
  { path: 'kanban', component: KanbanBoardComponent, canActivate: [authGuard] },
  { path: 'config-ia', component: AiConfigComponent, canActivate: [authGuard] },
  { path: 'integracao', component: IntegracaoComponent, canActivate: [authGuard] },
  { path: 'integracao/conectores', component: ConectoresConfigComponent, canActivate: [authGuard] },
  { path: 'config-voz', component: VoiceConfigComponent, canActivate: [authGuard] },
  { path: 'text-reviewer', redirectTo: 'config-ia', pathMatch: 'full' },
  { path: 'chat', component: TicketChatComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/dashboard' }
];
