import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Clock3, Sparkles, ArrowRight } from 'lucide-react';

const savedItems = [
  {
    title: 'Crescimento Varejo SP',
    subtitle: 'CEP 04571-010 • raio 5 km',
    date: '17 mar 2026',
    badge: 'Ativa',
    summary: 'Lista completa de potenciais parceiros, com presença digital e score de influência.',
  },
  {
    title: 'Auditoria Café Premium',
    subtitle: 'CEP 01426-001 • raio 2.5 km',
    date: '11 mar 2026',
    badge: 'Salva',
    summary: 'Relatório de presença online e performance local para concorrentes diretos.',
  },
  {
    title: 'Expansão Retail Tech',
    subtitle: 'CEP 30320-510 • raio 10 km',
    date: '04 mar 2026',
    badge: 'Concluída',
    summary: 'Busca histórica com insights de benchamrking e oportunidades de expansão digital.',
  },
];

export const SavedSearches: React.FC = () => {
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
        {savedItems.map((item, index) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-surface-container-high rounded-3xl p-6 border border-outline-variant/10 hover:border-primary/30 transition-all"
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-on-surface-variant font-bold">{item.subtitle}</p>
                <h3 className="text-xl font-bold text-on-surface mt-3">{item.title}</h3>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{item.badge}</span>
            </div>
            <p className="text-sm leading-6 text-on-surface-variant">{item.summary}</p>
            <div className="mt-8 flex items-center justify-between text-sm text-on-surface-variant">
              <div className="inline-flex items-center gap-2">
                <Clock3 className="w-4 h-4 text-tertiary" />
                {item.date}
              </div>
              <button className="text-primary font-bold hover:underline inline-flex items-center gap-2">
                Abrir
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.article>
        ))}
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
