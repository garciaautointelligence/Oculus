<div align="center">
<img width="1200" height="475" alt="Oculus Banner" src="https://media.licdn.com/dms/image/v2/D4D22AQGLmatWANysdw/feedshare-shrink_2048_1536/B4DZ1OEDmFKMAk-/0/1775131179775?e=1776902400&v=beta&t=-4qhs1DwIF6W1cKTwgVVeH1zgLpeAM_tEcSdf_HQtBs" />
</div>

# Oculus - Market Analysis App

Aplicativo de análise de mercado e presença digital. A integração de dados é realizada via n8n (webhook) e utiliza Supabase como backend para armazenamento e gerenciamento de dados.

## Funcionalidades

- **Análise de Mercado**: Pesquisa de leads por CEP e raio, com cache inteligente.
- **Histórico de Buscas**: Visualização de buscas salvas e histórico completo.
- **Auditoria Digital**: Avaliação da presença digital de empresas.
- **Automação de Processos**: Ferramentas para automação de tarefas relacionadas ao mercado.

## Arquitetura

O projeto é dividido em frontend (React/Vite) e backend (n8n + Supabase).

### Fluxo de Scan
1. Usuário insere CEP e raio.
2. Frontend cria registro de busca no Supabase com status `pending`.
3. Dispara webhook para n8n com `search_id` e `idempotency_key`.
4. n8n processa os dados e atualiza o status no Supabase para `done`, `carregado` ou `loaded`.
5. Frontend monitora o status em tempo real e exibe os resultados.

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

## Executar Localmente

**Pré-requisitos:** Node.js

1. Instalar dependências:
   ```
   npm install
   ```
2. Criar um arquivo `.env.local` com as variáveis de ambiente necessárias (consulte a documentação interna para obter os valores).
3. Executar o aplicativo:
   ```
   npm run dev
   ```

## Desenvolvimento

- **Frontend**: React com TypeScript, Vite para build.
- **Backend**: Supabase para dados, n8n para automação.
- **Estilos**: CSS customizado com Material Design principles.

## Troubleshooting

- **Problemas com status**: Verifique se o workflow n8n está atualizando corretamente o campo `status` na tabela `searches`.
- **Cache não carregando**: Certifique-se de que o registro mais recente por CEP+raio está sendo priorizado.
- **Env vars**: Todas as variáveis de ambiente devem estar definidas no `.env.local`.

## Roadmap

Consulte o [ROADMAP.md](ROADMAP.md) para futuras melhorias e funcionalidades planejadas.
