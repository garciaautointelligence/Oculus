
# Oculus Roadmap

## Visão de Product Owner + Tech Lead

### O que está funcionando bem

- Navegação de abas sólida e consistente entre as telas principais.
- `dark mode` persistente funcionando com `localStorage`.
- Animações suaves com `framer-motion` nas transições de páginas.
- Dashboard com leitura de histórico do Supabase e visualização de métricas básicas.
- Fluxo de `MarketExploration` com entrada de CEP, verificação de cache, leitura de resultados e estado de carregamento.
- Integração com `viacep.com.br` para enriquecer CEPs com localização.
- Lógica de busca de leads com Supabase (`buscarLeads`, `buscarLeadsPorCep`, `buscarHistorico`).
- UI de `DigitalAudit`, `AutomationEngine`, `SavedSearches` e `HistoryPanel` com visual coerente e estrutura de conteúdo.
- Utilitário `cn` com `clsx` + `tailwind-merge` mantém estilos Tailwind previsíveis.

### O que precisa ser feito agora

- Converter `SavedSearches` e `HistoryPanel` de protótipos estáticos para dados reais.
- Revisar se os dados de `DigitalAudit` e `AutomationEngine` devem ser dinâmicos ou se vão seguir como dashboards de visão.
- Validar e documentar o setup obrigatório de variáveis de ambiente:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_KEY`
  - `VITE_N8N_WEBHOOK`
- Garantir que o webhook n8n esteja disponível e que o timeout de 180s seja adequado.
- Remover dependências não usadas do projeto (já identificado e limpo em `package.json`).
- Adicionar tratamento de erro mais robusto para todos os fluxos de rede.
- Implementar roteamento real (`React Router`) para permitir deep links e refresh sem perder o estado.
- Criar uma camada de serviço / contexto para centralizar dados e evitar duplicação entre componentes.
- Melhorar responsividade e layout mobile, especialmente para a sidebar e tabelas.
- Adicionar testes unitários para componentes e integração de dados.

## Riscos técnicos e atenção imediata

- `MarketExploration` depende de `buscarLeads` e do backend Supabase + n8n; se a infraestrutura falhar, a interface cai.
- `SavedSearches` e `HistoryPanel` estão apenas com mock data, o produto parece funcional mas não está totalmente conectado.
- O estado do CEP scan usa `sessionStorage` e fluxos distintos; precisamos validar o comportamento em vários cenários de uso.
- A aplicação ainda não possui autenticação nem controle de usuário, o que limita o rollout em produção.

## Backlog de funcionalidades estratégicas

- Autenticação de usuário / permissões / multi-tenant.
- Salvar buscas com CRUD real e abrir buscas salvas diretamente.
- Agenda automática de varreduras e alertas por e-mail/WhatsApp.
- Exportação de relatórios em PDF e CSV.
- Integração com Google Business, Instagram, Facebook, Google Ads e outras fontes de dados.
- Dashboard de regiões com mapa interativo e heatmap de oportunidades.
- Score de presença digital por segmento e comparação com benchmarks.
- Painel de configuração de conectores n8n e health checks automáticos.
- Modo mobile-first com navegação adaptativa e PWA.
- Assistente de recomendações inteligentes para ações de marketing.

## Próximo ciclo de entregas (sprint imediato)

1. Confirmar infra e env vars.
2. Transformar `SavedSearches` e `HistoryPanel` em dados reais.
3. Implementar roteamento com deep links.
4. Adicionar testes básicos de UI e integração de dados.
5. Documentar o setup de desenvolvimento no `README`.

---

> O produto já tem a base visual e a arquitetura de tela. Agora o foco deve ser estabilizar os dados reais, fechar a integração Supabase/n8n e transformar protótipos em funcionalidades operacionais.
