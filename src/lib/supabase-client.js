// ============================================================
// supabase-client.js
// Projeto Óculos — integração Supabase + n8n
// Arquitetura: frontend cria search → n8n só atualiza
// ============================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const N8N_WEBHOOK  = import.meta.env.VITE_N8N_WEBHOOK;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ------------------------------------------------------------
// Função principal
// ------------------------------------------------------------
export async function buscarLeads(cep, raioKm, onStatus, options = { forceReload: false, waitForCompletion: true }) {
  const raio = parseFloat(raioKm);
  const status = (msg) => onStatus?.(msg);
  const { forceReload, waitForCompletion = true } = options;

  // 1. Verifica cache
  status('Verificando cache...');
  const cached = await buscarNoCache(cep, raio);

  if (cached && !forceReload) {
    if (cached.status === 'done') {
      status('Dados encontrados no cache!');
      const leads = await buscarLeadsPorSearch(cached.id);
      return { search: cached, leads, fromCache: true };
    }

    if (cached.status === 'pending' || cached.status === 'processing') {
      status('Busca anterior em andamento, aguardando conclusão...');
      const searchFinalizada = await aguardarConclusao(cached.id, status);
      const leads = await buscarLeadsPorSearch(cached.id);
      return { search: searchFinalizada, leads, fromCache: true };
    }

    if (cached.status === 'error') {
      status('Busca anterior falhou, iniciando nova busca...');
    }
  }

  // 2. Frontend cria o registro com idempotency_key — n8n só atualiza
  status('Criando busca...');
  const search = await criarBusca(cep, raio);

  status('Análise iniciada...');
  const payload = await dispararN8N(cep, raio, search);
  if (payload?.message) status(payload.message);

  if (!waitForCompletion) {
    return { search, leads: [], fromCache: false };
  }

  // 3. Aguarda n8n terminar via Realtime
  status('Aguardando resultados...');
  const searchFinalizada = await aguardarConclusao(search.id, status);

  // 4. Busca os leads que o n8n salvou
  const leads = await buscarLeadsPorSearch(search.id);
  status('Concluído!');

  return { search: searchFinalizada, leads, fromCache: false };
}

// ------------------------------------------------------------
// Aguarda o n8n atualizar status para "done" via Realtime
// ------------------------------------------------------------
function aguardarConclusao(searchId, onStatus) {
  return new Promise((resolve, reject) => {
    let finished = false;

    const cleanup = () => {
      clearTimeout(timeout);
      clearInterval(poll);
      if (channel) supabase.removeChannel(channel);
    };

    const tryResolve = async () => {
      const { data, error } = await supabase
        .from('searches')
        .select('*')
        .eq('id', searchId)
        .single();

      if (error || !data) return;

      const normalizedStatus = String(data.status ?? '').toLowerCase();

      if (normalizedStatus === 'pending') onStatus?.('Busca pendente...');
      if (normalizedStatus === 'processing') onStatus?.('Processando dados...');

      if (normalizedStatus === 'done') {
        finished = true;
        cleanup();
        resolve(data);
      }

      if (normalizedStatus === 'error') {
        finished = true;
        cleanup();
        reject(new Error('O n8n reportou um erro ao processar.'));
      }
    };

    const timeout = setTimeout(async () => {
      if (finished) return;
      await tryResolve();
      if (!finished) {
        cleanup();
        reject(new Error('Timeout: o n8n demorou mais de 180 segundos.'));
      }
    }, 180_000);

    const channel = supabase
      .channel('search-' + searchId)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'searches', filter: `id=eq.${searchId}` },
        async (payload) => {
          if (finished) return;
          const { status } = payload.new;
          if (status === 'processing') onStatus?.('Processando dados...');
          if (status === 'done') { finished = true; cleanup(); resolve(payload.new); }
          if (status === 'error') { finished = true; cleanup(); reject(new Error('O n8n reportou um erro ao processar.')); }
        }
      )
      .subscribe();

    const poll = setInterval(async () => {
      if (finished) return;
      await tryResolve();
    }, 5000);

    tryResolve();
  });
}

// ------------------------------------------------------------
// Dispara o webhook — passa search completo (id + idempotency_key)
// ------------------------------------------------------------
async function dispararN8N(cep, raioKm, search) {
  const res = await fetch(N8N_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cep,
      raio: raioKm,
      search_id: search.id,
      idempotency_key: search.idempotency_key,
    }),
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(payload?.message || `n8n retornou erro: ${res.status}`);
  }

  if (payload?.success === false) {
    throw new Error(payload?.message || 'n8n retornou success=false');
  }

  return payload;
}

// ------------------------------------------------------------
// Cria registro no Supabase com idempotency_key único
// ------------------------------------------------------------
async function criarBusca(cep, raioKm) {
  const idempotency_key = crypto.randomUUID(); // nativo no browser, sem dependências

  const { data, error } = await supabase
    .from('searches')
    .insert({ cep, raio_km: raioKm, status: 'pending', idempotency_key })
    .select('*')
    .single();

  if (error) throw new Error(`Erro ao criar busca: ${error.message}`);
  return data; // contém id + idempotency_key
}

// ------------------------------------------------------------
// Verifica cache — CEP + raio já processados?
// ------------------------------------------------------------
async function buscarNoCache(cep, raioKm) {
  const { data } = await supabase
    .from('searches')
    .select('*')
    .eq('cep', cep)
    .eq('raio_km', raioKm)
    .order('created_at', { ascending: false })
    .limit(1);

  return data?.[0] ?? null;
}

export async function verificarCache(cep, raioKm) {
  return buscarNoCache(cep, raioKm);
}

// ------------------------------------------------------------
// Busca leads por search_id
// ------------------------------------------------------------
async function buscarLeadsPorSearch(searchId) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('search_id', searchId)
    .order('score', { ascending: false });

  if (error) throw new Error(`Erro ao buscar leads: ${error.message}`);
  return data ?? [];
}

// ------------------------------------------------------------
// Busca leads por CEP e raio com paginação
// ------------------------------------------------------------
export async function buscarLeadsPorCep(cep, raioKm, page = 1, limit = 9) {
  const { data: searchData, error: searchError } = await supabase
    .from('searches')
    .select('id')
    .eq('cep', cep)
    .eq('raio_km', raioKm)
    .eq('status', 'done')
    .order('created_at', { ascending: false })
    .limit(1);

  if (searchError) throw new Error(`Erro ao buscar search: ${searchError.message}`);
  if (!searchData || searchData.length === 0) return { leads: [], total: 0, hasMore: false };

  const searchId = searchData[0].id;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: leadsData, error: leadsError, count } = await supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .eq('search_id', searchId)
    .order('score', { ascending: false })
    .range(from, to);

  if (leadsError) throw new Error(`Erro ao buscar leads: ${leadsError.message}`);

  const total = count || 0;
  return {
    leads: leadsData ?? [],
    total,
    hasMore: total > page * limit,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
  };
}

// ------------------------------------------------------------
// Histórico de buscas anteriores
// ------------------------------------------------------------
export async function buscarHistorico(limit = 10) {
  const { data, error } = await supabase
    .from('searches')
    .select('*')
    .eq('status', 'done')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Erro ao buscar histórico: ${error.message}`);
  return data ?? [];
}