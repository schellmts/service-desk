import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TicketService } from '../../services/ticket';
import { Ticket } from '../../interfaces/ticket.interface';
import { Layout } from '../../components/layout/layout.component';

@Component({
  selector: 'app-ticket-list',
  imports: [CommonModule, FormsModule, RouterModule, Layout],
  templateUrl: './ticket-list.component.html'
})
export class TicketListComponent implements OnInit {
  private ticketService = inject(TicketService);
  private router = inject(Router);

  searchTerm: string = '';
  statusFiltro: string = 'Todos os Status';
  prioridadeFiltro: string = 'Todas Prioridades';

  get tickets(): Ticket[] {
    return this.ticketService.getTickets();
  }

  ticketsFiltrados: Ticket[] = [];

  ngOnInit() {
    this.aplicarFiltros();
  }

  get totalTickets(): number {
    return this.tickets.length;
  }

  get ticketsAbertos(): number {
    return this.tickets.filter(t => t.status === 'Aberto').length;
  }

  get ticketsEmAndamento(): number {
    return this.tickets.filter(t => t.status === 'Em Andamento').length;
  }

  get ticketsAltaPrioridade(): number {
    return this.tickets.filter(t => t.prioridade === 'Alta').length;
  }

  filtrarPorStatus(status: string) {
    if (status === 'Todos os Status') {
      this.statusFiltro = 'Todos os Status';
    } else {
      this.statusFiltro = status;
    }
    this.aplicarFiltros();
  }

  filtrarPorPrioridade(prioridade: string) {
    if (prioridade === 'Todas Prioridades') {
      this.prioridadeFiltro = 'Todas Prioridades';
    } else {
      this.prioridadeFiltro = prioridade;
    }
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    this.ticketsFiltrados = this.tickets.filter(ticket => {
      const matchStatus = this.statusFiltro === 'Todos os Status' || ticket.status === this.statusFiltro;
      const matchPrioridade = this.prioridadeFiltro === 'Todas Prioridades' || ticket.prioridade === this.prioridadeFiltro;
      const matchSearch = !this.searchTerm || 
        ticket.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ticket.titulo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ticket.descricao.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchStatus && matchPrioridade && matchSearch;
    }).sort((a, b) => {
      // Ordenar do mais recente para o mais antigo (por dataCriacao)
      const dataA = new Date(a.dataCriacao).getTime();
      const dataB = new Date(b.dataCriacao).getTime();
      return dataB - dataA; // Ordem decrescente
    });
  }

  onSearchChange() {
    this.aplicarFiltros();
  }

  getBadgeClassPrioridade(prioridade: string): string {
    switch(prioridade) {
      case 'Alta': return 'bg-danger';
      case 'Média': return 'bg-warning';
      case 'Baixa': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  getBadgeClassStatus(status: string): string {
    switch(status) {
      case 'Aberto': return 'bg-primary';
      case 'Em Andamento': return 'bg-info';
      case 'Aguardando': return 'bg-warning';
      case 'Resolvido': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  verDetalhes(ticketId: string) {
    this.router.navigate(['/tickets', ticketId]);
  }
}
