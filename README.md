# Oculus - Market Analysis App

Aplicativo de análise de mercado e presença digital com interface moderna e premium. A integração de dados é realizada via n8n (webhook) e utiliza Supabase como backend para armazenamento e gerenciamento de dados.

## ✨ Funcionalidades

- **🏠 Dashboard Executivo**: Visão geral com métricas e insights em tempo real
- **🔍 Exploração de Mercado**: Pesquisa inteligente de leads por CEP e raio, com cache otimizado
- **📊 Auditoria Digital**: Avaliação completa da presença digital com checklist contextual
- **📚 Histórico de Buscas**: Interface organizada para visualizar buscas salvas e histórico
- **🤖 Automação de Processos**: Ferramentas avançadas para automação de tarefas
- **🌓 Tema Claro/Escuro**: Suporte completo para ambos os temas com alta acessibilidade
- **📱 Design Responsivo**: Experiência otimizada para desktop, tablet e mobile

## 🎨 Design System

### Tema e Cores
- **Light Mode**: Paleta clara com alto contraste para leitura prolongada
- **Dark Mode**: Tema escuro premium com gradientes sutis e iluminação adequada
- **Tokens Consistentes**: Sistema de cores, tipografia e espaçamentos padronizados
- **Acessibilidade**: Contraste WCAG AA+ em todos os componentes

### Componentes
- **Cards**: Bordas arredondadas, sombras suaves, hover elegante
- **Botões**: Estados visuais claros (hover, focus, active, disabled)
- **Inputs**: Campos com foco acessível e validação visual
- **Navegação**: Sidebar responsiva com overlay mobile
- **Microinterações**: Animações sutis para feedback visual

### Tipografia
- **Headline**: Manrope (sans-serif moderna)
- **Body**: Inter (legibilidade otimizada)
- **Hierarquia**: Tamanhos e pesos consistentes para clareza visual

## 🏗️ Arquitetura

O projeto é dividido em frontend (React/Vite) e backend (n8n + Supabase).

### Fluxo de Scan
1. Usuário insere CEP e raio na interface intuitiva
2. Frontend cria registro de busca no Supabase com status `pending`
3. Dispara webhook para n8n com `search_id` e `idempotency_key`
4. n8n processa os dados e atualiza o status no Supabase
5. Frontend monitora em tempo real e exibe resultados com animações suaves

### Schema da Tabela `searches`
- `id`: UUID primário
- `cep`: String (CEP da busca)
- `raio_km`: Número (raio em km)
- `status`: String (pending, processing, done, etc.)
- `status_message`: String opcional
- `total_leads`: Número opcional
- `created_at`: Timestamp
- `completed_at`: Timestamp opcional
- `idempotency_key`: String único

## 🚀 Executar Localmente

**Pré-requisitos:** Node.js 18+

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar ambiente:**
   ```bash
   cp .env.example .env.local
   # Edite .env.local com as variáveis necessárias
   ```

3. **Executar desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Build para produção:**
   ```bash
   npm run build
   npm run preview
   ```

## 🛠️ Desenvolvimento

### Tecnologias
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (dados) + n8n (automação)
- **Estilos**: Tailwind CSS + CSS customizado
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **Design**: Material Design principles + customizações

### Estrutura do Projeto
```
src/
├── components/          # Componentes reutilizáveis
│   ├── Layout.tsx      # Sidebar e TopBar responsivos
│   ├── Dashboard.tsx   # Painel principal
│   ├── DigitalAudit.tsx # Auditoria com mapa e checklist
│   └── ...
├── lib/                # Utilitários
│   ├── utils.ts        # Funções helper
│   └── supabase-client.js
├── App.tsx             # App principal com roteamento
├── main.tsx            # Entry point
└── index.css           # Estilos globais e design system
```

### Design System Tokens
Definidos em `index.css`:
- Cores primárias/secundárias/terciárias
- Superfícies e containers
- Estados semânticos (sucesso, erro, alerta)
- Bordas, radius, sombras
- Tipografia e espaçamentos

## 🔧 Troubleshooting

### Problemas Comuns
- **Status não atualizando**: Verifique workflow n8n e permissões Supabase
- **Cache não carregando**: Confirme priorização de registros por CEP+raio
- **Tema não alternando**: Verifique localStorage e classe `dark` no html
- **Responsividade quebrada**: Teste breakpoints e overflow

### Debug
- Use React DevTools para estado dos componentes
- Verifique console para erros de API
- Teste acessibilidade com Lighthouse

## 📋 Roadmap

Consulte o [ROADMAP.md](ROADMAP.md) para funcionalidades planejadas e melhorias em andamento.

### Melhorias Recentes
- ✅ Refatoração completa de UX/UI
- ✅ Implementação de tema claro/escuro
- ✅ Design responsivo e acessível
- ✅ Otimização de performance
- ✅ Microinterações e animações

### Próximas Features
- 🔄 Integração com Google My Business API
- 🔄 Dashboard com gráficos avançados
- 🔄 Notificações push
- 🔄 Export de relatórios PDF
- 🔄 Multi-idioma (i18n)

---

## 3. Documentação Completa

### 3.1 Arquitetura Detalhada
- **Frontend**: React + TypeScript + Vite.
  - `App.tsx`: estado global de tema, aba ativa, layout principal.
  - `components/`: cada tela em componente desacoplado (Dashboard, MarketExploration, DigitalAudit, etc.).
  - `lib/supabase-client.js`: wrapper de acesso ao Supabase.
  - `index.css`: design tokens, temas e componentes globais.
- **Backend**: Supabase (Postgres) + n8n para processamento assíncrono de scans.
  - **Tabela principal**: `searches` (CEP, raio, status, resultados, timestamps).
  - **Fluxo**: UI -> Supabase create pending -> n8n webhook -> update status/result -> UI refetch.

### 3.2 Guia de Setup
1. Clone o repositório:
   ```bash
   git clone https://github.com/<empresa>/Oculus.git
   cd Oculus
   ```
2. Instale dependências:
   ```bash
   npm install
   ```
3. Configure variáveis em `.env.local` (base em `.env.example`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_KEY`
   - `N8N_WEBHOOK_URL`
4. Execute em modo dev:
   ```bash
   npm run dev
   ```
5. Build e preview:
   ```bash
   npm run build
   npm run preview
   ```

### 3.3 Troubleshooting
- **`npm` não encontrado**: instale Node.js 18+ e adicione ao PATH.
- **Erro no tailwind**: limpe cache e reinicie dev server:
  ```bash
  rm -rf node_modules/.cache
  npm run dev
  ```
- **Tema não alterna**: confirme se `html` tem classe `dark`, e se `localStorage` está guardando `theme`.
- **Falha de CORS ou webhook**: ajuste regras no n8n e Supabase (Policies e CORS permitidos).
- **Timeout no scan**: aumente timeout no n8n ou divida processo em passos menores.

### 3.4 Documentação de API Endpoints
> Observação: os endpoints podem estar no n8n (webhook) ou Supabase REST.

#### 3.4.1 **GET** `/api/searches` (Supabase)
- Retorna histórico de buscas do usuário.
- Query params: `cep`, `status`, `limit`, `offset`.

#### 3.4.2 **POST** `/api/searches` (Supabase + n8n)
- Cria nova busca e dispara workflow.
- Payload:
  - `cep` (string)
  - `raio_km` (number)
  - `idempotency_key` (string)
- Resposta: `{id, status, created_at}`.

#### 3.4.3 **PATCH** `/api/searches/:id` (n8n worker)
- Atualiza status/resultados após processamento.
- Payload:
  - `status`: `pending|processing|done|failed`
  - `status_message` (opcional)
  - `total_leads`, `completed_at`, `result_data`.

#### 3.4.4 **POST** `/api/scan/retry` (frontend)
- Reenvia scan anterior (código front) para reprocessamento via `idempotency_key`.


> Dica: use Postman ou Insomnia com collection para testes rápidos e regressivos.

