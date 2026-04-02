import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock3, Activity } from 'lucide-react';
import { buscarHistorico } from '../lib/supabase-client';

type HistoryItem = {
  id: string;
  cep: string;
  raio_km: number;
  status: string;
  status_message?: string | null;
  total_leads?: number;
  created_at: string;
  completed_at: string | null;
};

export const HistoryPanel: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarHistorico(10, [])
      .then((data) => setHistoryItems(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto w-full">
      <section className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold uppercase tracking-widest">
          <Activity className="w-4 h-4" />
          Histórico
        </div>
        <div>
          <h2 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight">Linha do tempo das últimas análises</h2>
          <p className="text-on-surface-variant max-w-2xl mt-3">
            Revise buscas anteriores, compare resultados e retome ações estratégicas com um histórico organizado.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-surface-container-high rounded-3xl p-6 border border-outline-variant/10 animate-pulse"
            >
              <div className="h-6 bg-surface-container rounded-full mb-4" />
              <div className="h-4 bg-surface-container rounded-full w-2/3 mb-6" />
              <div className="h-3 bg-surface-container rounded-full w-full mb-3" />
              <div className="h-3 bg-surface-container rounded-full w-5/6" />
            </motion.div>
          ))
        ) : historyItems.length > 0 ? (
          historyItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-surface-container-high rounded-3xl p-6 border border-outline-variant/10"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-on-surface-variant font-bold">CEP {item.cep} • {item.raio_km} km</p>
                  <h3 className="text-2xl font-bold text-on-surface mt-3">{item.id.slice(0, 10)}</h3>
                </div>
                <div className="rounded-full bg-surface-container-highest px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-tertiary">
                  {item.status || 'Sem status'}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                  <Clock3 className="w-4 h-4" />
                  {formatDate(item.created_at)}
                </div>
                <div className="text-sm text-on-surface">
                  {item.status_message || `${item.total_leads ?? 0} leads encontrados`}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-8 rounded-3xl bg-surface-container border border-dashed border-outline-variant/40 text-on-surface-variant text-center">
            Nenhum histórico encontrado. Faça uma nova análise para preencher este painel.
          </div>
        )}
      </div>

      <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-headline font-bold text-on-surface">Mantenha o ritmo das suas análises</h3>
          <p className="text-on-surface-variant mt-2">Use o histórico para identificar padrões e priorizar os próximos passos de alto impacto.</p>
        </div>
        <button className="rounded-full bg-tertiary text-on-surface px-6 py-3 font-bold uppercase tracking-[0.18em] shadow-lg shadow-tertiary/10 hover:bg-tertiary/90 transition-all">
          Ver relatório completo
        </button>
      </div>
    </div>
  );
};
