# 📚 Documentação - Revisor de Texto com Gemini

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Componentes](#componentes)
4. [Fluxo de Funcionamento](#fluxo-de-funcionamento)
5. [Configuração](#configuração)
6. [Uso](#uso)
7. [API Reference](#api-reference)

---

## 🎯 Visão Geral

O **Revisor de Texto com Gemini** é uma aplicação Angular que utiliza a API do Google Gemini para revisar e melhorar textos automaticamente. O sistema oferece:

- ✅ Revisão automática de textos
- ✅ Análise de tom (Profissional, Amigável, Acadêmico, Persuasivo)
- ✅ Sugestões de melhorias
- ✅ Múltiplos modelos do Gemini (Free e Pro)
- ✅ Gerenciamento automático de chave de API
- ✅ Persistência de configurações no navegador

---

## 🏗️ Arquitetura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                    TextReviewerComponent                     │
│  (UI - Gerencia estado e interação do usuário)              │
└──────────────┬──────────────────────────────────────────────┘
               │
               ├──► GeminiApiKeyService
               │    (Gerencia chave da API - localStorage)
               │
               └──► TextReviewerService
                    (Lógica de negócio - chamadas HTTP)
                          │
                          ▼
                    HttpClient
                          │
                          ▼
              ┌───────────────────────┐
              │ GeminiKeyInterceptor  │
              │ (Adiciona ?key=...)   │
              └───────────────────────┘
                          │
                          ▼
                    API Gemini
```

### Fluxo de Dados

```
Usuario → Component → Service → HttpClient → Interceptor → API Gemini
                                                              ↓
Usuario ← Component ← Service ← HttpClient ← Interceptor ← Response
```

---

## 🧩 Componentes

### 1. **GeminiApiKeyService**

**Localização:** `src/app/services/gemini-api-key.service.ts`

**Responsabilidade:** Gerenciar a chave da API do usuário com persistência no localStorage.

**Métodos:**

| Método | Descrição | Retorno |
|--------|-----------|---------|
| `setApiKey(key: string)` | Salva a chave no signal e localStorage | `void` |
| `getApiKey()` | Retorna a chave atual | `string` |
| `hasApiKey()` | Verifica se existe chave configurada | `boolean` |
| `clearApiKey()` | Remove a chave (limpa signal e localStorage) | `void` |

**Exemplo de uso:**

```typescript
const apiKeyService = inject(GeminiApiKeyService);

// Salvar chave
apiKeyService.setApiKey('AIzaSy...');

// Obter chave
const key = apiKeyService.getApiKey();

// Verificar se existe
if (apiKeyService.hasApiKey()) {
  // Fazer algo
}

// Limpar chave
apiKeyService.clearApiKey();
```

**Storage:**
- Chave do localStorage: `'gemini_api_key'`
- Persiste entre sessões do navegador

---

### 2. **GeminiKeyInterceptor**

**Localização:** `src/app/interceptors/gemini/gemini-key.interceptor.ts`

**Responsabilidade:** Interceptar requisições HTTP para a API do Gemini e adicionar automaticamente o parâmetro `key`.

**Lógica de Prioridade:**

1. **Chave do usuário** (`GeminiApiKeyService`) - Prioridade máxima
2. **Chave do environment** (`environment.APP_GEMINI_KEY`) - Fallback
3. **Sem chave** - Requisição passa sem chave (vai dar erro na API)

**Como funciona:**

```typescript
intercept(req: HttpRequest<any>, next: HttpHandler) {
  // 1. Verifica se é requisição para API Gemini
  if (!req.url.includes(environment.APP_GEMINI_URL)) {
    return next.handle(req); // Não intercepta outras requisições
  }

  // 2. Obtém chave (prioridade: usuário > environment)
  const apiKey = this.apiKeyService.getApiKey() || environment.APP_GEMINI_KEY;

  // 3. Se não houver chave, passa sem adicionar
  if (!apiKey) {
    return next.handle(req);
  }

  // 4. Adiciona parâmetro key se não existir
  let params = req.params || new HttpParams();
  if (!params.has('key')) {
    params = params.set('key', apiKey);
  }

  // 5. Clona requisição com novo parâmetro
  const authReq = req.clone({ params });
  return next.handle(authReq);
}
```

**Registro:**

O interceptor está registrado em `src/app/app.config.ts`:

```typescript
{
  provide: HTTP_INTERCEPTORS,
  useClass: GeminiKeyInterceptor,
  multi: true
}
```

---

### 3. **TextReviewerService**

**Localização:** `src/app/services/text-reviewer.service.ts`

**Responsabilidade:** Lógica de negócio para interagir com a API do Gemini.

**Métodos:**

#### `validateKeyAndFetchModels(): Observable<ModelOption[]>`

Valida a chave da API e busca modelos disponíveis.

**Fluxo:**
1. Faz GET para `/models`
2. Filtra modelos que suportam `generateContent`
3. Classifica modelos (Free/Pro/Unknown)
4. Ordena (Flash primeiro)
5. Retorna lista de modelos

**Exemplo:**

```typescript
this.textReviewerService.validateKeyAndFetchModels()
  .subscribe({
    next: (models) => {
      console.log('Modelos disponíveis:', models);
    },
    error: (err) => {
      console.error('Erro:', err.message);
    }
  });
```

#### `analyzeText(modelName: string, text: string, tone: string): Observable<AnalysisResult>`

Analisa o texto usando o modelo selecionado.

**Parâmetros:**
- `modelName`: Nome do modelo (ex: `'models/gemini-1.5-flash'`)
- `text`: Texto a ser analisado
- `tone`: Tom desejado (`'profissional'`, `'amigavel'`, `'academico'`, `'persuasivo'`)

**Retorno:**

```typescript
interface AnalysisResult {
  correctedText: string;      // Texto corrigido
  improvements: string[];     // Lista de melhorias
  toneAnalysis: string;        // Análise do tom
}
```

**Exemplo:**

```typescript
this.textReviewerService.analyzeText(
  'models/gemini-1.5-flash',
  'Este é um texto para revisar',
  'profissional'
).subscribe({
  next: (result) => {
    console.log('Texto corrigido:', result.correctedText);
    console.log('Melhorias:', result.improvements);
    console.log('Tom:', result.toneAnalysis);
  },
  error: (err) => {
    if (err.message === 'QUOTA_EXCEEDED') {
      console.error('Cota excedida!');
    }
  }
});
```

**Tratamento de Erros:**

- `QUOTA_EXCEEDED`: Cota da API excedida
- Outros erros: Mensagem da API do Gemini

---

### 4. **TextReviewerComponent**

**Localização:** `src/app/pages/text-reviewer/text-reviewer.component.ts`

**Responsabilidade:** Interface do usuário e gerenciamento de estado.

**Estados (Signals):**

| Signal | Tipo | Descrição |
|--------|------|-----------|
| `inputText` | `string` | Texto digitado pelo usuário |
| `loading` | `boolean` | Estado de carregamento |
| `result` | `AnalysisResult \| null` | Resultado da análise |
| `error` | `string` | Mensagem de erro |
| `tone` | `string` | Tom selecionado |
| `availableModels` | `ModelOption[]` | Lista de modelos disponíveis |
| `selectedModel` | `string` | Modelo selecionado |
| `keyValidated` | `boolean` | Se a chave foi validada |
| `apiKeyInput` | `string` | Valor do input de chave |
| `showApiKeyInput` | `boolean` | Mostrar/esconder input de chave |

**Métodos Principais:**

| Método | Descrição |
|--------|-----------|
| `ngOnInit()` | Carrega chave salva e valida automaticamente |
| `saveApiKey()` | Salva chave e valida |
| `changeApiKey()` | Mostra input para alterar chave |
| `clearApiKey()` | Remove chave salva |
| `validateKeyAndFetchModels()` | Valida chave e busca modelos |
| `analyzeText()` | Analisa texto digitado |
| `copyToClipboard(text)` | Copia texto para clipboard |

**Lifecycle:**

```typescript
ngOnInit() {
  // 1. Carrega chave do localStorage
  const savedKey = this.apiKeyService.getApiKey();
  
  if (savedKey) {
    // 2. Se existe, valida automaticamente
    this.apiKeyInput.set(savedKey);
    this.validateKeyAndFetchModels();
  } else {
    // 3. Se não existe, mostra input
    this.showApiKeyInput.set(true);
  }
}

ngOnDestroy() {
  // Limpa subscriptions para evitar memory leaks
  this.destroy$.next();
  this.destroy$.complete();
}
```

**Proteção contra Memory Leaks:**

Todas as subscriptions usam `takeUntil(this.destroy$)`:

```typescript
this.service.method()
  .pipe(
    takeUntil(this.destroy$),
    finalize(() => this.loading.set(false))
  )
  .subscribe({ ... });
```

---

## 🔄 Fluxo de Funcionamento

### Cenário 1: Primeira Vez (Sem Chave Salva)

```
1. Usuário acessa /text-reviewer
   ↓
2. ngOnInit() verifica localStorage
   ↓
3. Não encontra chave → showApiKeyInput = true
   ↓
4. Usuário vê card de input de chave
   ↓
5. Usuário insere chave e clica "Salvar e Validar"
   ↓
6. saveApiKey() salva no GeminiApiKeyService
   ↓
7. Salva no localStorage
   ↓
8. Chama validateKeyAndFetchModels()
   ↓
9. Interceptor adiciona ?key=... automaticamente
   ↓
10. Service valida e busca modelos
   ↓
11. Se sucesso: keyValidated = true, showApiKeyInput = false
   ↓
12. Interface principal é exibida
```

### Cenário 2: Usuário com Chave Salva

```
1. Usuário acessa /text-reviewer
   ↓
2. ngOnInit() carrega chave do localStorage
   ↓
3. Chave encontrada → chama validateKeyAndFetchModels()
   ↓
4. Interceptor adiciona ?key=... automaticamente
   ↓
5. Service valida e busca modelos
   ↓
6. Se sucesso: keyValidated = true
   ↓
7. Interface principal é exibida (sem mostrar input)
```

### Cenário 3: Análise de Texto

```
1. Usuário digita texto no textarea
   ↓
2. Seleciona tom (profissional, amigável, etc.)
   ↓
3. Seleciona modelo (se houver múltiplos)
   ↓
4. Clica "Revisar Agora"
   ↓
5. analyzeText() é chamado
   ↓
6. loading = true
   ↓
7. Service faz POST para API Gemini
   ↓
8. Interceptor adiciona ?key=... automaticamente
   ↓
9. API retorna resultado
   ↓
10. Resultado é parseado (JSON)
   ↓
11. result.set(data)
   ↓
12. loading = false
   ↓
13. Interface exibe resultado
```

---

## ⚙️ Configuração

### Environment

**Arquivo:** `src/app/environment/environment.ts`

```typescript
export const environment = {
  APP_GEMINI_URL: 'https://generativelanguage.googleapis.com/v1beta',
  APP_GEMINI_KEY: 'AIzaSyDg3mYUEI6MO52C29I5U-P5dmZzc19Nd5w' // Fallback
};
```

**Nota:** A chave do environment é usada apenas como fallback se o usuário não tiver configurado uma chave própria.

### Registro do Interceptor

**Arquivo:** `src/app/app.config.ts`

```typescript
import { GeminiKeyInterceptor } from './interceptors/gemini/gemini-key.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... outros providers
    {
      provide: HTTP_INTERCEPTORS,
      useClass: GeminiKeyInterceptor,
      multi: true
    }
  ]
};
```

### Rota

**Arquivo:** `src/app/app.routes.ts`

```typescript
{ path: 'text-reviewer', component: TextReviewerComponent }
```

---

## 📖 Uso

### Para o Usuário Final

1. **Acesse a página:** `/text-reviewer`

2. **Primeira vez:**
   - Você verá um card solicitando a chave da API
   - Obtenha sua chave em: https://makersuite.google.com/app/apikey
   - Cole a chave e clique em "Salvar e Validar"
   - A chave será salva no navegador

3. **Usar o revisor:**
   - Digite ou cole o texto no campo "Texto Original"
   - Selecione o tom desejado (Profissional, Amigável, Acadêmico, Persuasivo)
   - Selecione o modelo (recomendado: modelos marcados com "(Free)")
   - Clique em "Revisar Agora"
   - Aguarde o processamento
   - Veja o resultado corrigido, análise de tom e melhorias

4. **Alterar chave:**
   - Clique em "Alterar" no alerta de sucesso
   - Ou limpe o localStorage do navegador

### Para Desenvolvedores

#### Adicionar novo tom

Edite `text-reviewer.component.html`:

```html
<select [value]="tone()" (change)="updateTone($event)">
  <option value="profissional">Profissional</option>
  <option value="amigavel">Amigável</option>
  <option value="academico">Acadêmico</option>
  <option value="persuasivo">Persuasivo</option>
  <option value="novo_tom">Novo Tom</option> <!-- Adicione aqui -->
</select>
```

#### Modificar prompt

Edite `text-reviewer.service.ts`:

```typescript
const prompt = `
  Atue como um revisor de texto profissional.
  Tom desejado: ${tone}.
  Texto: "${text}"
  Retorne JSON: { "correctedText": "...", "improvements": ["..."], "toneAnalysis": "..." }
`;
```

#### Adicionar novo modelo padrão

Edite `text-reviewer.component.ts`:

```typescript
defaultModels: ModelOption[] = [
  { name: 'models/gemini-1.5-flash', displayName: '(Free) Gemini 1.5 Flash' },
  // Adicione novos modelos aqui
];
```

---

## 📚 API Reference

### Interfaces

#### `ModelOption`

```typescript
interface ModelOption {
  name: string;           // Nome técnico do modelo
  displayName: string;    // Nome para exibição
  isSafe?: boolean;      // Se é seguro para plano gratuito
}
```

#### `AnalysisResult`

```typescript
interface AnalysisResult {
  correctedText: string;      // Texto corrigido
  improvements: string[];     // Lista de melhorias sugeridas
  toneAnalysis: string;       // Análise do tom do texto
}
```

### Endpoints da API Gemini

#### GET `/models`

Lista modelos disponíveis.

**Query Params:**
- `key`: Chave da API (adicionado pelo interceptor)

**Response:**
```json
{
  "models": [
    {
      "name": "models/gemini-1.5-flash",
      "displayName": "Gemini 1.5 Flash",
      "supportedGenerationMethods": ["generateContent"]
    }
  ]
}
```

#### POST `/models/{modelId}:generateContent`

Gera conteúdo usando o modelo.

**Query Params:**
- `key`: Chave da API (adicionado pelo interceptor)

**Body:**
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Prompt aqui..."
        }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Resposta da IA..."
          }
        ]
      }
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Problema: "Erro ao validar chave"

**Causas possíveis:**
- Chave inválida ou expirada
- Sem conexão com internet
- API do Gemini indisponível

**Solução:**
1. Verifique se a chave está correta
2. Obtenha uma nova chave em https://makersuite.google.com/app/apikey
3. Limpe o localStorage e tente novamente

### Problema: "QUOTA_EXCEEDED"

**Causa:** Cota da API excedida.

**Solução:**
- Use modelos marcados com "(Free)" (Flash)
- Evite modelos "(Pro)" no plano gratuito
- Aguarde alguns minutos antes de tentar novamente

### Problema: Chave não está sendo salva

**Causa:** localStorage bloqueado ou navegador em modo privado.

**Solução:**
- Verifique se o navegador permite localStorage
- Tente em modo normal (não privado)
- Verifique console do navegador para erros

### Problema: Interceptor não está funcionando

**Verificações:**
1. Interceptor está registrado em `app.config.ts`?
2. A URL da requisição contém `APP_GEMINI_URL`?
3. `GeminiApiKeyService` está retornando a chave corretamente?

---

## 🔒 Segurança

### Boas Práticas Implementadas

✅ **Chave armazenada localmente** - Não é enviada para servidor externo
✅ **HTTPS obrigatório** - API do Gemini requer HTTPS
✅ **Validação de entrada** - Textos são validados antes de enviar
✅ **Tratamento de erros** - Erros são capturados e exibidos ao usuário

### Avisos

⚠️ **Chave no código:** A chave do `environment.ts` está visível no código. Use apenas como fallback.

⚠️ **localStorage:** A chave do usuário é armazenada em texto plano no localStorage. Considere criptografia para produção.

⚠️ **CORS:** Requisições são feitas diretamente do navegador. Certifique-se de que a API permite CORS.

---

## 📝 Changelog

### Versão Atual

- ✅ Interceptor HTTP para adicionar chave automaticamente
- ✅ Gerenciamento de chave com localStorage
- ✅ Validação automática ao carregar página
- ✅ Múltiplos modelos do Gemini
- ✅ Proteção contra memory leaks
- ✅ Tratamento de erros robusto
- ✅ UI responsiva com Bootstrap

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique esta documentação
2. Consulte os logs do console do navegador
3. Verifique a documentação oficial da API Gemini: https://ai.google.dev/docs

---

**Última atualização:** Dezembro 2024
