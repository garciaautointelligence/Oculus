import React, { useState } from 'react';
import { 
  MapPin, 
  Compass, 
  Target, 
  ArrowRight,
  TrendingUp,
  Users,
  Building2,
  Database,
  Zap
} from 'lucide-react';
import { buscarLeads } from './supabase-client';

export const MarketExploration: React.FC = () => {
  const [cep, setCep] = useState('');
  const [radius, setRadius] = useState('1.0');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ leads: any[]; fromCache: boolean } | null>(null);

  const handleRunScan = async () => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      setError('Informe um CEP válido com 8 dígitos.');
      return;
    }

    setError(null);
    setLoading(true);
    setResultado(null);
    setStatusMsg(null);

    try {
      const { leads, fromCache } = await buscarLeads(
        cepLimpo,
        radius,
        (msg) => setStatusMsg(msg)
      );

      setResultado({ leads, fromCache });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Falha na varredura: ${msg}`);
    } finally {
      setLoading(false);
      setStatusMsg(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-4xl mx-auto w-full space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
          <Compass className="w-3 h-3" />
          Inteligência de Mercado
        </div>
        <h1 className="text-6xl font-headline font-black text-on-surface tracking-tighter leading-none">
          Explore Novas <span className="text-primary">Oportunidades</span>
        </h1>
        <p className="text-on-surface-variant text-lg max-w-xl mx-auto">
          Insira um CEP para iniciar uma varredura profunda de densidade comercial e presença digital na região.
        </p>
      </div>

      {/* Barra de busca */}
      <div className="w-full bg-surface-container p-2 rounded-2xl border border-outline-variant/10 shadow-2xl shadow-primary/10 flex flex-col md:flex-row gap-2">
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
        <div className="w-px h-8 bg-outline-variant/20 self-center hidden md:block" />
        <div className="flex-1 relative">
          <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
          <select
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="w-full bg-transparent border-none pl-12 pr-4 py-4 text-lg font-medium text-on-surface focus:ring-0 outline-none appearance-none cursor-pointer"
          >
            <option value="1.0">Raio de 1.0 km</option>
            <option value="2.5">Raio de 2.5 km</option>
            <option value="5.0">Raio de 5.0 km</option>
            <option value="10.0">Raio de 10.0 km</option>
          </select>
        </div>
        <button
          onClick={handleRunScan}
          disabled={loading}
          className="bg-primary text-on-primary font-black px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-inverse-primary transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Processando...' : 'INICIAR SCAN'}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Status do processo */}
      {statusMsg && (
        <div className="w-full flex items-center gap-3 bg-primary/5 border border-primary/15 rounded-xl px-5 py-4 text-sm text-primary">
          <Zap className="w-4 h-4 animate-pulse shrink-0" />
          {statusMsg}
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="w-full bg-error-container/15 text-error-container border border-error-container/25 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Resultado */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-surface-container-high p-6 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : resultado ? (
        <div className="w-full space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-on-surface-variant" />
            <span className="text-sm text-on-surface-variant">
              {resultado.fromCache
                ? 'Resultado recuperado do cache — nenhuma chamada ao n8n foi necessária.'
                : `${resultado.leads.length} leads encontrados e salvos no banco.`}
            </span>
          </div>

          {resultado.leads.length === 0 ? (
            <div className="bg-surface-container p-8 rounded-2xl border border-outline-variant/10 text-center">
              <Zap className="mx-auto mb-4 w-8 h-8 text-tertiary" />
              <h3 className="font-headline font-bold text-lg text-on-surface mb-2">Ainda não há resultados</h3>
              <p className="text-on-surface-variant">Tente refinar o CEP ou aumentar o raio para capturar uma lista mais ampla de estabelecimentos.</p>
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
                          ? <a href={lead.site} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">{lead.site}</a>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div className="bg-surface-container-high p-6 rounded-2xl border border-outline-variant/5 hover:border-primary/20 transition-colors">
            <TrendingUp className="w-8 h-8 text-tertiary mb-4" />
            <h4 className="font-headline font-bold text-lg mb-2">Análise de Densidade</h4>
            <p className="text-sm text-on-surface-variant">Identifique saturação de mercado e nichos inexplorados com precisão geoespacial.</p>
          </div>
          <div className="bg-surface-container-high p-6 rounded-2xl border border-outline-variant/5 hover:border-primary/20 transition-colors">
            <Users className="w-8 h-8 text-primary mb-4" />
            <h4 className="font-headline font-bold text-lg mb-2">Perfil de Público</h4>
            <p className="text-sm text-on-surface-variant">Entenda o comportamento e as expectativas digitais dos consumidores locais.</p>
          </div>
          <div className="bg-surface-container-high p-6 rounded-2xl border border-outline-variant/5 hover:border-primary/20 transition-colors">
            <Building2 className="w-8 h-8 text-secondary mb-4" />
            <h4 className="font-headline font-bold text-lg mb-2">Benchmarking Digital</h4>
            <p className="text-sm text-on-surface-variant">Compare a performance online de todos os concorrentes em um raio definido.</p>
          </div>
        </div>
      )}
    </div>
  );
};