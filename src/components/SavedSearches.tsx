import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock3, Sparkles, ArrowRight } from 'lucide-react';
import { buscarHistorico } from '../lib/supabase-client';

type SavedSearch = {
  id: string;
  cep: string;
  raio_km: number;
  status: string;
  total_leads?: number;
  created_at: string;
  completed_at: string | null;
  status_message?: string | null;
};

export const SavedSearches: React.FC = () => {
  const [savedItems, setSavedItems] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarHistorico(6, ['done'])
      .then((data) => setSavedItems(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatCep = (cep: string) =>
    cep.length === 8 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : cep;

  return (
    <div className="space-y-10 max-w-6xl mx-auto w-full">
      <section className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          Buscas Salvas
        </div>
        <div>
          <h2 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight">Consultas que voltamos a analisar</h2>
          <p className="text-on-surface-variant max-w-2xl mt-3">
            Todas as pesquisas guardadas em um único painel com acesso rápido a resultados, métricas e ações.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-surface-container-high rounded-3xl p-6 border border-outline-variant/10 animate-pulse"
            >
              <div className="h-6 bg-surface-container rounded-full mb-4" />
              <div className="h-4 bg-surface-container rounded-full w-3/4 mb-6" />
              <div className="space-y-3">
                <div className="h-3 bg-surface-container rounded-full" />
                <div className="h-3 bg-surface-container rounded-full w-5/6" />
              </div>
            </motion.article>
          ))
        ) : savedItems.length > 0 ? (
          savedItems.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-surface-container-high rounded-3xl p-6 border border-outline-variant/10 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-on-surface-variant font-bold">CEP {formatCep(item.cep)} • raio {item.raio_km} km</p>
                  <h3 className="text-xl font-bold text-on-surface mt-3">Busca {item.id.slice(0, 8)}</h3>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{item.status || 'Concluída'}</span>
              </div>
              <p className="text-sm leading-6 text-on-surface-variant">
                {item.total_leads != null
                  ? `Retornou ${item.total_leads} leads.`
                  : 'Resultado disponível no histórico de buscas.'}
              </p>
              <div className="mt-8 flex items-center justify-between text-sm text-on-surface-variant">
                <div className="inline-flex items-center gap-2">
                  <Clock3 className="w-4 h-4 text-tertiary" />
                  {new Date(item.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
                <button className="text-primary font-bold hover:underline inline-flex items-center gap-2">
                  Abrir
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.article>
          ))
        ) : (
          <div className="col-span-3 p-8 rounded-3xl bg-surface-container border border-dashed border-outline-variant/40 text-on-surface-variant text-center">
            Nenhuma busca salva encontrada. Inicie uma nova análise para popular este painel.
          </div>
        )}
      </div>

      <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-headline font-bold text-on-surface">Ainda não encontrou o que precisava?</h3>
          <p className="text-on-surface-variant mt-2">Crie e salve uma nova busca para rediscar insights em tempo real.</p>
        </div>
        <button className="rounded-full bg-primary text-on-primary px-6 py-3 font-bold uppercase tracking-[0.18em] shadow-lg shadow-primary/10 hover:bg-inverse-primary transition-all">
          Nova pesquisa
        </button>
      </div>
    </div>
  );
};
