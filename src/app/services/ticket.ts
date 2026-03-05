import { Injectable } from '@angular/core';
import { Ticket, Comentario } from '../interfaces/ticket.interface';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly STORAGE_KEY = 'tasky_tickets';
  
  private tickets: Ticket[] = this.carregarDoLocalStorage();
  
  private carregarDoLocalStorage(): Ticket[] {
    const dados = localStorage.getItem(this.STORAGE_KEY);
    if (dados) {
      try {
        return JSON.parse(dados);
      } catch (e) {
        console.error('Erro ao carregar tickets do localStorage:', e);
      }
    }
    // Se não houver dados salvos, retorna os dados padrão
    // Datas distribuídas nos últimos 7 dias para popular gráficos
    return [
    {
      id: '1',
      titulo: 'Computador não liga após atualização',
      descricao: 'O computador da sala 205 não está ligando depois da última atualização do Windows.',
      prioridade: 'Alta',
      status: 'Aberto',
      categoria: 'Hardware',
      criadoPor: 'João Silva',
      dataCriacao: '2026-01-19 08:00',
      dataAtualizacao: '2026-01-19 08:00'
    },
    {
      id: '2',
      titulo: 'Solicitação de acesso ao sistema financeiro',
      descricao: 'Novo funcionário precisa de acesso ao sistema SAP financeiro.',
      prioridade: 'Média',
      status: 'Em Andamento',
      categoria: 'Acesso',
      criadoPor: 'Maria Santos',
      dataCriacao: '2026-01-19 07:30',
      dataAtualizacao: '2026-01-19 10:22'
    },
    {
      id: '3',
      titulo: 'Impressora offline na área administrativa',
      descricao: 'A impressora HP LaserJet da área administrativa está offline há 2 dias.',
      prioridade: 'Baixa',
      status: 'Aguardando',
      categoria: 'Hardware',
      criadoPor: 'Pedro Costa',
      dataCriacao: '2026-01-18 14:20',
      dataAtualizacao: '2026-01-18 16:45'
    },
    {
      id: '4',
      titulo: 'Erro ao acessar servidor de arquivos',
      descricao: 'Não consigo acessar o servidor de arquivos compartilhados desde ontem.',
      prioridade: 'Alta',
      status: 'Em Andamento',
      categoria: 'Rede',
      criadoPor: 'Ana Oliveira',
      dataCriacao: '2026-01-19 07:00',
      dataAtualizacao: '2026-01-19 11:30'
    },
    {
      id: '5',
      titulo: 'Instalação de software específico',
      descricao: 'Preciso instalar o Adobe Creative Suite no meu computador.',
      prioridade: 'Média',
      status: 'Aberto',
      categoria: 'Software',
      criadoPor: 'Carlos Mendes',
      dataCriacao: '2026-01-17 10:15',
      dataAtualizacao: '2026-01-17 10:15'
    },
    {
      id: '6',
      titulo: 'Reset de senha de email',
      descricao: 'Esqueci minha senha do email corporativo e preciso resetar.',
      prioridade: 'Baixa',
      status: 'Resolvido',
      categoria: 'Acesso',
      criadoPor: 'Fernanda Lima',
      dataCriacao: '2026-01-18 09:00',
      dataAtualizacao: '2026-01-18 10:30',
      dataResolucao: '2026-01-18 10:30'
    },
    {
      id: '7',
      titulo: 'Problema com conexão WiFi',
      descricao: 'A conexão WiFi está muito lenta no terceiro andar.',
      prioridade: 'Média',
      status: 'Em Andamento',
      categoria: 'Rede',
      criadoPor: 'Roberto Alves',
      dataCriacao: '2026-01-17 08:45',
      dataAtualizacao: '2026-01-17 12:00'
    },
    {
      id: '8',
      titulo: 'Solicitação de novo equipamento',
      descricao: 'Preciso de um novo monitor para minha estação de trabalho.',
      prioridade: 'Baixa',
      status: 'Aguardando',
      categoria: 'Hardware',
      criadoPor: 'Juliana Ferreira',
      dataCriacao: '2026-01-16 15:30',
      dataAtualizacao: '2026-01-17 09:15'
    },
    {
      id: '9',
      titulo: 'Erro ao executar aplicativo',
      descricao: 'O aplicativo de gestão não está abrindo após a última atualização.',
      prioridade: 'Alta',
      status: 'Aberto',
      categoria: 'Software',
      criadoPor: 'Lucas Martins',
      dataCriacao: '2026-01-19 09:20',
      dataAtualizacao: '2026-01-19 09:20'
    },
    {
      id: '10',
      titulo: 'Troca de teclado danificado',
      descricao: 'Teclado da estação 12 está com teclas travadas.',
      prioridade: 'Média',
      status: 'Resolvido',
      categoria: 'Hardware',
      criadoPor: 'Patricia Souza',
      dataCriacao: '2026-01-18 11:00',
      dataAtualizacao: '2026-01-18 15:00',
      dataResolucao: '2026-01-18 15:00'
    },
    {
      id: '11',
      titulo: 'Falha na conexão VPN',
      descricao: 'Não consigo conectar à VPN da empresa desde ontem.',
      prioridade: 'Alta',
      status: 'Aberto',
      categoria: 'Rede',
      criadoPor: 'Ricardo Pereira',
      dataCriacao: '2026-01-19 06:30',
      dataAtualizacao: '2026-01-19 06:30'
    },
    {
      id: '12',
      titulo: 'Acesso ao sistema de RH',
      descricao: 'Preciso de acesso ao sistema de recursos humanos.',
      prioridade: 'Baixa',
      status: 'Em Andamento',
      categoria: 'Acesso',
      criadoPor: 'Sandra Costa',
      dataCriacao: '2026-01-18 16:00',
      dataAtualizacao: '2026-01-19 08:00'
    },
    {
      id: '13',
      titulo: 'Correção de bug no sistema',
      descricao: 'Relatório financeiro está gerando valores incorretos.',
      prioridade: 'Alta',
      status: 'Resolvido',
      categoria: 'Software',
      criadoPor: 'Thiago Almeida',
      dataCriacao: '2026-01-16 10:00',
      dataAtualizacao: '2026-01-16 14:30',
      dataResolucao: '2026-01-16 14:30'
    },
    {
      id: '14',
      titulo: 'Substituição de mouse',
      descricao: 'Mouse óptico parou de funcionar.',
      prioridade: 'Média',
      status: 'Aberto',
      categoria: 'Hardware',
      criadoPor: 'Vanessa Rocha',
      dataCriacao: '2026-01-17 11:00',
      dataAtualizacao: '2026-01-17 11:00'
    },
    {
      id: '15',
      titulo: 'Configuração de impressora',
      descricao: 'Preciso configurar uma nova impressora na rede.',
      prioridade: 'Alta',
      status: 'Aguardando',
      categoria: 'Rede',
      criadoPor: 'Wagner Silva',
      dataCriacao: '2026-01-18 13:00',
      dataAtualizacao: '2026-01-18 15:00'
    },
    {
      id: '16',
      titulo: 'Recuperação de arquivo deletado',
      descricao: 'Acidentalmente deletei um arquivo importante.',
      prioridade: 'Baixa',
      status: 'Resolvido',
      categoria: 'Acesso',
      criadoPor: 'Yara Mendes',
      dataCriacao: '2026-01-15 08:00',
      dataAtualizacao: '2026-01-15 09:15',
      dataResolucao: '2026-01-15 09:15'
    },
    {
      id: '17',
      titulo: 'Atualização de sistema operacional',
      descricao: 'Preciso atualizar o Windows em 5 máquinas.',
      prioridade: 'Alta',
      status: 'Em Andamento',
      categoria: 'Software',
      criadoPor: 'Zeca Santos',
      dataCriacao: '2026-01-19 05:00',
      dataAtualizacao: '2026-01-19 10:00'
    },
    {
      id: '18',
      titulo: 'Problema com scanner',
      descricao: 'Scanner não está digitalizando documentos corretamente.',
      prioridade: 'Média',
      status: 'Aberto',
      categoria: 'Hardware',
      criadoPor: 'Amanda Lima',
      dataCriacao: '2026-01-17 12:30',
      dataAtualizacao: '2026-01-17 12:30'
    },
    {
      id: '19',
      titulo: 'Configuração de firewall',
      descricao: 'Preciso liberar acesso a um site específico.',
      prioridade: 'Média',
      status: 'Resolvido',
      categoria: 'Rede',
      criadoPor: 'Bruno Oliveira',
      dataCriacao: '2026-01-18 07:00',
      dataAtualizacao: '2026-01-18 11:00',
      dataResolucao: '2026-01-18 11:00'
    },
    {
      id: '20',
      titulo: 'Instalação de antivírus',
      descricao: 'Preciso instalar antivírus em computadores novos.',
      prioridade: 'Baixa',
      status: 'Aguardando',
      categoria: 'Software',
      criadoPor: 'Camila Ferreira',
      dataCriacao: '2026-01-14 10:00',
      dataAtualizacao: '2026-01-15 09:00'
    },
    {
      id: '21',
      titulo: 'Acesso ao banco de dados',
      descricao: 'Preciso de acesso de leitura ao banco de dados de produção.',
      prioridade: 'Alta',
      status: 'Aberto',
      categoria: 'Acesso',
      criadoPor: 'Daniel Rodrigues',
      dataCriacao: '2026-01-16 13:00',
      dataAtualizacao: '2026-01-16 13:00'
    },
    {
      id: '22',
      titulo: 'Troca de fonte do notebook',
      descricao: 'Fonte do notebook queimou e precisa ser substituída.',
      prioridade: 'Média',
      status: 'Em Andamento',
      categoria: 'Hardware',
      criadoPor: 'Eduarda Alves',
      dataCriacao: '2026-01-17 09:00',
      dataAtualizacao: '2026-01-17 14:00'
    },
    {
      id: '23',
      titulo: 'Correção de permissões',
      descricao: 'Usuário não consegue salvar arquivos na pasta compartilhada.',
      prioridade: 'Alta',
      status: 'Resolvido',
      categoria: 'Rede',
      criadoPor: 'Felipe Costa',
      dataCriacao: '2026-01-18 06:00',
      dataAtualizacao: '2026-01-18 10:00',
      dataResolucao: '2026-01-18 10:00'
    },
    {
      id: '24',
      titulo: 'Atualização de driver',
      descricao: 'Driver da placa de vídeo está desatualizado.',
      prioridade: 'Baixa',
      status: 'Aberto',
      categoria: 'Software',
      criadoPor: 'Gabriela Martins',
      dataCriacao: '2026-01-19 14:00',
      dataAtualizacao: '2026-01-19 14:00'
    },
    {
      id: '25',
      titulo: 'Configuração de email',
      descricao: 'Preciso configurar o Outlook no novo computador.',
      prioridade: 'Média',
      status: 'Aguardando',
      categoria: 'Acesso',
      criadoPor: 'Henrique Souza',
      dataCriacao: '2026-01-18 12:00',
      dataAtualizacao: '2026-01-18 16:00'
    },
    {
      id: '26',
      titulo: 'Substituição de HD',
      descricao: 'HD está fazendo barulho estranho, precisa ser substituído.',
      prioridade: 'Alta',
      status: 'Em Andamento',
      categoria: 'Hardware',
      criadoPor: 'Isabela Rocha',
      dataCriacao: '2026-01-19 04:00',
      dataAtualizacao: '2026-01-19 11:00'
    },
    {
      id: '27',
      titulo: 'Backup de dados',
      descricao: 'Preciso fazer backup dos arquivos antes de formatar o computador.',
      prioridade: 'Baixa',
      status: 'Resolvido',
      categoria: 'Software',
      criadoPor: 'João Pedro',
      dataCriacao: '2026-01-16 09:00',
      dataAtualizacao: '2026-01-16 10:30',
      dataResolucao: '2026-01-16 10:30'
    },
    {
      id: '28',
      titulo: 'Problema com switch de rede',
      descricao: 'Switch da sala 3 está com portas não funcionando.',
      prioridade: 'Média',
      status: 'Aberto',
      categoria: 'Rede',
      criadoPor: 'Karina Silva',
      dataCriacao: '2026-01-17 15:00',
      dataAtualizacao: '2026-01-17 15:00'
    },
    {
      id: '29',
      titulo: 'Acesso ao servidor de desenvolvimento',
      descricao: 'Preciso de acesso SSH ao servidor de desenvolvimento.',
      prioridade: 'Alta',
      status: 'Aguardando',
      categoria: 'Acesso',
      criadoPor: 'Leonardo Mendes',
      dataCriacao: '2026-01-18 08:00',
      dataAtualizacao: '2026-01-18 12:00'
    },
    {
      id: '30',
      titulo: 'Limpeza de computador',
      descricao: 'Computador está muito lento, precisa de limpeza e manutenção.',
      prioridade: 'Média',
      status: 'Resolvido',
      categoria: 'Hardware',
      criadoPor: 'Mariana Costa',
      dataCriacao: '2026-01-15 11:00',
      dataAtualizacao: '2026-01-15 13:00',
      dataResolucao: '2026-01-15 13:00'
    },
    {
      id: '31',
      titulo: 'Instalação de plugin',
      descricao: 'Preciso instalar plugin específico no navegador.',
      prioridade: 'Baixa',
      status: 'Aberto',
      categoria: 'Software',
      criadoPor: 'Nicolas Almeida',
      dataCriacao: '2026-01-16 16:00',
      dataAtualizacao: '2026-01-16 16:00'
    },
    {
      id: '32',
      titulo: 'Configuração de roteador',
      descricao: 'Roteador precisa ser reconfigurado após queda de energia.',
      prioridade: 'Alta',
      status: 'Em Andamento',
      categoria: 'Rede',
      criadoPor: 'Olivia Rodrigues',
      dataCriacao: '2026-01-19 03:00',
      dataAtualizacao: '2026-01-19 09:00'
    },
    {
      id: '33',
      titulo: 'Troca de tela quebrada',
      descricao: 'Tela do monitor quebrou após queda acidental.',
      prioridade: 'Alta',
      status: 'Resolvido',
      categoria: 'Hardware',
      criadoPor: 'Paulo Lima',
      dataCriacao: '2026-01-18 05:00',
      dataAtualizacao: '2026-01-18 09:00',
      dataResolucao: '2026-01-18 09:00'
    },
    {
      id: '34',
      titulo: 'Acesso ao sistema de vendas',
      descricao: 'Novo vendedor precisa de acesso ao sistema de vendas.',
      prioridade: 'Média',
      status: 'Aberto',
      categoria: 'Acesso',
      criadoPor: 'Quenia Oliveira',
      dataCriacao: '2026-01-19 17:00',
      dataAtualizacao: '2026-01-19 17:00'
    },
    {
      id: '35',
      titulo: 'Correção de bug crítico',
      descricao: 'Sistema está travando ao gerar relatórios.',
      prioridade: 'Baixa',
      status: 'Aguardando',
      categoria: 'Software',
      criadoPor: 'Rafael Ferreira',
      dataCriacao: '2026-01-13 14:00',
      dataAtualizacao: '2026-01-14 10:00'
    },
    {
      id: '36',
      titulo: 'Manutenção preventiva',
      descricao: 'Preciso fazer manutenção preventiva nos servidores.',
      prioridade: 'Média',
      status: 'Em Andamento',
      categoria: 'Hardware',
      criadoPor: 'Sabrina Alves',
      dataCriacao: '2026-01-19 02:00',
      dataAtualizacao: '2026-01-19 08:00'
    },
    {
      id: '37',
      titulo: 'Restauração de backup',
      descricao: 'Preciso restaurar backup de arquivos deletados acidentalmente.',
      prioridade: 'Baixa',
      status: 'Resolvido',
      categoria: 'Rede',
      criadoPor: 'Tiago Rocha',
      dataCriacao: '2026-01-16 08:00',
      dataAtualizacao: '2026-01-16 09:45',
      dataResolucao: '2026-01-16 09:45'
    },
    {
      id: '38',
      titulo: 'Criação de usuário',
      descricao: 'Preciso criar usuário para novo funcionário.',
      prioridade: 'Alta',
      status: 'Aberto',
      categoria: 'Acesso',
      criadoPor: 'Ursula Santos',
      dataCriacao: '2026-01-17 18:00',
      dataAtualizacao: '2026-01-17 18:00'
    },
    {
      id: '39',
      titulo: 'Atualização de licença',
      descricao: 'Licença do software está expirando, precisa renovar.',
      prioridade: 'Média',
      status: 'Aguardando',
      categoria: 'Software',
      criadoPor: 'Victor Martins',
      dataCriacao: '2026-01-18 10:00',
      dataAtualizacao: '2026-01-18 14:00'
    },
    {
      id: '40',
      titulo: 'Configuração de proxy',
      descricao: 'Preciso configurar proxy para acesso à internet.',
      prioridade: 'Alta',
      status: 'Em Andamento',
      categoria: 'Rede',
      criadoPor: 'Wanessa Costa',
      dataCriacao: '2026-01-19 01:00',
      dataAtualizacao: '2026-01-19 07:00'
    },
    {
      id: '41',
      titulo: 'Recuperação de senha',
      descricao: 'Usuário esqueceu senha e precisa resetar.',
      prioridade: 'Média',
      status: 'Resolvido',
      categoria: 'Acesso',
      criadoPor: 'Xavier Lima',
      dataCriacao: '2026-01-15 12:00',
      dataAtualizacao: '2026-01-15 14:30',
      dataResolucao: '2026-01-15 14:30'
    },
    {
      id: '42',
      titulo: 'Problema com webcam',
      descricao: 'Webcam não está funcionando nas videoconferências.',
      prioridade: 'Baixa',
      status: 'Aberto',
      categoria: 'Hardware',
      criadoPor: 'Yasmin Mendes',
      dataCriacao: '2026-01-16 19:00',
      dataAtualizacao: '2026-01-16 19:00'
    },
    {
      id: '43',
      titulo: 'Instalação de certificado SSL',
      descricao: 'Preciso instalar certificado SSL no servidor web.',
      prioridade: 'Alta',
      status: 'Aguardando',
      categoria: 'Software',
      criadoPor: 'Zacarias Almeida',
      dataCriacao: '2026-01-18 11:00',
      dataAtualizacao: '2026-01-18 15:00'
    },
    {
      id: '44',
      titulo: 'Configuração de DNS',
      descricao: 'DNS precisa ser reconfigurado após migração.',
      prioridade: 'Média',
      status: 'Em Andamento',
      categoria: 'Rede',
      criadoPor: 'Adriana Rodrigues',
      dataCriacao: '2026-01-19 00:00',
      dataAtualizacao: '2026-01-19 06:00'
    },
    {
      id: '45',
      titulo: 'Substituição de cabo de rede',
      descricao: 'Cabo de rede está com defeito, precisa ser substituído.',
      prioridade: 'Alta',
      status: 'Resolvido',
      categoria: 'Rede',
      criadoPor: 'Bernardo Ferreira',
      dataCriacao: '2026-01-17 04:00',
      dataAtualizacao: '2026-01-17 08:00',
      dataResolucao: '2026-01-17 08:00'
    },
    {
      id: '46',
      titulo: 'Acesso ao repositório Git',
      descricao: 'Preciso de acesso ao repositório Git do projeto.',
      prioridade: 'Média',
      status: 'Aberto',
      categoria: 'Acesso',
      criadoPor: 'Carla Souza',
      dataCriacao: '2026-01-16 20:00',
      dataAtualizacao: '2026-01-16 20:00'
    },
    {
      id: '47',
      titulo: 'Correção de erro no banco',
      descricao: 'Erro ao executar query no banco de dados.',
      prioridade: 'Baixa',
      status: 'Aguardando',
      categoria: 'Software',
      criadoPor: 'Diego Rocha',
      dataCriacao: '2026-01-13 15:00',
      dataAtualizacao: '2026-01-14 10:00'
    }
    ];
  }

  getTickets(): Ticket[] {
    return [...this.tickets];
  }

  getTicketById(id: string): Ticket | undefined {
    return this.tickets.find(t => t.id === id);
  }

  adicionarTicket(ticket: Omit<Ticket, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Ticket {
    const novoId = this.gerarNovoId();
    const agora = new Date().toISOString().slice(0, 16).replace('T', ' ');
    
    const novoTicket: Ticket = {
      ...ticket,
      id: novoId,
      dataCriacao: agora,
      dataAtualizacao: agora,
      comentarios: [{
        id: '0',
        autor: ticket.criadoPor,
        texto: ticket.descricao,
        data: agora
      }]
    };
    
    this.tickets.push(novoTicket);
    this.salvarNoLocalStorage();
    return novoTicket;
  }

  atualizarTicket(ticket: Ticket): void {
    const index = this.tickets.findIndex(t => t.id === ticket.id);
    if (index !== -1) {
      ticket.dataAtualizacao = new Date().toISOString().slice(0, 16).replace('T', ' ');
      this.tickets[index] = ticket;
      this.salvarNoLocalStorage();
    }
  }

  adicionarComentario(ticketId: string, comentario: Omit<Comentario, 'id' | 'data'>): void {
    const ticket = this.getTicketById(ticketId);
    if (ticket) {
      if (!ticket.comentarios) {
        ticket.comentarios = [];
      }
      
      const novoComentario: Comentario = {
        ...comentario,
        id: String(Date.now()),
        data: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };
      
      ticket.comentarios.push(novoComentario);
      ticket.dataAtualizacao = new Date().toISOString().slice(0, 16).replace('T', ' ');
      this.salvarNoLocalStorage();
    }
  }

  removerComentario(ticketId: string, comentarioId: string): void {
    const ticket = this.getTicketById(ticketId);
    if (ticket && ticket.comentarios) {
      ticket.comentarios = ticket.comentarios.filter(c => c.id !== comentarioId);
      ticket.dataAtualizacao = new Date().toISOString().slice(0, 16).replace('T', ' ');
      this.salvarNoLocalStorage();
    }
  }

  private gerarNovoId(): string {
    const maxId = this.tickets.reduce((max, t) => {
      const numId = parseInt(t.id) || 0;
      return numId > max ? numId : max;
    }, 0);
    return String(maxId + 1);
  }

  private salvarNoLocalStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tickets));
    } catch (e) {
      console.error('Erro ao salvar tickets no localStorage:', e);
    }
  }
}
