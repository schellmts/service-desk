import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../services/ticket';
import { Layout } from '../../components/layout/layout.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-ticket',
  imports: [CommonModule, RouterModule, FormsModule, Layout],
  templateUrl: './create-ticket.component.html',
  styleUrl: './create-ticket.component.css',
})
export class CreateTicketComponent {
  private ticketService = inject(TicketService);
  private router = inject(Router);

  novoTicket = {
    titulo: '',
    descricao: '',
    prioridade: 'Média' as 'Alta' | 'Média' | 'Baixa',
    categoria: 'Outros' as 'Hardware' | 'Software' | 'Acesso' | 'Rede' | 'Outros',
    criadoPor: 'Administrador',
    status: 'Aberto' as 'Aberto' | 'Em Andamento' | 'Aguardando' | 'Resolvido',
    emailSolicitante: '',
    telefoneSolicitante: '',
    atribuidoA: '',
    localizacao: '',
    equipamento: '',
    sla: ''
  };

  criarTicket() {
    if (!this.novoTicket.titulo.trim() || !this.novoTicket.descricao.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obrigatórios',
        text: 'Por favor, preencha o título e a descrição do ticket.',
        confirmButtonColor: '#06002E'
      });
      return;
    }

    const ticket = this.ticketService.adicionarTicket({
      ...this.novoTicket
    });

    Swal.fire({
      icon: 'success',
      title: 'Ticket criado!',
      text: `Ticket ${ticket.id} criado com sucesso.`,
      confirmButtonColor: '#06002E',
      timer: 2000,
      showConfirmButton: true
    }).then(() => {
      this.router.navigate(['/tickets']);
    });
  }

  cancelar() {
    this.router.navigate(['/tickets']);
  }
}
