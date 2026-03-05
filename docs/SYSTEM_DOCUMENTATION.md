# 📚 Documentação Completa do Sistema - Taskye (AXIS Service Desk)

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Estrutura de Pastas](#estrutura-de-pastas)
4. [Autenticação e Autorização](#autenticação-e-autorização)
5. [Módulos e Funcionalidades](#módulos-e-funcionalidades)
6. [Services](#services)
7. [Interfaces](#interfaces)
8. [Guards e Interceptors](#guards-e-interceptors)
9. [Configuração](#configuração)
10. [Rotas](#rotas)
11. [Tecnologias Utilizadas](#tecnologias-utilizadas)

---

## 🎯 Visão Geral

**Taskye (AXIS Service Desk)** é um sistema de gestão de tickets e service desk desenvolvido em Angular 19, projetado para gerenciar solicitações de suporte técnico, acompanhar o status de tickets e fornecer ferramentas auxiliares para equipes de TI.

### Funcionalidades Principais

- ✅ **Gestão de Tickets** - Criação, edição, visualização e acompanhamento
- ✅ **Dashboard** - Visão geral com gráficos e métricas
- ✅ **Kanban Board** - Visualização de tickets em formato Kanban
- ✅ **Chat de Tickets** - Comunicação integrada
- ✅ **Revisor de Texto com IA** - Ferramenta auxiliar usando Google Gemini
- ✅ **Autenticação** - Sistema de login com roles (admin, user, tecnico)
- ✅ **Persistência Local** - Dados salvos no localStorage

---

## 🏗️ Arquitetura do Sistema

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      Angular Application                     │
│                      (Angular 19)                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │         App Component                  │
        │    (app.ts - Root Component)          │
        └───────────────┬───────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌───────────────┐              ┌───────────────┐
│   Router      │              │   Layout      │
│  (Routes)     │              │  Component    │
└───────┬───────┘              └───────┬───────┘
        │                               │
        │                               │
┌───────┴───────────────────────────────┴───────┐
│                                                │
│  ┌──────────────┐  ┌──────────────┐          │
│  │   Pages      │  │  Components  │          │
│  │  (Features)  │  │  (Reusable)  │          │
│  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                   │
│         └────────┬─────────┘                   │
│                  │                             │
│         ┌─────────▼─────────┐                  │
│         │     Services      │                  │
│         │  (Business Logic) │                  │
│         └─────────┬─────────┘                  │
│                   │                             │
│         ┌─────────▼─────────┐                  │
│         │   HttpClient      │                  │
│         └─────────┬─────────┘                  │
│                   │                             │
│         ┌─────────▼─────────┐                  │
│         │   Interceptors    │                  │
│         └─────────┬─────────┘                  │
│                   │                             │
└───────────────────┼─────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   localStorage        │
        │   (Persistence)       │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   External APIs       │
        │   (Gemini API)        │
        └───────────────────────┘
```

### Fluxo de Dados

```
User Action → Component → Service → HttpClient → Interceptor → API/Storage
                                                                    │
User View ← Component ← Service ← HttpClient ← Interceptor ← Response/Data
```

---

## 📁 Estrutura de Pastas

```
src/app/
├── app.ts                    # Root component
├── app.config.ts             # Application configuration
├── app.routes.ts             # Route definitions
├── app.html                  # Root template
├── app.css                   # Global styles
│
├── components/               # Reusable components
│   ├── layout/
│   │   ├── layout.component.ts
│   │   ├── layout.component.html
│   │   └── layout.component.css
│   └── floating-chat/
│       ├── floating-chat.component.ts
│       ├── floating-chat.component.html
│       └── floating-chat.component.css
│
├── pages/                    # Feature pages
│   ├── login/
│   │   └── login.component.*
│   ├── service-desk-dashboard/
│   │   └── service-desk-dashboard.component.*
│   ├── ticket-list/
│   │   └── ticket-list.component.*
│   ├── create-ticket/
│   │   └── create-ticket.component.*
│   ├── ticket-detail/
│   │   └── ticket-detail.component.*
│   ├── ticket-chat/
│   │   └── ticket-chat.component.*
│   ├── kanban-board/
│   │   └── kanban-board.component.*
│   └── text-reviewer/
│       └── text-reviewer.component.*
│
├── services/                 # Business logic services
│   ├── auth.service.ts
│   ├── ticket.ts
│   ├── text-reviewer.service.ts
│   ├── gemini-api-key.service.ts
│   ├── ticket-ai.service.ts
│   ├── fluig/
│   │   └── fluig.service.ts
│   └── gemini/
│       └── gemini.service.ts
│
├── interfaces/               # TypeScript interfaces
│   ├── ticket.interface.ts
│   └── text-reviewer.interface.ts
│
├── guards/                  # Route guards
│   └── auth.guard.ts
│
├── interceptors/            # HTTP interceptors
│   └── gemini/
│       └── gemini-key.interceptor.ts
│
└── environment/            # Environment configuration
    └── environment.ts
```

---

## 🔐 Autenticação e Autorização

### AuthService

**Localização:** `src/app/services/auth.service.ts`

**Responsabilidade:** Gerenciar autenticação de usuários e sessões.

**Funcionalidades:**

- Login/Logout
- Gerenciamento de sessão (localStorage)
- Controle de usuários com roles
- Signals reativos para estado de autenticação

**Interface User:**

```typescript
interface User {
  id: string;
  email: string;
  nome: string;
  role: 'admin' | 'user' | 'tecnico';
}
```

**Usuários Padrão:**

| Email | Senha | Nome | Role |
|-------|-------|------|------|
| admin@axis.com | admin123 | Administrador | admin |
| user@axis.com | user123 | Usuário Teste | user |
| tecnico@axis.com | tec123 | Técnico Suporte | tecnico |

**Métodos:**

| Método | Descrição | Retorno |
|--------|-----------|---------|
| `login(email, senha)` | Autentica usuário | `{success: boolean, message?: string, user?: User}` |
| `logout()` | Remove sessão | `void` |
| `isAuthenticated()` | Verifica se está autenticado | `boolean` |
| `getCurrentUser()` | Retorna usuário atual | `User \| null` |
| `getCurrentUserSignal()` | Signal do usuário atual | `Signal<User \| null>` |
| `isAuthenticatedSignal()` | Signal de autenticação | `Signal<boolean>` |

**Storage:**
- Chave de sessão: `'axis_user_session'`
- Chave de usuários: `'axis_users'`

### AuthGuard

**Localização:** `src/app/guards/auth.guard.ts`

**Responsabilidade:** Proteger rotas que requerem autenticação.

**Funcionamento:**

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true; // Permite acesso
  }

  // Redireciona para login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
```

**Uso nas Rotas:**

```typescript
{ path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }
```

---

## 📦 Módulos e Funcionalidades

### 1. Login (`/login`)

**Componente:** `LoginComponent`

**Funcionalidade:** Tela de autenticação do sistema.

**Características:**
- Formulário de login (email/senha)
- Validação de credenciais
- Redirecionamento após login bem-sucedido
- Não requer autenticação (rota pública)

---

### 2. Dashboard (`/` ou `/dashboard`)

**Componente:** `ServiceDeskDashboardComponent`

**Funcionalidade:** Visão geral do sistema com métricas e gráficos.

**Recursos:**
- **Gráficos ECharts:**
  - Distribuição de tickets por categoria
  - Atividades ao longo do tempo (tarefas concluídas, tickets abertos/resolvidos)
- **Filtros:**
  - Tipo de filtro (Todos, Abertos, Resolvidos)
  - Prioridade (Todas, Alta, Média, Baixa)
  - Modo de data (Tempo Real, Última Hora, Últimas 24h)
- **Cards de métricas:**
  - Total de tickets
  - Tickets abertos
  - Tickets resolvidos
  - Taxa de resolução

**Dados Fixos (para demonstração):**
- Distribuição: Hardware (35), Acesso (28), Software (22), Outros (15), Rede (20)
- Atividades: Dados semanais pré-definidos

---

### 3. Lista de Tickets (`/tickets`)

**Componente:** `TicketListComponent`

**Funcionalidade:** Listagem e gerenciamento de tickets.

**Recursos:**
- Lista todos os tickets
- Filtros e busca
- Ordenação
- Navegação para detalhes do ticket

---

### 4. Criar Ticket (`/tickets/create`)

**Componente:** `CreateTicketComponent`

**Funcionalidade:** Formulário para criação de novos tickets.

**Campos:**
- Título
- Descrição
- Prioridade (Alta, Média, Baixa)
- Categoria (Hardware, Software, Acesso, Rede, Outros)
- Status inicial (geralmente "Aberto")

---

### 5. Detalhes do Ticket (`/tickets/:id`)

**Componente:** `TicketDetailComponent`

**Funcionalidade:** Visualização completa e edição de um ticket específico.

**Recursos:**
- Informações completas do ticket
- Histórico de eventos
- Comentários
- Anexos
- Atualização de status e prioridade
- Atribuição de técnico

---

### 6. Chat de Tickets (`/chat`)

**Componente:** `TicketChatComponent`

**Funcionalidade:** Interface de chat para comunicação sobre tickets.

**Recursos:**
- Chat em tempo real
- Integração com tickets
- Histórico de mensagens

---

### 7. Kanban Board (`/kanban`)

**Componente:** `KanbanBoardComponent`

**Funcionalidade:** Visualização de tickets em formato Kanban.

**Colunas:**
- **Aberto** - Tickets recém-criados
- **Em Andamento** - Tickets sendo trabalhados
- **Aguardando** - Tickets aguardando ação
- **Resolvido** - Tickets finalizados

**Recursos:**
- Drag and drop entre colunas
- Atualização automática de status
- Filtros por categoria/prioridade
- Visualização de cards com informações resumidas

---

### 8. Revisor de Texto (`/text-reviewer`)

**Componente:** `TextReviewerComponent`

**Funcionalidade:** Ferramenta de revisão de texto usando IA (Google Gemini).

**Recursos:**
- Revisão automática de textos
- Análise de tom (Profissional, Amigável, Acadêmico, Persuasivo)
- Sugestões de melhorias
- Múltiplos modelos do Gemini
- Gerenciamento de chave de API

**Documentação Detalhada:** Ver `docs/TEXT_REVIEWER_DOCUMENTATION.md`

---

## 🔧 Services

### TicketService

**Localização:** `src/app/services/ticket.ts`

**Responsabilidade:** Gerenciar CRUD de tickets.

**Métodos Principais:**

| Método | Descrição | Retorno |
|--------|-----------|---------|
| `getAllTickets()` | Lista todos os tickets | `Ticket[]` |
| `getTicketById(id)` | Busca ticket por ID | `Ticket \| undefined` |
| `createTicket(ticket)` | Cria novo ticket | `Ticket` |
| `updateTicket(id, updates)` | Atualiza ticket | `Ticket` |
| `deleteTicket(id)` | Remove ticket | `void` |
| `addComment(ticketId, comment)` | Adiciona comentário | `void` |
| `updateStatus(ticketId, status)` | Atualiza status | `void` |
| `updatePriority(ticketId, priority)` | Atualiza prioridade | `void` |

**Storage:**
- Chave: `'tasky_tickets'`
- Formato: Array de objetos `Ticket` em JSON

**Dados Padrão:**
- Sistema vem com ~10 tickets de exemplo pré-carregados
- Datas distribuídas nos últimos 7 dias

---

### AuthService

**Já documentado na seção [Autenticação e Autorização](#autenticação-e-autorização)**

---

### TextReviewerService

**Localização:** `src/app/services/text-reviewer.service.ts`

**Responsabilidade:** Integração com API do Google Gemini para revisão de texto.

**Métodos:**
- `validateKeyAndFetchModels()` - Valida chave e busca modelos
- `analyzeText(model, text, tone)` - Analisa texto

**Documentação Detalhada:** Ver `docs/TEXT_REVIEWER_DOCUMENTATION.md`

---

### GeminiApiKeyService

**Localização:** `src/app/services/gemini-api-key.service.ts`

**Responsabilidade:** Gerenciar chave da API do Gemini do usuário.

**Métodos:**
- `setApiKey(key)` - Salva chave
- `getApiKey()` - Retorna chave
- `hasApiKey()` - Verifica se existe
- `clearApiKey()` - Remove chave

**Storage:**
- Chave: `'gemini_api_key'`

---

### Outros Services

- **FluigService** (`services/fluig/fluig.service.ts`) - Integração com Fluig (se aplicável)
- **TicketAIService** (`services/ticket-ai.service.ts`) - IA para tickets
- **GeminiService** (`services/gemini/gemini.service.ts`) - Serviço base do Gemini

---

## 📋 Interfaces

### Ticket Interface

**Localização:** `src/app/interfaces/ticket.interface.ts`

```typescript
export interface Ticket {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: 'Alta' | 'Média' | 'Baixa';
  status: 'Aberto' | 'Em Andamento' | 'Aguardando' | 'Resolvido';
  categoria: 'Hardware' | 'Software' | 'Acesso' | 'Rede' | 'Outros';
  criadoPor: string;
  dataCriacao: string;
  dataAtualizacao: string;
  dataResolucao?: string;
  comentarios?: Comentario[];
  atribuidoA?: string;
  localizacao?: string;
  equipamento?: string;
  sla?: string;
  emailSolicitante?: string;
  telefoneSolicitante?: string;
  emailTecnico?: string;
  anexos?: Anexo[];
  historico?: HistoricoEvento[];
}

export interface Comentario {
  id: string;
  autor: string;
  texto: string;
  data: string;
}

export interface Anexo {
  id: string;
  nome: string;
  tamanho: string;
  data: string;
}

export interface HistoricoEvento {
  id: string;
  tipo: 'criacao' | 'atribuicao' | 'status' | 'prioridade' | 'comentario' | 'resolucao';
  autor: string;
  descricao: string;
  data: string;
}
```

### Text Reviewer Interfaces

**Localização:** `src/app/interfaces/text-reviewer.interface.ts`

```typescript
export interface ModelOption {
  name: string;
  displayName: string;
  isSafe?: boolean;
}

export interface AnalysisResult {
  correctedText: string;
  improvements: string[];
  toneAnalysis: string;
}
```

---

## 🛡️ Guards e Interceptors

### AuthGuard

**Já documentado na seção [Autenticação e Autorização](#autenticação-e-autorização)**

### GeminiKeyInterceptor

**Localização:** `src/app/interceptors/gemini/gemini-key.interceptor.ts`

**Responsabilidade:** Adicionar automaticamente a chave da API do Gemini em requisições HTTP.

**Funcionamento:**

1. Intercepta requisições HTTP
2. Verifica se a URL é da API do Gemini
3. Obtém chave (prioridade: usuário > environment)
4. Adiciona parâmetro `?key=...` se não existir
5. Passa requisição adiante

**Prioridade de Chave:**
1. Chave do usuário (`GeminiApiKeyService`)
2. Chave do environment (`APP_GEMINI_KEY`)
3. Sem chave (requisição falha na API)

**Registro:** `app.config.ts`

```typescript
{
  provide: HTTP_INTERCEPTORS,
  useClass: GeminiKeyInterceptor,
  multi: true
}
```

---

## ⚙️ Configuração

### App Config

**Arquivo:** `src/app/app.config.ts`

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: APP_BASE_HREF, useValue: '/portal/dev/tasky' },
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: GeminiKeyInterceptor,
      multi: true
    },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: NGX_ECHARTS_CONFIG,
      useValue: { echarts: () => import('echarts') }
    }
  ]
};
```

**Configurações:**
- **Base Href:** `/portal/dev/tasky` (para integração com Fluig)
- **HttpClient:** Configurado com interceptors
- **ECharts:** Configuração lazy loading

### Environment

**Arquivo:** `src/app/environment/environment.ts`

```typescript
export const environment = {
  APP_GEMINI_URL: 'https://generativelanguage.googleapis.com/v1beta',
  APP_GEMINI_KEY: 'AIzaSyDg3mYUEI6MO52C29I5U-P5dmZzc19Nd5w' // Fallback
};
```

---

## 🛣️ Rotas

**Arquivo:** `src/app/app.routes.ts`

| Rota | Componente | Guard | Descrição |
|------|------------|-------|-----------|
| `/login` | `LoginComponent` | ❌ | Tela de login |
| `/` | `ServiceDeskDashboardComponent` | ✅ | Dashboard (rota padrão) |
| `/dashboard` | `ServiceDeskDashboardComponent` | ✅ | Dashboard |
| `/tickets` | `TicketListComponent` | ✅ | Lista de tickets |
| `/tickets/create` | `CreateTicketComponent` | ✅ | Criar novo ticket |
| `/tickets/:id` | `TicketDetailComponent` | ✅ | Detalhes do ticket |
| `/kanban` | `KanbanBoardComponent` | ✅ | Board Kanban |
| `/text-reviewer` | `TextReviewerComponent` | ✅ | Revisor de texto |
| `/chat` | `TicketChatComponent` | ✅ | Chat de tickets |
| `/**` | - | - | Redireciona para `/dashboard` |

**Todas as rotas (exceto `/login`) são protegidas por `authGuard`.**

---

## 🎨 Layout Component

**Localização:** `src/app/components/layout/layout.component.ts`

**Responsabilidade:** Layout principal da aplicação com sidebar e header.

**Recursos:**
- **Sidebar:**
  - Menu de navegação
  - Responsivo (colapsa em mobile)
  - Links para todas as páginas principais
- **Header:**
  - Título do sistema
  - Informações do usuário
  - Botão de logout
- **Content Area:**
  - Área para conteúdo das páginas
  - Scroll independente
- **Floating Chat:**
  - Componente de chat flutuante
- **Mobile Navbar:**
  - Barra de navegação inferior para mobile

**Menu Items:**
- Dashboard (`/`)
- Tickets (`/tickets`)
- Kanban (`/kanban`)
- Revisor (`/text-reviewer`)

**Métodos:**
- `toggleSidebar()` - Abre/fecha sidebar
- `closeSidebar()` - Fecha sidebar
- `logout()` - Logout com confirmação (SweetAlert2)

---

## 🛠️ Tecnologias Utilizadas

### Core

- **Angular 19** - Framework principal
- **TypeScript 5.5** - Linguagem
- **RxJS 7.8** - Programação reativa

### UI/UX

- **Bootstrap 5.3.8** - Framework CSS
- **Bootstrap Icons 1.13.1** - Ícones
- **SweetAlert2 11.26.3** - Alertas e modais

### Visualização de Dados

- **ECharts 6.0.0** - Gráficos
- **ngx-echarts 19.0.0** - Wrapper Angular para ECharts

### Build & Development

- **Angular CLI 19** - Ferramentas de desenvolvimento
- **Vitest 4.0.8** - Testes
- **Prettier** - Formatação de código

### Integrações

- **Google Gemini API** - IA para revisão de texto
- **localStorage** - Persistência de dados

---

## 📊 Estrutura de Dados

### Tickets (localStorage)

**Chave:** `'tasky_tickets'`

**Formato:** Array JSON de objetos `Ticket`

**Exemplo:**

```json
[
  {
    "id": "1",
    "titulo": "Computador não liga",
    "descricao": "...",
    "prioridade": "Alta",
    "status": "Aberto",
    "categoria": "Hardware",
    "criadoPor": "João Silva",
    "dataCriacao": "2026-01-19 08:00",
    "dataAtualizacao": "2026-01-19 08:00"
  }
]
```

### Usuários (localStorage)

**Chave:** `'axis_users'`

**Formato:** Array JSON de usuários com senha

**Exemplo:**

```json
[
  {
    "id": "1",
    "email": "admin@axis.com",
    "senha": "admin123",
    "nome": "Administrador",
    "role": "admin"
  }
]
```

### Sessão (localStorage)

**Chave:** `'axis_user_session'`

**Formato:** Objeto JSON `User` (sem senha)

**Exemplo:**

```json
{
  "id": "1",
  "email": "admin@axis.com",
  "nome": "Administrador",
  "role": "admin"
}
```

### Chave Gemini (localStorage)

**Chave:** `'gemini_api_key'`

**Formato:** String (chave da API)

---

## 🔄 Fluxos Principais

### Fluxo de Login

```
1. Usuário acessa /login
   ↓
2. Preenche email e senha
   ↓
3. AuthService.login() valida credenciais
   ↓
4. Se válido: salva sessão no localStorage
   ↓
5. Redireciona para /dashboard
   ↓
6. AuthGuard permite acesso
```

### Fluxo de Criação de Ticket

```
1. Usuário clica "Novo Ticket"
   ↓
2. Navega para /tickets/create
   ↓
3. Preenche formulário
   ↓
4. Submete formulário
   ↓
5. TicketService.createTicket() salva
   ↓
6. Atualiza localStorage
   ↓
7. Redireciona para lista ou detalhes
```

### Fluxo de Atualização de Status (Kanban)

```
1. Usuário arrasta card no Kanban
   ↓
2. Component detecta mudança de coluna
   ↓
3. Mapeia coluna para status
   ↓
4. TicketService.updateStatus() atualiza
   ↓
5. Atualiza localStorage
   ↓
6. UI atualiza automaticamente
```

---

## 🚀 Build e Deploy

### Build para Produção

```bash
npm run build-fluig
```

**Configuração:**
- Base href: `/portal/dev/tasky`
- Output: `dist/tasky/`

### Desenvolvimento

```bash
npm start
```

**Servidor:** `http://localhost:4200`

### Watch Mode

```bash
npm run watch
```

---

## 📝 Notas de Desenvolvimento

### Padrões Utilizados

- **Standalone Components** - Todos os componentes são standalone
- **Signals** - Uso extensivo de signals para estado reativo
- **Dependency Injection** - `inject()` function
- **RxJS** - Observables para operações assíncronas
- **localStorage** - Persistência de dados (sem backend)

### Boas Práticas

- ✅ Proteção contra memory leaks (`takeUntil` pattern)
- ✅ Guards para rotas protegidas
- ✅ Interceptors para lógica HTTP centralizada
- ✅ Interfaces TypeScript para type safety
- ✅ Services para lógica de negócio
- ✅ Componentes reutilizáveis

### Limitações Atuais

- ⚠️ Dados apenas em localStorage (sem backend)
- ⚠️ Autenticação simples (sem JWT/refresh tokens)
- ⚠️ Sem validação de formulários avançada
- ⚠️ Sem testes unitários implementados
- ⚠️ Sem integração real com Fluig (apenas estrutura)

---

## 🔮 Melhorias Futuras

### Sugestões

1. **Backend Integration**
   - API REST para tickets
   - Autenticação JWT
   - Sincronização em tempo real

2. **Features**
   - Notificações push
   - Relatórios avançados
   - Exportação de dados
   - Upload de anexos

3. **Performance**
   - Lazy loading de módulos
   - Virtual scrolling para listas grandes
   - Cache de dados

4. **UX**
   - Dark mode
   - Temas customizáveis
   - Acessibilidade (ARIA)

---

## 📞 Suporte

Para dúvidas sobre o sistema:

1. Consulte esta documentação
2. Verifique os comentários no código
3. Analise os exemplos de uso nos componentes

---

**Última atualização:** Dezembro 2024  
**Versão do Sistema:** 0.0.0  
**Angular Version:** 19.0.0
