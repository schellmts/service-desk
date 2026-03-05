import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import Swal from 'sweetalert2';
import { TicketService } from '../../services/ticket';
import { Ticket } from '../../interfaces/ticket.interface';
import { Layout } from '../../components/layout/layout.component';

@Component({
  selector: 'app-service-desk-dashboard',
  imports: [CommonModule, RouterModule, FormsModule, NgxEchartsModule, Layout],
  templateUrl: './service-desk-dashboard.component.html',
  styleUrl: './service-desk-dashboard.component.css'
})
export class ServiceDeskDashboardComponent {
  private ticketService = inject(TicketService);

  // Filtros selecionados (ainda não aplicados)
  tipoFiltroSelecionado: string = 'Todos Tickets';
  prioridadeFiltroSelecionado: string = 'Todas';
  modoDataSelecionado: string = 'Tempo Real';
  periodoSelecionado: string = 'Hoje';

  // Filtros aplicados (usados para calcular métricas)
  tipoFiltroAplicado: string = 'Todos Tickets';
  prioridadeFiltroAplicado: string = 'Todas';
  periodoAplicado: string = 'Hoje';

  // Gráficos inicializados como propriedades
  chartDistribuicao: EChartsOption;
  chartAtividades: EChartsOption;

  constructor() {
    // Inicializar gráficos no construtor
    this.chartDistribuicao = this.initializeChartDistribuicao();
    this.chartAtividades = this.initializeChartAtividades();
  }

  get tickets(): Ticket[] {
    return this.ticketService.getTickets();
  }

  get ticketsFiltrados(): Ticket[] {
    let filtrados = [...this.tickets];

    // Filtro por tipo (status)
    if (this.tipoFiltroAplicado === 'Abertos') {
      filtrados = filtrados.filter(t => t.status === 'Aberto');
    } else if (this.tipoFiltroAplicado === 'Resolvidos') {
      filtrados = filtrados.filter(t => t.status === 'Resolvido');
    }

    // Filtro por prioridade
    if (this.prioridadeFiltroAplicado !== 'Todas') {
      filtrados = filtrados.filter(t => t.prioridade === this.prioridadeFiltroAplicado);
    }

    // Filtro por período (data)
    if (this.periodoAplicado === 'Hoje') {
      const hoje = new Date().toISOString().split('T')[0];
      filtrados = filtrados.filter(t => t.dataCriacao.startsWith(hoje));
    } else if (this.periodoAplicado === 'Semana') {
      const umaSemanaAtras = new Date();
      umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
      filtrados = filtrados.filter(t => {
        const dataTicket = new Date(t.dataCriacao);
        return dataTicket >= umaSemanaAtras;
      });
    } else if (this.periodoAplicado === 'Mês') {
      const umMesAtras = new Date();
      umMesAtras.setMonth(umMesAtras.getMonth() - 1);
      filtrados = filtrados.filter(t => {
        const dataTicket = new Date(t.dataCriacao);
        return dataTicket >= umMesAtras;
      });
    }

    return filtrados;
  }

  get ticketsAbertos(): number {
    return this.ticketsFiltrados.filter(t => t.status === 'Aberto').length;
  }

  get tarefasConcluidas(): number {
    return this.ticketsFiltrados.filter(t => t.status === 'Resolvido').length;
  }

  get tempoMedioResolucao(): number {
    const resolvidos = this.ticketsFiltrados.filter(t => t.status === 'Resolvido' && t.dataResolucao);
    if (resolvidos.length === 0) return 4.2;
    
    const tempos = resolvidos.map(t => {
      const criacao = new Date(t.dataCriacao).getTime();
      const resolucao = new Date(t.dataResolucao!).getTime();
      return (resolucao - criacao) / (1000 * 60 * 60); // horas
    });
    
    const media = tempos.reduce((a, b) => a + b, 0) / tempos.length;
    return Math.round(media * 10) / 10;
  }

  get slaCumprido(): number {
    const total = this.ticketsFiltrados.length;
    if (total === 0) return 94;
    
    const resolvidos = this.ticketsFiltrados.filter(t => t.status === 'Resolvido').length;
    return Math.round((resolvidos / total) * 100);
  }

  aplicarFiltro() {
    // Aplica os filtros selecionados
    this.tipoFiltroAplicado = this.tipoFiltroSelecionado;
    this.prioridadeFiltroAplicado = this.prioridadeFiltroSelecionado;
    this.periodoAplicado = this.periodoSelecionado;

    const totalFiltrado = this.ticketsFiltrados.length;
    
    Swal.fire({
      title: 'Filtros aplicados!',
      text: `Foram encontrados ${totalFiltrado} ticket(s) com os filtros selecionados.`,
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#06002E',
      timer: 2000,
      timerProgressBar: true
    });
  }

  filtrarPorTipo(tipo: string) {
    this.tipoFiltroSelecionado = tipo;
    this.aplicarFiltro();
  }

  get temDadosParaGrafico(): boolean {
    return true; // Sempre mostrar gráficos com dados fixos
  }

  // Gráfico de Distribuição por Categoria (Donut) - Dados Fixos
  private initializeChartDistribuicao(): EChartsOption {
    // Dados fixos: Hardware, Acesso, Software, Outros, Rede
    const categorias = ['Hardware', 'Acesso', 'Software', 'Outros', 'Rede'];
    const cores = ['#06002E', '#0dcaf0', '#6f42c1', '#6c757d', '#ffc107'];
    // Valores fixos: 35, 28, 22, 15, 20
    const valoresFixos = [35, 28, 22, 15, 20];
    
    const dados = categorias.map((cat, index) => ({
      value: valoresFixos[index],
      name: cat,
      itemStyle: { color: cores[index] }
    }));

    return {
      textStyle: {
        fontFamily: 'Poppins, sans-serif'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} tickets ({d}%)',
        textStyle: {
          fontFamily: 'Poppins, sans-serif'
        }
      },
      legend: {
        show: false
      },
      series: [
        {
          name: 'Distribuição por Categoria',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 5,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            fontFamily: 'Poppins, sans-serif'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
              fontFamily: 'Poppins, sans-serif'
            }
          },
          data: dados
        }
      ]
    };
  }

  // Gráfico de Atividades da Semana (Line Chart) - Dados Fixos
  private initializeChartAtividades(): EChartsOption {
    const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    
    // Dados fixos para os 7 dias
    const tarefasConcluidas: number[] = [38, 42, 45, 40, 52, 35, 30];
    const ticketsAbertos: number[] = [45, 48, 50, 47, 51, 43, 40];
    const ticketsResolvidos: number[] = [40, 44, 48, 42, 52, 38, 35];

    return {
      textStyle: {
        fontFamily: 'Poppins, sans-serif'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        textStyle: {
          fontFamily: 'Poppins, sans-serif'
        }
      },
      legend: {
        data: ['Tarefas Concluídas', 'Tickets Abertos', 'Tickets Resolvidos'],
        bottom: 0,
        textStyle: {
          fontFamily: 'Poppins, sans-serif'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: diasSemana,
        axisLabel: {
          fontFamily: 'Poppins, sans-serif'
        }
      },
      yAxis: {
        type: 'value',
        max: 60,
        interval: 15,
        axisLabel: {
          fontFamily: 'Poppins, sans-serif'
        }
      },
      series: [
        {
          name: 'Tarefas Concluídas',
          type: 'line',
          data: tarefasConcluidas,
          lineStyle: {
            type: 'dashed',
            color: '#28a745'
          },
          itemStyle: {
            color: '#28a745'
          },
          smooth: true
        },
        {
          name: 'Tickets Abertos',
          type: 'line',
          data: ticketsAbertos,
          lineStyle: {
            color: '#06002E'
          },
          itemStyle: {
            color: '#06002E'
          },
          smooth: true
        },
        {
          name: 'Tickets Resolvidos',
          type: 'line',
          data: ticketsResolvidos,
          lineStyle: {
            color: '#0dcaf0'
          },
          itemStyle: {
            color: '#0dcaf0'
          },
          smooth: true
        }
      ]
    };
  }
}
