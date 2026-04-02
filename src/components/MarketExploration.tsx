import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Compass,
  Target,
  ArrowRight,
  TrendingUp,
  Users,
  Building2,
  Database,
  Zap,
  History,
  Search,
  Globe,
  Star,
  Phone,
  Mail,
  ExternalLink,
  MapIcon,
  Flame
} from 'lucide-react';
import { buscarLeads, verificarCache, buscarHistorico, buscarLeadsPorCep } from '../lib/supabase-client';

const STORAGE_KEY = 'oculus-market-exploration-state';

interface ScannedCep {
  cep: string;
  location: {
    logradouro: string;
    bairro: string;
    localidade: string;
    uf: string;
  } | null;
  leads: any[];
  scannedAt: Date;
  totalLeads?: number;
  totalPages?: number;
}

interface Lead {
  nome: string;
  categoria: string;
  telefone: string;
  site: string;
  redesocial: string;
  email: string;
  endereco: string;
  score: number;
  nivel: 'quente' | 'morno' | 'frio';
}

export const MarketExploration: React.FC = () => {
  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'scan' | 'scaneados'>('scan');
  const [scannedCeps, setScannedCeps] = useState<ScannedCep[]>([]);
  const [selectedCep, setSelectedCep] = useState<ScannedCep | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultado, setResultado] = useState<{ leads: any[]; fromCache: boolean } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const itemsPerPage = 9;

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const state = JSON.parse(saved);
      if (state.cep) setCep(state.cep);
      if (state.loading !== undefined) setLoading(state.loading);
      if (state.statusMsg) setStatusMsg(state.statusMsg);
      if (state.error) setError(state.error);
      // activeTab sempre começa como 'scan' (não restaurar do sessionStorage)
      if (state.scannedCeps) setScannedCeps(state.scannedCeps.map((cep: any) => ({
        ...cep,
        scannedAt: new Date(cep.scannedAt)
      })));
      if (state.selectedCep) {
        try {
          setSelectedCep({
            ...state.selectedCep,
            scannedAt: new Date(state.selectedCep.scannedAt)
          });
        } catch {
          // ignorar se selectedCep inválido
        }
      }
      if (state.currentPage) setCurrentPage(state.currentPage);
      if (state.resultado) setResultado(state.resultado);
      if (state.selectedCategory) setSelectedCategory(state.selectedCategory);
    } catch {
      // ignorar se estado inválido
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        cep,
        loading,
        statusMsg,
        error,
        activeTab,
        scannedCeps,
        selectedCep,
        currentPage,
        resultado,
        selectedCategory
      })
    );
  }, [cep, loading, statusMsg, error, activeTab, scannedCeps, selectedCep, currentPage, resultado]);

  const buscarInfoCEP = async (cep: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) return null;
      return {
        logradouro: data.logradouro,
        bairro: data.bairro,
        localidade: data.localidade,
        uf: data.uf
      };
    } catch {
      return null;
    }
  };

  const loadScannedCeps = async () => {
    try {
      const history = await buscarHistorico();
      
      // Agrupar por CEP único, pegando apenas a busca mais recente para cada CEP
      const cepMap = new Map();
      history.forEach((item: any) => {
        const existing = cepMap.get(item.cep);
        if (!existing || new Date(item.created_at) > new Date(existing.created_at)) {
          cepMap.set(item.cep, item);
        }
      });
      
      const uniqueHistory = Array.from(cepMap.values());
      
      const cepsWithLocation = await Promise.all(
        uniqueHistory.map(async (item: any) => {
          const location = await buscarInfoCEP(item.cep);
          return {
            cep: item.cep,
            location,
            leads: [],
            scannedAt: new Date(item.created_at)
          };
        })
      );
      setScannedCeps(cepsWithLocation);
    } catch (err) {
      console.error('Erro ao carregar CEPs scaneados:', err);
    }
  };

  const handleRescanCep = async (cepToRescan: string) => {
    // Temporariamente definir o CEP no input para mostrar o progresso
    setCep(cepToRescan);
    setActiveTab('scan');
    
    // Chamar handleRunScan com forceReload=true
    await handleRunScan(true);
    
    // Após o re-scan, recarregar a lista de CEPs scaneados
    await loadScannedCeps();
  };

  const selectCep = async (cepData: ScannedCep, page = 1) => {
    setSelectedCep(cepData);
    setCurrentPage(page);

    try {
      // Fetch all leads for client-side pagination and filtering
      const result = await buscarLeadsPorCep(cepData.cep, '1.0', 1, 10000);
      setSelectedCep({
        ...cepData,
        leads: result.leads,
        totalLeads: result.total,
        totalPages: Math.ceil(result.total / itemsPerPage)
      });
    } catch (err) {
      console.error('Erro ao carregar leads:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'scaneados') {
      loadScannedCeps();
    }
  }, [activeTab]);

  const handleRunScan = async (forceReload = false) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      setError('Informe um CEP válido com 8 dígitos.');
      return;
    }

    // Verificar se o CEP já foi scaneado
    const cepJaScaneado = scannedCeps.some(scanned => scanned.cep === cepLimpo);
    if (cepJaScaneado && !forceReload) {
      setError('Este CEP já foi scaneado. Use o card do CEP scaneado para atualizar os dados.');
      return;
    }

    setError(null);
    setLoading(true);
    setResultado(null);
    setStatusMsg('ESCANEANDO...');

    try {
      const cached = await verificarCache(cepLimpo, '1.0');

      // Verificar se há leads no cache ou busca em andamento
      if (cached && !forceReload) {
        const status = String(cached.status ?? '').toLowerCase();

        if (['done', 'carregado', 'loaded'].includes(status)) {
          const result = await buscarLeadsPorCep(cepLimpo, '1.0', 1, 1);
          if (result.leads && result.leads.length > 0) {
            setResultado({ leads: result.leads, fromCache: true });
            setLoading(false);
            setStatusMsg('Carregado');
            setError(null);
            await loadScannedCeps();
            setCep('');
            setResultado(null);
            setActiveTab('scan');
            return;
          }
        }

        if (status === 'pending' || status === 'processing') {
          const { leads, fromCache } = await buscarLeads(
            cepLimpo,
            '1.0',
            (msg) => setStatusMsg(msg),
            { forceReload: false, waitForCompletion: false }
          );

          setResultado({ leads, fromCache });
          setLoading(false);
          setStatusMsg('Análise enviada, aguardando resultado em segundo plano');
          await loadScannedCeps();
          setCep('');
          setResultado(null);
          setActiveTab('scan');
          return;
        }
      }

      if (cached?.status === 'done' && !forceReload) {
        const userChoice = window.confirm(
          'Já existe resultado para este CEP. Deseja atualizar a base? Clique OK para atualizar, Cancelar para usar cache.'
        );

        if (!userChoice) {
          const { leads, fromCache } = await buscarLeads(
            cepLimpo,
            '1.0',
            (msg) => setStatusMsg(msg),
            { forceReload: false, waitForCompletion: false }
          );
          setResultado({ leads, fromCache });
          setLoading(false);
          setStatusMsg('Verificado');
          setError(null);
          await loadScannedCeps();
          setCep('');
          setResultado(null);
          setActiveTab('scan');
          return;
        }
      }

      const { leads, fromCache } = await buscarLeads(
        cepLimpo,
        '1.0',
        (msg) => setStatusMsg(msg),
        { forceReload: true, waitForCompletion: false }
      );

      setResultado({ leads, fromCache });
      setLoading(false);
      setStatusMsg('Análise enviada, aguardando resultado em segundo plano');
      await loadScannedCeps();
      setCep('');
      setResultado(null);
      setActiveTab('scan');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Falha na varredura: ${msg}`);
      setLoading(false);
      setStatusMsg(null);
    }
  };

  // Extrair categorias únicas dos leads
  const uniqueCategories = selectedCep?.leads && Array.isArray(selectedCep.leads)
    ? [...new Set(selectedCep.leads.map(lead => lead?.categoria).filter(Boolean))]
    : [];

  // Filtrar leads por categoria
  const filteredLeads = selectedCep?.leads && Array.isArray(selectedCep.leads)
    ? selectedCep.leads.filter(lead =>
        selectedCategory === 'todos' || lead?.categoria === selectedCategory
      )
    : [];

  // Paginar leads filtrados
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) || [];

  // Calcular páginas baseado nos leads filtrados
  const filteredTotalPages = Math.ceil(filteredLeads.length / itemsPerPage);

  // Total de páginas sem filtro (para casos onde selectedCategory === 'todos')
  const totalPages = selectedCep?.totalPages || 0;

  const LeadCard: React.FC<{ lead: Lead }> = ({ lead }) => {
    const isHot = lead.nivel === 'quente';

    return (
      <div className={`relative bg-surface-container rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
        isHot
          ? 'border-error-container/30 shadow-lg shadow-error-container/20 bg-gradient-to-br from-error-container/5 to-surface-container'
          : 'border-outline-variant/10 hover:border-tertiary/30'
      }`}>
        {isHot && (
          <div className="absolute -top-2 -right-2 bg-error-container text-on-error-container px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Flame className="w-3 h-3" />
            QUENTE
          </div>
        )}

        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-headline font-bold text-lg text-on-surface mb-1 leading-tight truncate" title={lead.nome}>
                {lead.nome}
              </h3>
              <p className="text-sm text-on-surface-variant font-medium truncate" title={lead.categoria}>
                {lead.categoria}
              </p>
            </div>
            <div className="flex items-center gap-1 ml-4">
              <Star className="w-4 h-4 text-tertiary fill-current" />
              <span className="font-bold text-tertiary text-lg">{lead.score}</span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            {lead.telefone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-on-surface-variant shrink-0" />
                <span className="text-on-surface">{lead.telefone}</span>
              </div>
            )}

            {lead.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-on-surface-variant shrink-0" />
                <a href={`mailto:${lead.email}`} className="text-tertiary hover:underline">
                  {lead.email}
                </a>
              </div>
            )}

            {lead.site && (
              <div className="flex items-start gap-3 text-sm">
                <Globe className="w-4 h-4 text-on-surface-variant shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                    <span className="text-on-surface truncate" title={lead.site}>
                      {lead.site}
                    </span>
                    <a href={lead.site} target="_blank" rel="noopener noreferrer" className="text-tertiary hover:underline flex items-center gap-1 shrink-0">
                      visite
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {lead.redesocial && (
              <div className="flex items-center gap-3 text-sm">
                <ExternalLink className="w-4 h-4 text-on-surface-variant shrink-0" />
                <a href={lead.redesocial} target="_blank" rel="noopener noreferrer" className="text-tertiary hover:underline">
                  Redes sociais
                </a>
              </div>
            )}

            {lead.endereco && (
              <div className="flex items-start gap-3 text-sm">
                <MapIcon className="w-4 h-4 text-on-surface-variant shrink-0 mt-0.5" />
                <span className="text-on-surface truncate" title={lead.endereco}>
                  {lead.endereco}
                </span>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex justify-end">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              lead.nivel === 'quente' ? 'bg-error-container/20 text-error-container border border-error-container/30' :
              lead.nivel === 'morno'  ? 'bg-tertiary/15 text-tertiary border border-tertiary/30' :
                                        'bg-surface-container-highest text-on-surface-variant border border-outline-variant/20'
            }`}>
              {lead.nivel}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-[80vh] max-w-7xl mx-auto w-full space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/15 border border-tertiary/30 text-tertiary text-xs font-bold uppercase tracking-widest">
          <Compass className="w-3 h-3" />
          Inteligência de Mercado
        </div>
        <h1 className="text-6xl font-headline font-black text-on-surface tracking-tighter leading-none">
          Explore Novas <span className="text-tertiary">Oportunidades</span>
        </h1>
        <p className="text-on-surface-variant text-lg max-w-xl mx-auto">
          Insira um CEP para iniciar uma varredura profunda de densidade comercial e presença digital na região.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-surface-container rounded-xl p-1 border border-outline-variant/10">
          <button
            onClick={() => setActiveTab('scan')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'scan'
                ? 'bg-tertiary text-on-tertiary shadow-lg'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Novo Scan
          </button>
          <button
            onClick={() => setActiveTab('scaneados')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'scaneados'
                ? 'bg-tertiary text-on-tertiary shadow-lg'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            CEPs Scaneados
          </button>
        </div>
      </div>

      {/* Scan Tab */}
      {activeTab === 'scan' && (
        <div className="flex flex-col items-center space-y-12">
          {/* Search Bar */}
          <div className="w-full max-w-2xl bg-surface-container p-2 rounded-2xl border border-outline-variant/10 shadow-2xl shadow-primary/10 flex gap-2 card-soft">
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <input
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunScan()}
                placeholder="Digite o CEP (ex: 04571-010)"
                className="w-full bg-transparent border-none pl-12 pr-4 py-4 text-lg font-medium text-on-surface focus:ring-0 outline-none"
              />
            </div>
            <button
              onClick={handleRunScan}
              disabled={loading}
              className="bg-tertiary text-on-tertiary font-black px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-tertiary/90 transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'ESCANEANDO...' : 'INICIAR SCAN'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Status Messages */}
          {statusMsg && (
            <div className={`w-full max-w-2xl flex items-center gap-3 rounded-xl px-5 py-4 text-sm ${
              statusMsg === 'Verificado' 
                ? 'bg-green-500/15 border border-green-500/25 text-green-600' 
                : statusMsg === 'Carregado'
                ? 'bg-lime-400/20 border border-lime-300/40 text-lime-300 shadow-lg shadow-lime-300/40'
                : 'bg-tertiary/12 border border-tertiary/25 text-tertiary'
            }`}>
              <Zap className={`w-4 h-4 shrink-0 ${
                statusMsg === 'Verificado' || statusMsg === 'Carregado' ? 'text-green-400' : 'animate-pulse'
              }`} />
              {statusMsg}
            </div>
          )}

          {error && (
            <div className="w-full max-w-2xl bg-error-container/15 text-error-container border border-error-container/25 rounded-xl p-4 text-sm">
              {error}
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-surface-container-high p-6 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : resultado ? (
            <div className="w-full max-w-6xl space-y-4">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-on-surface-variant" />
                <span className="text-sm text-on-surface-variant">
                  {resultado.fromCache
                    ? 'Resultado recuperado do cache — nenhuma chamada ao n8n foi necessária.'
                    : `${resultado.leads.length} leads encontrados e salvos no banco.`}
                </span>
                {resultado.fromCache && (
                  <button
                    onClick={() => handleRunScan(true)}
                    className="ml-auto rounded-lg bg-primary text-primary-foreground px-3 py-1 text-xs font-bold hover:bg-primary/90"
                  >
                    Atualizar CEP
                  </button>
                )}
              </div>

              {resultado.leads.length === 0 ? (
                <div className="bg-surface-container p-8 rounded-2xl border border-outline-variant/10 text-center">
                  <Zap className="mx-auto mb-4 w-8 h-8 text-tertiary" />
                  <h3 className="font-headline font-bold text-lg text-on-surface mb-2">Ainda não há resultados</h3>
                  <p className="text-on-surface-variant">Tente refinar o CEP para capturar uma lista mais ampla de estabelecimentos.</p>
                </div>
              ) : (
                <div className="bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/10">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface-container-low/50 border-b border-outline-variant/10">
                      <tr>
                        <th className="px-5 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Empresa</th>
                        <th className="px-5 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Categoria</th>
                        <th className="px-5 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Score</th>
                        <th className="px-5 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nível</th>
                        <th className="px-5 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Site</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/5">
                      {resultado.leads.map((lead, i) => (
                        <tr key={i} className="hover:bg-surface-bright/20 transition-colors">
                          <td className="px-5 py-4 font-medium text-on-surface">{lead.nome}</td>
                          <td className="px-5 py-4 text-on-surface-variant">{lead.categoria ?? '—'}</td>
                          <td className="px-5 py-4">
                            <span className="font-bold text-tertiary">{lead.score}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                              lead.nivel === 'quente' ? 'bg-error-container/20 text-error-container' :
                              lead.nivel === 'morno'  ? 'bg-tertiary/15 text-tertiary' :
                                                        'bg-surface-container-highest text-on-surface-variant'
                            }`}>
                              {lead.nivel}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-on-surface-variant">
                            {lead.site
                              ? <a href={lead.site} target="_blank" rel="noreferrer" className="text-tertiary underline underline-offset-2">{lead.site}</a>
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
              <div className="bg-surface-container-high p-6 rounded-2xl border border-outline-variant/5 hover:border-tertiary/30 transition-colors">
                <TrendingUp className="w-8 h-8 text-tertiary mb-4" />
                <h4 className="font-headline font-bold text-lg mb-2">Análise de Densidade</h4>
                <p className="text-sm text-on-surface-variant">Identifique saturação de mercado e nichos inexplorados com precisão geoespacial.</p>
              </div>
              <div className="bg-surface-container-high p-6 rounded-2xl border border-outline-variant/5 hover:border-tertiary/30 transition-colors">
                <Users className="w-8 h-8 text-tertiary mb-4" />
                <h4 className="font-headline font-bold text-lg mb-2">Perfil de Público</h4>
                <p className="text-sm text-on-surface-variant">Entenda o comportamento e as expectativas digitais dos consumidores locais.</p>
              </div>
              <div className="bg-surface-container-high p-6 rounded-2xl border border-outline-variant/5 hover:border-tertiary/30 transition-colors">
                <Building2 className="w-8 h-8 text-secondary mb-4" />
                <h4 className="font-headline font-bold text-lg mb-2">Benchmarking Digital</h4>
                <p className="text-sm text-on-surface-variant">Compare a performance online de todos os concorrentes em um raio definido.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scanned CEPs Tab */}
      {activeTab === 'scaneados' && (
        <div className="space-y-8">
          {!selectedCep ? (
            <div className="space-y-6">
              <div className="text-center">
                <History className="w-12 h-12 text-tertiary mx-auto mb-4" />
                <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">CEPs Scaneados</h2>
                <p className="text-on-surface-variant">Selecione um CEP para visualizar os leads encontrados.</p>
              </div>

              {scannedCeps.length === 0 ? (
                <div className="bg-surface-container p-8 rounded-2xl border border-outline-variant/10 text-center">
                  <Search className="w-8 h-8 text-on-surface-variant mx-auto mb-4" />
                  <h3 className="font-headline font-bold text-lg text-on-surface mb-2">Nenhum CEP scaneado ainda</h3>
                  <p className="text-on-surface-variant">Realize seu primeiro scan para começar a explorar oportunidades.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scannedCeps.map((cepData) => (
                    <div
                      key={cepData.cep}
                      className="bg-surface-container p-4 rounded-xl border border-outline-variant/10 hover:border-tertiary/30 transition-all hover:shadow-lg"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin className="w-5 h-5 text-tertiary" />
                        <span className="font-bold text-on-surface">{cepData.cep}</span>
                      </div>
                      {cepData.location && (
                        <div className="text-sm text-on-surface-variant mb-3">
                          {cepData.location.logradouro}, {cepData.location.bairro}
                          <br />
                          {cepData.location.localidade} - {cepData.location.uf}
                        </div>
                      )}
                      <div className="text-xs text-on-surface-variant mb-4">
                        Scaneado em {cepData.scannedAt.toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => selectCep(cepData)}
                          className="flex-1 bg-tertiary/10 text-tertiary px-3 py-2 rounded-lg text-sm font-medium hover:bg-tertiary/20 transition-colors"
                        >
                          Ver Leads
                        </button>
                        <button
                          onClick={() => handleRescanCep(cepData.cep)}
                          className="flex-1 bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                        >
                          Re-Scanear
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : !selectedCep.leads || selectedCep.leads.length === 0 ? (
            <div className="space-y-6">
              {/* Header with back button */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedCep(null)}
                  className="flex items-center gap-2 text-tertiary hover:text-tertiary/80 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Voltar
                </button>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-tertiary" />
                  <span className="font-bold text-on-surface text-lg">{selectedCep?.cep}</span>
                  {selectedCep?.location && (
                    <span className="text-on-surface-variant">
                      {selectedCep.location.localidade} - {selectedCep.location.uf}
                    </span>
                  )}
                </div>
              </div>

              {/* Leads Grid */}
              <div className="bg-surface-container p-8 rounded-2xl border border-outline-variant/10 text-center">
                <Database className="w-8 h-8 text-on-surface-variant mx-auto mb-4" />
                <h3 className="font-headline font-bold text-lg text-on-surface mb-2">Nenhum lead encontrado</h3>
                <p className="text-on-surface-variant">Este CEP ainda não possui leads cadastrados.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header with back button */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedCep(null)}
                  className="flex items-center gap-2 text-tertiary hover:text-tertiary/80 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Voltar
                </button>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-tertiary" />
                  <span className="font-bold text-on-surface text-lg">{selectedCep?.cep}</span>
                  {selectedCep?.location && (
                    <span className="text-on-surface-variant">
                      {selectedCep.location.localidade} - {selectedCep.location.uf}
                    </span>
                  )}
                </div>
              </div>

              {/* Leads Grid */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-on-surface-variant" />
                    <span className="text-sm text-on-surface-variant">
                      {selectedCep?.totalLeads || 0} leads encontrados
                    </span>
                  </div>

                  {/* Filtro de Categorias */}
                  {uniqueCategories.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-on-surface-variant">Filtrar por:</span>
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setCurrentPage(1); // Reset para primeira página ao filtrar
                        }}
                        className="px-3 py-1 rounded-lg bg-surface-container border border-outline-variant/10 text-on-surface text-sm focus:ring-0 focus:border-tertiary"
                      >
                        <option value="todos">Todas as categorias</option>
                        {uniqueCategories.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedCep && (selectedCategory === 'todos' ? totalPages : filteredTotalPages) > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-lg bg-surface-container border border-outline-variant/10 text-on-surface disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors"
                      >
                        ‹
                      </button>
                      <span className="text-sm text-on-surface-variant">
                        {currentPage} de {selectedCategory === 'todos' ? totalPages : filteredTotalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(Math.min(selectedCategory === 'todos' ? totalPages : filteredTotalPages, currentPage + 1))}
                        disabled={currentPage === (selectedCategory === 'todos' ? totalPages : filteredTotalPages)}
                        className="px-3 py-1 rounded-lg bg-surface-container border border-outline-variant/10 text-on-surface disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-container-high transition-colors"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedLeads.map((lead, index) => (
                    <LeadCard key={index} lead={lead} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};