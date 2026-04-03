
# Oculus Roadmap

## Visão de Product Owner + Tech Lead

### Situação atual

- A estrutura de UI do projeto está montada: abas, layout, cards, formulários e animações estão consistentes.
- `MarketExploration` funciona como fluxo de pesquisa: CEP → cache → criação de `search` → disparo n8n → leitura de status.
- O backend já faz `criarBusca()` com `idempotency_key`, `dispararN8N()` envia `search_id + idempotency_key` e `aguardarConclusao()` monitora `searches` em tempo real.
- `buscarNoCache()` já está ordenado por `created_at desc` para pegar o último scan.
- `CEPs Scaneados` já carrega histórico e agrupa o CEP mais recente por endereço.
- `DigitalAudit`, `AutomationEngine`, `SavedSearches` e `HistoryPanel` têm UI pronta, e `SavedSearches` e `HistoryPanel` estão totalmente integrados ao fluxo de dados real do Supabase.

### O que está funcionando bem

- Entrada de CEP, validação básica e navegação entre `Novo Scan` e `CEPs Scaneados`.
- Criação de registro de busca no Supabase com `status: pending` e `idempotency_key` nativo.
- Envio do payload para n8n com `search_id` e `idempotency_key`.
- Detecção de conclusão via update em `searches.status` com realtime/poll.
- Cache corretor por CEP+raio, priorizando o registro mais recente.
- SavedSearches e HistoryPanel agora consomem histórico real do Supabase.
- Reset do formulário para novo scan após envio assíncrono.
- Status messages baseados em eventos reais do backend, sem timers artificiais.

### Problemas críticos observados

- O sistema depende da atualização correta de `searches.status` pelo n8n; se não atualizar para valores finais (`done`, `carregado`, `loaded`), o frontend pode não reconhecer a conclusão.
- Falta controle de usuário / autenticação e documentação mais detalhada do setup de ambiente e fluxo de dados.
- A persistência em `sessionStorage` pode restaurar estado inválido após refresh; precisa de validação.

### O que precisa ser feito agora

- Validar e testar o workflow n8n para garantir atualização consistente de `searches.status` e campos como `status_message`.
- Implementar autenticação básica de usuário para multi-tenancy.
- Melhorar documentação no README: incluir descrição do fluxo de scan, schema da tabela `searches`, e troubleshooting.
- Adicionar validação de estado restaurado do sessionStorage para evitar dados obsoletos.
- Expandir auditoria digital com métricas detalhadas (engajamento, SEO, etc.) baseadas em dados reais.

### Sprint imediato

1. Testar e ajustar o workflow n8n para status finais consistentes.
2. Adicionar autenticação JWT básica.
3. Expandir README com seções de arquitetura, API, e exemplos de uso.
4. Implementar validação de cache/sessionStorage.
5. Integrar métricas detalhadas na auditoria digital (engajamento, SEO, etc.).

### Backlog de melhoria estratégica

- CRUD completo de buscas salvas e histórico de scans.
- Agendamento de varreduras e notificações (e-mail/SMS/WhatsApp).
- Exportação de relatórios em PDF/CSV.
- Integrações com Google Business, Google Ads, Instagram e Facebook.
- Dashboard de heatmap por região e score de presença digital.
- Monitoramento de conectores n8n e health checks automáticos.
- Versão mobile-first/PWA.
- Testes automatizados (unitários e E2E).

---

> O produto evoluiu bem: os componentes de histórico estão operacionais. Próximos passos focam em robustez do backend, autenticação, e expansão de funcionalidades integradas.
