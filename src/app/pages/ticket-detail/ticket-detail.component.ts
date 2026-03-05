import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../services/ticket';
import { Ticket, Comentario, HistoricoEvento } from '../../interfaces/ticket.interface';
import { Layout } from '../../components/layout/layout.component';
import Swal from 'sweetalert2';

interface ItemHistorico {
  id: string;
  tipo: string;
  autor: string;
  descricao: string;
  data: string;
}

@Component({
  selector: 'app-ticket-detail',
  imports: [CommonModule, RouterModule, FormsModule, Layout],
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.css',
})
export class TicketDetailComponent implements OnInit {
  private ticketService = inject(TicketService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ticket: Ticket | undefined;
  ticketId: string = '';
  
  novoComentario: string = '';
  autorComentario: string = 'Administrador';

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.ticketId = params['id'];
      this.carregarTicket();
    });
  }

  carregarTicket() {
    this.ticket = this.ticketService.getTicketById(this.ticketId);
    if (!this.ticket) {
      this.router.navigate(['/tickets']);
    } else {
      // Inicializar campos opcionais
      if (!this.ticket.comentarios) {
        this.ticket.comentarios = [];
      }
      if (!this.ticket.historico) {
        this.ticket.historico = [];
      }
      if (!this.ticket.anexos) {
        this.ticket.anexos = [];
      }
      
      // Adicionar evento de criação se não existir
      if (this.ticket.historico.length === 0) {
        this.ticket.historico.push({
          id: '0',
          tipo: 'criacao',
          autor: 'Sistema',
          descricao: 'Ticket aberto automaticamente via portal',
          data: this.ticket.dataCriacao
        });
      }
      
      // Adicionar comentário inicial se não houver comentários
      if (this.ticket.comentarios.length === 0) {
        this.ticket.comentarios.push({
          id: '0',
          autor: this.ticket.criadoPor,
          texto: this.ticket.descricao,
          data: this.ticket.dataCriacao
        });
      }
      
      // Garantir dados padrão
      if (!this.ticket.emailSolicitante) {
        this.ticket.emailSolicitante = 'solicitante@empresa.com';
      }
      if (!this.ticket.emailTecnico && this.ticket.atribuidoA) {
        this.ticket.emailTecnico = 'tecnico@empresa.com';
      }
      if (!this.ticket.localizacao) {
        this.ticket.localizacao = 'Sala 305 - 3º Andar';
      }
      if (!this.ticket.equipamento) {
        this.ticket.equipamento = 'Desktop Dell OptiPlex 5080';
      }
      if (!this.ticket.sla) {
        this.ticket.sla = '4h 30min restantes';
      }
      
      this.ticketService.atualizarTicket(this.ticket);
    }
  }

  get historicoCompleto(): ItemHistorico[] {
    if (!this.ticket) return [];
    
    const historico: ItemHistorico[] = [];
    
    // Adicionar eventos do histórico
    if (this.ticket.historico) {
      historico.push(...this.ticket.historico.map(e => ({
        id: e.id,
        tipo: e.tipo,
        autor: e.autor,
        descricao: e.descricao,
        data: e.data
      })));
    }
    
    // Adicionar comentários como eventos
    if (this.ticket.comentarios) {
      this.ticket.comentarios.forEach(comentario => {
        historico.push({
          id: comentario.id,
          tipo: 'comentario',
          autor: comentario.autor,
          descricao: comentario.texto,
          data: comentario.data
        });
      });
    }
    
    // Ordenar por data
    return historico.sort((a, b) => {
      return new Date(a.data).getTime() - new Date(b.data).getTime();
    });
  }

  atualizarStatus() {
    if (!this.ticket) return;
    
    const evento: HistoricoEvento = {
      id: String(Date.now()),
      tipo: 'status',
      autor: this.autorComentario,
      descricao: `Status alterado para ${this.getStatusLabel(this.ticket.status)}`,
      data: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    
    if (!this.ticket.historico) {
      this.ticket.historico = [];
    }
    this.ticket.historico.push(evento);
    this.ticket.dataAtualizacao = new Date().toISOString().slice(0, 16).replace('T', ' ');
    this.ticketService.atualizarTicket(this.ticket);
  }

  atualizarPrioridade() {
    if (!this.ticket) return;
    
    const evento: HistoricoEvento = {
      id: String(Date.now()),
      tipo: 'prioridade',
      autor: this.autorComentario,
      descricao: `Prioridade atualizada para ${this.ticket.prioridade}`,
      data: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    
    if (!this.ticket.historico) {
      this.ticket.historico = [];
    }
    this.ticket.historico.push(evento);
    this.ticket.dataAtualizacao = new Date().toISOString().slice(0, 16).replace('T', ' ');
    this.ticketService.atualizarTicket(this.ticket);
    this.carregarTicket();
  }

  atualizarAtribuicao() {
    if (!this.ticket || !this.ticket.atribuidoA) return;
    
    const evento: HistoricoEvento = {
      id: String(Date.now()),
      tipo: 'atribuicao',
      autor: this.autorComentario,
      descricao: `Ticket atribuído para ${this.ticket.atribuidoA}`,
      data: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    
    if (!this.ticket.historico) {
      this.ticket.historico = [];
    }
    this.ticket.historico.push(evento);
    this.ticket.dataAtualizacao = new Date().toISOString().slice(0, 16).replace('T', ' ');
    this.ticketService.atualizarTicket(this.ticket);
    this.carregarTicket();
  }

  adicionarComentario() {
    if (!this.novoComentario.trim() || !this.ticket) {
      return;
    }

    this.ticketService.adicionarComentario(this.ticketId, {
      autor: this.autorComentario,
      texto: this.novoComentario
    });
    this.carregarTicket();
    this.novoComentario = '';
  }

  marcarComoResolvido() {
    if (!this.ticket) return;

    Swal.fire({
      title: 'Marcar como resolvido?',
      text: 'O ticket será marcado como resolvido.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sim, marcar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const ticketAtualizado: Ticket = {
          ...this.ticket!,
          status: 'Resolvido',
          dataResolucao: new Date().toISOString().slice(0, 16).replace('T', ' ')
        };
        
        const evento: HistoricoEvento = {
          id: String(Date.now()),
          tipo: 'resolucao',
          autor: this.autorComentario,
          descricao: 'Ticket marcado como resolvido',
          data: new Date().toISOString().slice(0, 16).replace('T', ' ')
        };
        
        if (!ticketAtualizado.historico) {
          ticketAtualizado.historico = [];
        }
        ticketAtualizado.historico.push(evento);
        
        this.ticketService.atualizarTicket(ticketAtualizado);
        this.carregarTicket();
        Swal.fire({
          icon: 'success',
          title: 'Ticket resolvido!',
          confirmButtonColor: '#06002E',
          timer: 2000
        });
      }
    });
  }

  fecharTicket() {
    Swal.fire({
      title: 'Fechar ticket?',
      text: 'O ticket será fechado.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6c757d',
      cancelButtonColor: '#06002E',
      confirmButtonText: 'Sim, fechar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.voltar();
      }
    });
  }

  reatribuirTicket() {
    Swal.fire({
      title: 'Reatribuir ticket',
      text: 'Funcionalidade em desenvolvimento',
      icon: 'info',
      confirmButtonColor: '#06002E'
    });
  }

  getStatusLabel(status: string): string {
    switch(status) {
      case 'Aberto': return 'Aberto';
      case 'Em Andamento': return 'Em Progresso';
      case 'Aguardando': return 'Aguardando';
      case 'Resolvido': return 'Resolvido';
      default: return status;
    }
  }

  getBadgeClassPrioridade(prioridade: string): string {
    switch(prioridade) {
      case 'Alta': return 'bg-danger text-white';
      case 'Média': return 'bg-warning text-dark';
      case 'Baixa': return 'bg-info text-white';
      default: return 'bg-secondary';
    }
  }

  getBadgeClassStatus(status: string): string {
    switch(status) {
      case 'Aberto': return 'bg-primary';
      case 'Em Andamento': return 'bg-info text-white';
      case 'Aguardando': return 'bg-warning text-dark';
      case 'Resolvido': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  getIconClassEvento(tipo: string): string {
    // Todos os eventos têm fundo azul conforme as imagens
    return 'bg-primary';
  }

  getIconEvento(tipo: string): string {
    switch(tipo) {
      case 'criacao': return 'bi bi-check-circle';
      case 'atribuicao': return 'bi bi-person-plus';
      case 'status': return 'bi bi-check-circle';
      case 'prioridade': return 'bi bi-flag-fill';
      case 'comentario': return 'bi bi-send';
      case 'resolucao': return 'bi bi-check-circle';
      default: return 'bi bi-circle';
    }
  }

  getAcaoEvento(tipo: string): string {
    switch(tipo) {
      case 'criacao': return 'Ticket criado';
      case 'atribuicao': return 'Atribuiu para';
      case 'status': return 'Status alterado para';
      case 'prioridade': return 'Atualizou prioridade para';
      case 'comentario': return 'Adicionou comentário';
      case 'resolucao': return 'Resolveu ticket';
      default: return 'Atualizou';
    }
  }

  voltar() {
    this.router.navigate(['/tickets']);
  }
}
