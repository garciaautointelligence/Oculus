// ============================================================
// supabase-client.js
// Projeto Óculos — integração Supabase + n8n
// Arquitetura: site cria a search → n8n processa e salva tudo
// ============================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY; // anon key
const N8N_WEBHOOK  = import.meta.env.VITE_N8N_WEBHOOK;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ------------------------------------------------------------
// Função principal — chame esta no frontend
// onStatus(msg) — callback opcional para mostrar progresso na UI
// Retorna { search, leads, fromCache }
// ------------------------------------------------------------
export async function buscarLeads(cep, raioKm, onStatus, options = { forceReload: false }) {
  const raio = parseFloat(raioKm);
  const status = (msg) => onStatus?.(msg);
  const { forceReload } = options;

  // 1. Verifica cache — CEP + raio já processados antes?
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

  // 2. Cria registro com status "pending" e dispara n8n
  status('Criando busca...');
  const search = await criarBusca(cep, raio);

  // Dispara n8n e usa a mensagem de retorno para atualizar a UI imediatamente
  status('Análise iniciada...');
  const payload = await dispararN8N(cep, raio, search.id);
  if (payload?.message) status(payload.message);

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
// Timeout de 90s — rejeita a Promise se demorar demais
// ------------------------------------------------------------
function aguardarConclusao(searchId, onStatus) {
  return new Promise((resolve, reject) => {
    let finished = false;

    const cleanup = () => {
      clearTimeout(timeout);
      clearInterval(poll);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };

    const tryResolve = async () => {
      const { data, error } = await supabase
        .from('searches')
        .select('*')
        .eq('id', searchId)
        .single();

      if (error) {
        return;
      }

      if (!data) {
        return;
      }

      const { status } = data;

      const normalizedStatus = String(status ?? '').toLowerCase();

      if (normalizedStatus === 'pending') {
        onStatus?.('Busca pendente...');
      }

      if (normalizedStatus === 'processing' || normalizedStatus === 'in_progress') {
        onStatus?.('Processando dados...');
      }

      if (normalizedStatus === 'done' || normalizedStatus === 'completed' || normalizedStatus === 'success') {
        finished = true;
        cleanup();
        resolve(data);
      }

      if (normalizedStatus === 'error' || normalizedStatus === 'failed') {
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
    }, 180_000); // 180s para permitir latência de n8n mais alta

    const channel = supabase
      .channel('search-' + searchId)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'searches',
          filter: `id=eq.${searchId}`,
        },
        async (payload) => {
          if (finished) return;

          const { status } = payload.new;

          if (status === 'processing') {
            onStatus?.('Processando dados...');
          }

          if (status === 'done') {
            finished = true;
            cleanup();
            resolve(payload.new);
          }

          if (status === 'error') {
            finished = true;
            cleanup();
            reject(new Error('O n8n reportou um erro ao processar.'));
          }
        }
      )
      .subscribe();

    const poll = setInterval(async () => {
      if (finished) return;
      await tryResolve();
    }, 5000);

    // Checagem inicial caso n8n já tenha terminado antes da inscrição real-time
    tryResolve();
  });
}

// ------------------------------------------------------------
// Dispara o webhook do n8n e retorna o payload JSON
// ------------------------------------------------------------
async function dispararN8N(cep, raioKm, searchId) {
  const res = await fetch(N8N_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cep, raio: raioKm, search_id: searchId }),
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMessage = payload?.message || `n8n retornou erro: ${res.status}`;
    throw new Error(errorMessage);
  }

  if (payload?.success === false) {
    throw new Error(payload?.message || 'n8n retornou success=false');
  }

  return payload;
}

// ------------------------------------------------------------
// Verifica se CEP + raio já foram processados antes
// ------------------------------------------------------------
async function buscarNoCache(cep, raioKm) {
  const { data } = await supabase
    .from('searches')
    .select('*')
    .eq('cep', cep)
    .eq('raio_km', raioKm)
    .limit(1);

  return data?.[0] ?? null;
}

export async function verificarCache(cep, raioKm) {
  return buscarNoCache(cep, raioKm);
}

// ------------------------------------------------------------
// Cria registro de busca com status "pending"
// ------------------------------------------------------------
async function criarBusca(cep, raioKm) {
  const { data, error } = await supabase
    .from('searches')
    .insert({ cep, raio_km: raioKm, status: 'pending' })
    .select('*')
    .single();

  if (error) throw new Error(`Erro ao criar busca: ${error.message}`);
  return data;
}

// ------------------------------------------------------------
// Busca leads por CEP e raio (join entre searches e leads)
// ------------------------------------------------------------
export async function buscarLeadsPorCep(cep, raioKm, page = 1, limit = 9) {
  // Primeiro encontra o search_id
  const { data: searchData, error: searchError } = await supabase
    .from('searches')
    .select('id')
    .eq('cep', cep)
    .eq('raio_km', raioKm)
    .eq('status', 'done')
    .order('created_at', { ascending: false })
    .limit(1);

  if (searchError) throw new Error(`Erro ao buscar search: ${searchError.message}`);
  if (!searchData || searchData.length === 0) {
    return { leads: [], total: 0, hasMore: false };
  }

  const searchId = searchData[0].id;

  // Busca leads com paginação
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
  const hasMore = total > (page * limit);

  return { 
    leads: leadsData ?? [], 
    total, 
    hasMore,
    currentPage: page,
    totalPages: Math.ceil(total / limit)
  };
}

// ------------------------------------------------------------
// Histórico de buscas anteriores (para o dashboard)
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