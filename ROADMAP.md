
# Oculus Roadmap

## Visão de Product Owner + Tech Lead

### Situação atual

- A estrutura de UI do projeto está montada: abas, layout, cards, formulários e animações estão consistentes.
- `MarketExploration` funciona como fluxo de pesquisa: CEP → cache → criação de `search` → disparo n8n → leitura de status.
- O backend já faz `criarBusca()` com `idempotency_key`, `dispararN8N()` envia `search_id + idempotency_key` e `aguardarConclusao()` monitora `searches` em tempo real.
- `buscarNoCache()` já está ordenado por `created_at desc` para pegar o último scan.
- `CEPs Scaneados` já carrega histórico e agrupa o CEP mais recente por endereço.
- `DigitalAudit`, `AutomationEngine`, `SavedSearches` e `HistoryPanel` têm UI pronta, mas ainda não estão totalmente integrados ao fluxo de dados real.

### O que está funcionando bem

- Entrada de CEP, validação básica e navegação entre `Novo Scan` e `CEPs Scaneados`.
- Criação de registro de busca no Supabase com `status: pending` e `idempotency_key` nativo.
- Envio do payload para n8n com `search_id` e `idempotency_key`.
- Detecção de conclusão via update em `searches.status` com realtime/poll.
- Cache corretor por CEP+raio, priorizando o registro mais recente.
- SavedSearches e HistoryPanel agora consomem histórico real do Supabase.
- Reset do formulário para novo scan após envio assíncrono.

### Problemas críticos observados

- O sistema não “vê que terminou” se o n8n não atualizar `searches.status` para um valor final (`done`, `carregado`, `loaded`).
- `Respond to Webhook` sozinho não é suficiente; o backend depende da tabela `searches` para reconhecer o fim.
- Existem fluxos de status no frontend que usam timers artificiais (`handlePendingStatusFlow`) e podem mascarar erros reais.
- `SavedSearches` e `HistoryPanel` ainda não retornam dados reais do Supabase, então o produto está parcial.
- Falta controle de usuário / autenticação e documentação clara do setup de ambiente.
- A persistência em `sessionStorage` precisa ser revisada para não restaurar estado inválido após refresh.

### O que precisa ser feito agora

- Garantir que o workflow n8n atualize corretamente `searches.status` e, se possível, armazene `status_message` ou `message`.
- Remover lógica de espera artificial no frontend e basear o `statusMsg` em eventos reais de backend.
- Validar o schema da tabela `searches` e confirmar que `idempotency_key` realmente existe e recebe valor.
- Conectar `SavedSearches`, `HistoryPanel` e qualquer dashboard de auditoria ao Supabase/histórico real.
- Documentar e testar o setup das variáveis de ambiente:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_KEY`
  - `VITE_N8N_WEBHOOK`
- Reinforçar o fluxo de scan para que o usuário veja claramente:
  - scan enviado
  - resultado carregado
  - scan novo pronto para usar

### Sprint imediato

1. Ajustar o workflow n8n para escrever o status final no registro `searches`.
2. Normalizar os valores finais aceitos pelo frontend: `done`, `carregado`, `loaded`.
3. Eliminar status temporários do frontend e usar somente `statusMsg` real do backend.
4. Fazer `SavedSearches` e `HistoryPanel` consumirem dados reais do Supabase.
5. Documentar o fluxo de scan no `README` e o que o ambiente precisa para rodar.

### Backlog de melhoria estratégica

- Autenticação de usuário e multi-tenancy.
- CRUD completo de buscas salvas e histórico de scans.
- Agendamento de varreduras e notificações (e-mail/SMS/WhatsApp).
- Exportação de relatórios em PDF/CSV.
- Integrações com Google Business, Google Ads, Instagram e Facebook.
- Dashboard de heatmap por região e score de presença digital.
- Monitoramento de conectores n8n e health checks automáticos.
- Versão mobile-first/PWA.

---

> O produto já tem a fundação certa. O próximo passo é deixar o fluxo de dados confiável: fixar a conclusão do n8n, eliminar esperas artificiais e fazer com que os componentes de histórico e buscas salvas sejam realmente operacionais.
