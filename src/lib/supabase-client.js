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

const FINAL_STATUSES = ['done', 'carregado', 'loaded'];
const ERROR_STATUS = 'error';

function normalizeStatus(value) {
  return String(value ?? '').toLowerCase();
}

function getStatusMessage(search) {
  return search?.status_message || search?.message || null;
}

function handleSearchStatus(search, onStatus) {
  const status = normalizeStatus(search?.status);
  const message = getStatusMessage(search);

  if (message) {
    onStatus?.(message);
    return;
  }

  if (status === 'pending') onStatus?.('Busca pendente...');
  if (status === 'processing') onStatus?.('Processando dados...');
  if (status === 'carregado' || status === 'loaded') onStatus?.('Carregado');
  if (status === 'done') onStatus?.('Concluído!');
}

async function fetchSearch(searchId) {
  const { data, error } = await supabase
    .from('searches')
    .select('*')
    .eq('id', searchId)
    .single();

  if (error) return null;
  return data;
}

function monitorSearchStatus(searchId, onStatus) {
  let finished = false;
  const cleanup = () => {
    clearTimeout(timeout);
    clearInterval(poll);
    if (channel) supabase.removeChannel(channel);
  };

  const tryStatus = async () => {
    const data = await fetchSearch(searchId);
    if (!data || finished) return;

    const status = normalizeStatus(data.status);
    handleSearchStatus(data, onStatus);

    if (FINAL_STATUSES.includes(status) || status === ERROR_STATUS) {
      finished = true;
      cleanup();
    }
  };

  const channel = supabase
    .channel(`search-monitor-${searchId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'searches', filter: `id=eq.${searchId}` },
      (payload) => {
        if (finished) return;
        const data = payload.new;
        const status = normalizeStatus(data.status);
        handleSearchStatus(data, onStatus);
        if (FINAL_STATUSES.includes(status) || status === ERROR_STATUS) {
          finished = true;
          cleanup();
        }
      }
    )
    .subscribe();

  const poll = setInterval(() => {
    if (finished) return;
    tryStatus();
  }, 5000);

  const timeout = setTimeout(() => {
    if (finished) return;
    finished = true;
    cleanup();
  }, 180_000);

  tryStatus();

  return cleanup;
}

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
    const normalizedCacheStatus = normalizeStatus(cached.status);

    if (FINAL_STATUSES.includes(normalizedCacheStatus)) {
      status('Dados encontrados no cache!');
      const leads = await buscarLeadsPorSearch(cached.id);
      return { search: cached, leads, fromCache: true };
    }

    if (normalizedCacheStatus === 'pending' || normalizedCacheStatus === 'processing') {
      status('Busca anterior em andamento, aguardando resultado...');
      if (!waitForCompletion) {
        monitorSearchStatus(cached.id, status);
        return { search: cached, leads: [], fromCache: true };
      }
      const searchFinalizada = await aguardarConclusao(cached.id, status);
      const leads = await buscarLeadsPorSearch(cached.id);
      return { search: searchFinalizada, leads, fromCache: true };
    }

    if (normalizedCacheStatus === ERROR_STATUS) {
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
    monitorSearchStatus(search.id, status);
    return { search, leads: [], fromCache: false };
  }

  // 3. Aguarda n8n terminar via Realtime
  status('Aguardando resultados...');
  const searchFinalizada = await aguardarConclusao(search.id, status);

  // 4. Busca os leads que o n8n salvou
  const leads = await buscarLeadsPorSearch(search.id);
  const finalStatus = String(searchFinalizada.status ?? '').toLowerCase();
  status(finalStatus === 'carregado' || finalStatus === 'loaded' ? 'Carregado' : 'Concluído!');

  return { search: searchFinalizada, leads, fromCache: false };
}

// ------------------------------------------------------------
// Aguarda o n8n atualizar status via Realtime
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
      const data = await fetchSearch(searchId);
      if (!data || finished) return;

      const normalizedStatus = normalizeStatus(data.status);
      handleSearchStatus(data, onStatus);

      if (FINAL_STATUSES.includes(normalizedStatus)) {
        finished = true;
        cleanup();
        resolve(data);
      }

      if (normalizedStatus === ERROR_STATUS) {
        finished = true;
        cleanup();
        reject(new Error(getStatusMessage(data) || 'O n8n reportou um erro ao processar.'));
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
          const data = payload.new;
          const normalizedStatus = normalizeStatus(data.status);
          handleSearchStatus(data, onStatus);
          if (FINAL_STATUSES.includes(normalizedStatus)) {
            finished = true;
            cleanup();
            resolve(data);
          }
          if (normalizedStatus === ERROR_STATUS) {
            finished = true;
            cleanup();
            reject(new Error(getStatusMessage(data) || 'O n8n reportou um erro ao processar.'));
          }
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
  const idempotency_key =
    typeof crypto?.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

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
export async function buscarHistorico(limit = 10, statuses = ['done']) {
  let query = supabase
    .from('searches')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (Array.isArray(statuses) && statuses.length > 0) {
    query = query.in('status', statuses);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Erro ao buscar histórico: ${error.message}`);
  return data ?? [];
}