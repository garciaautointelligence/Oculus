// ============================================================
// supabase-client.js
// Integração Supabase + n8n para o Projeto Óculos
// ============================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const N8N_WEBHOOK  = import.meta.env.VITE_N8N_WEBHOOK;

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

// ------------------------------------------------------------
// Função principal — chame esta no frontend
// Retorna { search, leads } independente de ser cache ou novo
// ------------------------------------------------------------
export async function buscarLeads(cep, raioKm, onStatus) {
  const raio = parseFloat(raioKm);

  // Callback opcional para mostrar status na UI
  const status = (msg) => onStatus && onStatus(msg);

  // 1. Verifica se já existe no Supabase
  status('Verificando cache...');
  const cached = await buscarNoCache(cep, raio);

  if (cached && cached.status === 'done') {
    status('Dados encontrados no cache!');
    const leads = await buscarLeadsPorSearch(cached.id);
    return { search: cached, leads, fromCache: true };
  }

  // 2. Não existe ou ainda processando — cria registro e dispara n8n
  status('Iniciando análise via n8n...');

  // Cria registro de busca no Supabase com status "processing"
  const search = await criarBusca(cep, raio);

  // Dispara o n8n e aguarda resposta
  const leadsData = await dispararN8N(cep, raio, search.id);

  // 3. Salva leads retornados pelo n8n
  status('Salvando resultados...');
  const leads = await salvarLeads(search.id, leadsData);

  // 4. Atualiza status da busca para "done"
  await finalizarBusca(search.id, leads.length);
  status('Concluído!');

  const searchAtualizada = { ...search, status: 'done', total_leads: leads.length };
  return { search: searchAtualizada, leads, fromCache: false };
}

// ------------------------------------------------------------
// Verifica se CEP + raio já existe no banco
// ------------------------------------------------------------
async function buscarNoCache(cep, raioKm) {
  const params = new URLSearchParams({
    cep: `eq.${cep}`,
    raio_km: `eq.${raioKm}`,
    limit: 1,
  });

  const res = await fetch(`${SUPABASE_URL}/rest/v1/searches?${params}`, { headers });
  const data = await res.json();
  return data.length > 0 ? data[0] : null;
}

// ------------------------------------------------------------
// Busca os leads de uma search específica
// ------------------------------------------------------------
async function buscarLeadsPorSearch(searchId) {
  const params = new URLSearchParams({
    search_id: `eq.${searchId}`,
    order: 'score.desc',
  });

  const res = await fetch(`${SUPABASE_URL}/rest/v1/leads?${params}`, { headers });
  return await res.json();
}

// ------------------------------------------------------------
// Cria registro de busca com status "processing"
// Usa upsert para evitar duplicata em caso de race condition
// ------------------------------------------------------------
async function criarBusca(cep, raioKm) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/searches`, {
    method: 'POST',
    headers: {
      ...headers,
      'Prefer': 'return=representation,resolution=merge-duplicates',
    },
    body: JSON.stringify({
      cep,
      raio_km: raioKm,
      status: 'processing',
    }),
  });

  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

// ------------------------------------------------------------
// Dispara o webhook do n8n e aguarda os leads
// ------------------------------------------------------------
async function dispararN8N(cep, raioKm, searchId) {
  const res = await fetch(N8N_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cep, raio_km: raioKm, search_id: searchId }),
  });

  if (!res.ok) throw new Error(`n8n retornou erro: ${res.status}`);
  return await res.json(); // array de leads
}

// ------------------------------------------------------------
// Salva todos os leads no Supabase (bulk insert)
// ------------------------------------------------------------
async function salvarLeads(searchId, leads) {
  if (!leads || leads.length === 0) return [];

  const payload = leads.map(lead => ({
    search_id: searchId,
    nome: lead.nome,
    categoria: lead.categoria,
    telefone: lead.telefone ?? null,
    site: lead.site ?? null,
    instagram: lead.instagram ?? null,
    facebook: lead.facebook ?? null,
    email: lead.email ?? null,
    endereco: lead.endereco ?? null,
    score: lead.score ?? 0,
    nivel: lead.nivel ?? 'frio',
    tem_presenca_digital: lead.tem_presenca_digital ?? false,
    lat: lead.lat ?? null,
    lon: lead.lon ?? null,
  }));

  const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=representation' },
    body: JSON.stringify(payload),
  });

  return await res.json();
}

// ------------------------------------------------------------
// Atualiza busca para "done" com total de leads
// ------------------------------------------------------------
async function finalizarBusca(searchId, totalLeads) {
  await fetch(`${SUPABASE_URL}/rest/v1/searches?id=eq.${searchId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      status: 'done',
      total_leads: totalLeads,
      completed_at: new Date().toISOString(),
    }),
  });
}

// ------------------------------------------------------------
// Busca histórico de pesquisas anteriores (para o dashboard)
// ------------------------------------------------------------
export async function buscarHistorico() {
  const params = new URLSearchParams({
    status: 'eq.done',
    order: 'created_at.desc',
    limit: 10,
  });

  const res = await fetch(`${SUPABASE_URL}/rest/v1/searches?${params}`, { headers });
  return await res.json();
}