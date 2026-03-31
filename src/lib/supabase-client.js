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
export async function buscarLeads(cep, raioKm, onStatus) {
  const raio = parseFloat(raioKm);
  const status = (msg) => onStatus?.(msg);

  // 1. Verifica cache — CEP + raio já processados antes?
  status('Verificando cache...');
  const cached = await buscarNoCache(cep, raio);

  if (cached?.status === 'done') {
    status('Dados encontrados no cache!');
    const leads = await buscarLeadsPorSearch(cached.id);
    return { search: cached, leads, fromCache: true };
  }

  // 2. Cria registro com status "pending" e dispara n8n
  status('Criando busca...');
  const search = await criarBusca(cep, raio);

  // Fire-and-forget — n8n processa e salva tudo sozinho
  status('Análise iniciada...');
  dispararN8N(cep, raio, search.id).catch(console.error);

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
    const timeout = setTimeout(() => {
      supabase.removeChannel(channel);
      reject(new Error('Timeout: o n8n demorou mais de 90 segundos.'));
    }, 90_000);

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
        (payload) => {
          const { status } = payload.new;

          if (status === 'processing') {
            onStatus?.('Processando dados...');
          }

          if (status === 'done') {
            clearTimeout(timeout);
            supabase.removeChannel(channel);
            resolve(payload.new);
          }

          if (status === 'error') {
            clearTimeout(timeout);
            supabase.removeChannel(channel);
            reject(new Error('O n8n reportou um erro ao processar.'));
          }
        }
      )
      .subscribe();
  });
}

// ------------------------------------------------------------
// Dispara o webhook do n8n — sem esperar a resposta
// O n8n salva tudo no Supabase por conta própria
// ------------------------------------------------------------
async function dispararN8N(cep, raioKm, searchId) {
  const res = await fetch(N8N_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cep, raio: raioKm, search_id: searchId }),
  });

  if (!res.ok) throw new Error(`n8n retornou erro: ${res.status}`);
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
// Busca os leads de uma search (já salvos pelo n8n)
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