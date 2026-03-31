import React from 'react';
import { motion } from 'framer-motion';
import { Clock3, TrendingUp, Activity, CheckCircle2 } from 'lucide-react';

const historyItems = [
  {
    title: 'Auditoria de Presença Digital',
    subtitle: 'CEP 04571-010 • 5 km',
    status: 'Concluído',
    date: '25 mar 2026',
    impact: 'Aumento de 18% no recall de marca',
  },
  {
    title: 'Análise de Força Local',
    subtitle: 'CEP 01426-001 • 2.5 km',
    status: 'Concluído',
    date: '18 mar 2026',
    impact: 'Identificadas 24 oportunidades em canais sociais',
  },
  {
    title: 'Varredura de Novos Segmentos',
    subtitle: 'CEP 30320-510 • 10 km',
    status: 'Em andamento',
    date: '11 mar 2026',
    impact: 'Pipeline de leads atualizando em tempo real',
  },
];

export const HistoryPanel: React.FC = () => {
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
        {historyItems.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-surface-container-high rounded-3xl p-6 border border-outline-variant/10"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-on-surface-variant font-bold">{item.subtitle}</p>
                <h3 className="text-2xl font-bold text-on-surface mt-3">{item.title}</h3>
              </div>
              <div className="rounded-full bg-surface-container-highest px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-tertiary">{item.status}</div>
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                <Clock3 className="w-4 h-4" />
                {item.date}
              </div>
              <div className="text-sm text-on-surface">{item.impact}</div>
            </div>
          </motion.div>
        ))}
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
