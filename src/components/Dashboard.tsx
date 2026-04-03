import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  MapPin,
  Store,
  Download as DownloadIcon,
  Calendar,
  Filter,
  ExternalLink,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import { buscarHistorico } from '../lib/supabase-client'; // ← ajuste o path se necessário

type Search = {
  id: string;
  cep: string;
  raio_km: number;
  status: string;
  total_leads: number;
  created_at: string;
  completed_at: string | null;
};

const PAGE_SIZE = 10;

export const Dashboard: React.FC = () => {
  const [searches, setSearches] = useState<Search[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [liveKpis, setLiveKpis] = useState({
    activeScans: 0,
    averageLeads: 0,
    successRate: 0,
    lastUpdated: new Date().toLocaleTimeString()
  });

  const handleReloadSearch = (search: Search, forceReload: boolean = false) => 
    sessionStorage.setItem('reload_search', JSON.stringify({
      cep: search.cep,
      radius: search.raio_km.toString(),
      forceReload
    }));
    alert(`Busca preparada para ${forceReload ? 'atualizar' : 'recarregar'}. Vá para a aba "Explorar Mercado" para visualizar.`);
  };

  useEffect(() => {
    buscarHistorico(50)
      .then(setSearches)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searches.length === 0) {
      setLiveKpis(prev => ({ ...prev, activeScans: 0, averageLeads: 0, successRate: 0, lastUpdated: new Date().toLocaleTimeString() }));
      return;
    }

    const activeScans = searches.filter(s => ['pending', 'processing'].includes(s.status?.toLowerCase())).length;
    const finished = searches.filter(s => ['done', 'carregado'].includes(s.status?.toLowerCase()));
    const averageLeads = finished.length > 0
      ? Number((finished.reduce((sum, item) => sum + (item.total_leads ?? 0), 0) / finished.length).toFixed(1))
      : 0;
    const successRate = searches.length > 0
      ? Math.round((finished.length / searches.length) * 100)
      : 0;

    setLiveKpis({ activeScans, averageLeads, successRate, lastUpdated: new Date().toLocaleTimeString() });
  }, [searches]);

  const totalBuscas = searches.length;
  const cepsUnicos = new Set(searches.map(s => s.cep)).size;
  const mediaLeads = totalBuscas > 0
    ? (searches.reduce((sum, s) => sum + (s.total_leads ?? 0), 0) / totalBuscas).toFixed(1)
    : '0';

  // Dados para o gráfico — últimas 8 buscas
  const chartData = searches.slice(0, 8).reverse().map(s => ({ value: s.total_leads ?? 0 }));

  // Paginação
  const totalPages = Math.ceil(searches.length / PAGE_SIZE);
  const paginated = searches.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const formatCep = (cep: string) =>
    cep.length === 8 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : cep;

  return (
    <div className="space-y-12">
      <section>
        <div className="mb-2">
          <span className="text-tertiary font-bold text-xs tracking-widest uppercase">Relatórios Passados</span>
          <h3 className="text-4xl font-headline font-extrabold text-on-surface mt-1">Histórico de Buscas</h3>
        </div>
        <p className="text-on-surface-variant max-w-2xl">
          Visualize e gerencie todas as suas consultas de mercado anteriores. Analise tendências temporais e recupere dados estratégicos instantaneamente.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-surface-container-high p-5 rounded-xl border-l-2 border-tertiary card-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-on-surface-variant text-xs font-bold uppercase">Total de Buscas</span>
              <BarChart3 className="w-4 h-4 text-tertiary" />
            </div>
            <div className="text-2xl font-headline font-bold">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-on-surface-variant" /> : totalBuscas.toLocaleString('pt-BR')}
            </div>
          </div>
          <div className="bg-surface-container-high p-5 rounded-xl card-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-on-surface-variant text-xs font-bold uppercase">Scans Ativos</span>
              <TrendingUp className="w-4 h-4 text-secondary" />
            </div>
            <div className="text-2xl font-headline font-bold">
              {liveKpis.activeScans}
            </div>
            <p className="text-xs text-on-surface-variant mt-1">Atualizado em {liveKpis.lastUpdated}</p>
          </div>
          <div className="bg-surface-container-high p-5 rounded-xl card-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-on-surface-variant text-xs font-bold uppercase">Média de Leads</span>
              <Store className="w-4 h-4 text-secondary" />
            </div>
            <div className="text-2xl font-headline font-bold">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-on-surface-variant" /> : liveKpis.averageLeads}
            </div>
          </div>
          <div className="bg-surface-container-high p-5 rounded-xl card-soft py-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-on-surface-variant text-xs font-bold uppercase">Taxa de Sucesso</span>
              <Filter className="w-4 h-4 text-secondary" />
            </div>
            <div className="text-2xl font-headline font-bold text-primary">
              {liveKpis.successRate}%
            </div>
            <p className="text-xs text-on-surface-variant mt-1">Base: últimos 50 registros</p>
          </div>
          <div className="bg-surface-container-high p-5 rounded-xl card-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-on-surface-variant text-xs font-bold uppercase">CEPs Únicos</span>
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-headline font-bold">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-on-surface-variant" /> : cepsUnicos}
            </div>
          </div>
          <div className="bg-surface-container-high p-5 rounded-xl card-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-on-surface-variant text-xs font-bold uppercase">Média de Leads</span>
              <Store className="w-4 h-4 text-secondary" />
            </div>
            <div className="text-2xl font-headline font-bold">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-on-surface-variant" /> : mediaLeads}
            </div>
          </div>
          <button className="bg-surface-container-high p-5 rounded-xl border border-dashed border-outline-variant/40 flex flex-col items-center justify-center gap-2 text-primary hover:bg-surface-container-highest transition-colors">
            <DownloadIcon className="w-5 h-5" />
            <span className="text-xs font-bold uppercase">Exportar Tudo</span>
          </button>
        </div>
      </section>

      <section className="bg-surface-container rounded-2xl overflow-hidden shadow-2xl shadow-primary/5 card-soft gradient-panel">
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 bg-surface-container-high rounded-xl p-4 border border-outline-variant/10">
            <h4 className="text-base font-bold text-on-surface mb-2">Agendamento de Varreduras</h4>
            <p className="text-sm text-on-surface-variant mb-3">Configure scans periódicos automáticos para manter a base sempre atualizada.</p>
            <form className="grid grid-cols-1 sm:grid-cols-3 gap-2" onSubmit={(e) => { e.preventDefault(); alert('Agendamento gravado para '+(e.target as any).elements.cep.value); }}>
              <input type="text" name="cep" placeholder="CEP" className="input-field" required />
              <select name="interval" className="input-field" defaultValue="daily">
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
              <button className="btn-primary w-full" type="submit">Salvar</button>
            </form>
          </div>

          <div className="md:col-span-2 bg-surface-container-high rounded-xl p-4 border border-outline-variant/10">
            <h4 className="text-base font-bold text-on-surface mb-2">Exportar Relatórios</h4>
            <p className="text-sm text-on-surface-variant mb-3">Baixe relatórios em PDF ou CSV com marca visual profissional.</p>
            <div className="flex gap-2">
              <button className="btn-secondary">Exportar PDF</button>
              <button className="btn-secondary">Exportar CSV</button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 bg-surface-container-low/50">
          <div className="flex gap-4">
            <button className="bg-surface-container-highest px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-outline-variant/20">
              <Calendar className="w-4 h-4" />
              Todas as buscas
            </button>
          </div>
          <div className="text-sm text-on-surface-variant">
            {loading ? 'Carregando...' : `Exibindo ${paginated.length} de ${totalBuscas} registros`}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-lowest/50 border-b border-outline-variant/10">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Data da Consulta</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">CEP Pesquisado</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Raio</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Leads</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-5">
                      <div className="h-4 bg-surface-container-high rounded animate-pulse w-full" />
                    </td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant text-sm">
                    Nenhuma busca encontrada. Inicie uma varredura na aba Explorar.
                  </td>
                </tr>
              ) : (
                paginated.map((row) => {
                  const { date, time } = formatDate(row.created_at);
                  const maxLeads = Math.max(...searches.map(s => s.total_leads ?? 0), 1);
                  const progress = Math.round(((row.total_leads ?? 0) / maxLeads) * 100);

                  return (
                    <tr key={row.id} className="hover:bg-surface-bright/20 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-on-surface font-medium text-sm">{date}</span>
                          <span className="text-xs text-on-surface-variant">{time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="font-mono text-sm text-on-surface">{formatCep(row.cep)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm">{row.raio_km} km</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-tertiary">{row.total_leads ?? 0}</span>
                          <div className="w-12 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                            <div className="bg-tertiary h-full" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleReloadSearch(row, false)}
                            className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary rounded-lg transition-all"
                            title="Recarregar busca (usar cache)"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleReloadSearch(row, true)}
                            className="p-2 bg-tertiary/10 text-tertiary hover:bg-tertiary hover:text-on-tertiary rounded-lg transition-all"
                            title="Atualizar base (forçar recarga)"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="p-6 bg-surface-container-lowest/30 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-40"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                    i === page
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-2 rounded-lg bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-40"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-container-high rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
          <h4 className="text-lg font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-tertiary" />
            Tendência de Volume
          </h4>
          <div className="h-40 w-full bg-surface-container flex items-end justify-between p-4 rounded-xl gap-2">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === chartData.length - 1 ? '#44ddc1' : '#bbc3ff'}
                        fillOpacity={index === chartData.length - 1 ? 1 : 0.4}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-on-surface-variant">
                Nenhum dado ainda
              </div>
            )}
          </div>
          <p className="text-xs text-on-surface-variant mt-4">
            Baseado nas últimas {Math.min(8, chartData.length)} buscas realizadas.
          </p>
        </div>

        <div className="bg-surface-container-high rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-headline font-bold text-on-surface mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Resumo
            </h4>
            <p className="text-sm text-on-surface-variant">
              {totalBuscas > 0
                ? `Você já realizou ${totalBuscas} ${totalBuscas === 1 ? 'busca' : 'buscas'} cobrindo ${cepsUnicos} ${cepsUnicos === 1 ? 'CEP único' : 'CEPs únicos'}, com média de ${mediaLeads} leads por varredura.`
                : 'Nenhuma busca realizada ainda. Vá para Explorar e inicie sua primeira varredura.'}
            </p>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="flex-1 py-3 bg-surface-bright rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-highest transition-colors">
              Ver Relatórios Salvos
            </button>
            <button className="flex-1 py-3 bg-tertiary/10 text-tertiary rounded-xl text-sm font-bold hover:bg-tertiary/20 transition-colors">
              Agendar Relatório
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};