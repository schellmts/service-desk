import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TicketService } from '../../services/ticket';
import { Ticket } from '../../interfaces/ticket.interface';
import { Layout } from '../../components/layout/layout.component';

@Component({
  selector: 'app-kanban-board',
  imports: [CommonModule, RouterModule, FormsModule, DragDropModule, Layout],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css',
})
export class KanbanBoardComponent implements OnInit {
  private ticketService = inject(TicketService);

  backlog: Ticket[] = [];
  aFazer: Ticket[] = [];
  emAndamento: Ticket[] = [];
  emRevisao: Ticket[] = [];
  concluido: Ticket[] = [];

  // Modal
  mostrarModal: boolean = false;
  statusPredefinido: string = '';
  
  // Formulário
  novoTicket = {
    titulo: '',
    descricao: '',
    prioridade: 'Média' as 'Alta' | 'Média' | 'Baixa',
    categoria: 'Outros' as 'Hardware' | 'Software' | 'Acesso' | 'Rede' | 'Outros',
    criadoPor: 'Administrador'
  };

  ngOnInit() {
    this.carregarTickets();
  }

  carregarTickets() {
    const tickets = this.ticketService.getTickets();
    
    // Mapear status dos tickets para colunas do Kanban
    // Backlog: Aguardando (mas não os que estão em revisão)
    this.backlog = tickets.filter(t => t.status === 'Aguardando' && !(t as any).emRevisao);
    // A Fazer: Aberto
    this.aFazer = tickets.filter(t => t.status === 'Aberto');
    // Em Andamento: Em Andamento
    this.emAndamento = tickets.filter(t => t.status === 'Em Andamento');
    // Em Revisão: tickets marcados como em revisão
    this.emRevisao = tickets.filter(t => (t as any).emRevisao === true);
    // Concluído: Resolvido
    this.concluido = tickets.filter(t => t.status === 'Resolvido');
  }

  drop(event: CdkDragDrop<Ticket[]>) {
    if (event.previousContainer === event.container) {
      // Move dentro da mesma coluna
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Move entre colunas
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Atualizar status do ticket baseado na coluna de destino
      const ticket = event.container.data[event.currentIndex];
      this.atualizarStatusTicket(ticket, event.container.id);
    }
  }

  atualizarStatusTicket(ticket: Ticket, containerId: string) {
    const ticketAny = ticket as any;
    
    switch(containerId) {
      case 'backlog':
        ticket.status = 'Aguardando';
        ticketAny.emRevisao = false;
        break;
      case 'a-fazer':
        ticket.status = 'Aberto';
        ticketAny.emRevisao = false;
        break;
      case 'em-andamento':
        ticket.status = 'Em Andamento';
        ticketAny.emRevisao = false;
        break;
      case 'em-revisao':
        ticket.status = 'Aguardando';
        ticketAny.emRevisao = true;
        break;
      case 'concluido':
        ticket.status = 'Resolvido';
        ticketAny.emRevisao = false;
        if (!ticket.dataResolucao) {
          ticket.dataResolucao = new Date().toISOString().slice(0, 16).replace('T', ' ');
        }
        break;
    }
    ticket.dataAtualizacao = new Date().toISOString().slice(0, 16).replace('T', ' ');
    this.ticketService.atualizarTicket(ticket);
    this.carregarTickets();
  }

  get totalTarefas(): number {
    return this.backlog.length + this.aFazer.length + this.emAndamento.length + 
           this.emRevisao.length + this.concluido.length;
  }

  getBadgeClassPrioridade(prioridade: string): string {
    switch(prioridade) {
      case 'Alta': return 'bg-danger';
      case 'Média': return 'bg-warning';
      case 'Baixa': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  trackByTicketId(index: number, ticket: Ticket): string {
    return ticket.id;
  }

  abrirModal(status?: string) {
    this.statusPredefinido = status || '';
    this.novoTicket = {
      titulo: '',
      descricao: '',
      prioridade: 'Média',
      categoria: 'Outros',
      criadoPor: 'Administrador'
    };
    this.mostrarModal = true;
  }

  get nomeStatusPredefinido(): string {
    switch(this.statusPredefinido) {
      case 'backlog':
        return 'Backlog';
      case 'a-fazer':
        return 'A Fazer';
      case 'em-andamento':
        return 'Em Andamento';
      case 'em-revisao':
        return 'Em Revisão';
      case 'concluido':
        return 'Concluído';
      default:
        return '';
    }
  }

  fecharModal() {
    this.mostrarModal = false;
    this.statusPredefinido = '';
  }

  criarTarefa() {
    if (!this.novoTicket.titulo.trim() || !this.novoTicket.descricao.trim()) {
      return;
    }

    // Determinar status baseado no status predefinido ou padrão
    let status: Ticket['status'] = 'Aberto';
    let emRevisao = false;
    
    if (this.statusPredefinido === 'backlog') {
      status = 'Aguardando';
    } else if (this.statusPredefinido === 'a-fazer') {
      status = 'Aberto';
    } else if (this.statusPredefinido === 'em-andamento') {
      status = 'Em Andamento';
    } else if (this.statusPredefinido === 'em-revisao') {
      status = 'Aguardando';
      emRevisao = true;
    } else if (this.statusPredefinido === 'concluido') {
      status = 'Resolvido';
    }

    const ticketData: any = {
      ...this.novoTicket,
      status: status
    };
    
    if (emRevisao) {
      ticketData.emRevisao = true;
    }

    this.ticketService.adicionarTicket(ticketData);
    this.carregarTickets();
    this.fecharModal();
  }
}
