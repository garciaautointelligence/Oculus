import React from 'react';
import { 
  MapPin, 
  Share2, 
  Globe, 
  Zap, 
  Smartphone, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';

export const DigitalAudit: React.FC = () => {
  return (
    <div className="space-y-12 max-w-7xl mx-auto w-full">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight mb-2">Artisan Coffee Co.</h2>
          <p className="text-on-surface-variant flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            São Paulo, Brasil • <span className="text-tertiary">Premium Roastery</span>
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Global Score</span>
            <span className="text-4xl font-headline font-black text-primary">88<span className="text-xl">/100</span></span>
          </div>
          <div className="w-px h-12 bg-outline-variant/30"></div>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Status</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(68,221,193,0.6)]"></span>
              <span className="text-tertiary font-bold text-sm">ÓTIMA PRESENÇA</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-surface-container-high rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-tertiary"></div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-tertiary" />
              <h3 className="font-headline font-bold text-xl">Métricas de Redes Sociais</h3>
            </div>
            <span className="text-xs font-bold text-on-tertiary bg-tertiary/20 px-3 py-1 rounded-full uppercase tracking-tighter">+12% este mês</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Engajamento', sub: 'Taxa de interação média', value: 80, color: 'text-primary' },
              { label: 'Frequência', sub: 'Postagens por semana', value: 70, color: 'text-tertiary' },
              { label: 'Sentimento', sub: 'Feedback positivo', value: 95, color: 'text-indigo-400' },
            ].map((metric, i) => (
              <div key={i} className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-surface-container-highest" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                    <circle className={metric.color} cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.4" strokeDashoffset={364.4 * (1 - metric.value / 100)} strokeWidth="8" strokeLinecap="round"></circle>
                  </svg>
                  <span className="absolute text-2xl font-black font-headline">{metric.value}%</span>
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm">{metric.label}</p>
                  <p className="text-xs text-on-surface-variant">{metric.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-surface-container-high rounded-xl overflow-hidden relative group">
          <img 
            className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" 
            src="https://picsum.photos/seed/coffee/600/800" 
            alt="Identity" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-highest via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6">
            <h4 className="font-headline font-bold text-lg mb-1">Identidade Visual</h4>
            <p className="text-sm text-on-surface-variant">Consistência de marca em todos os canais digitais analisados.</p>
          </div>
        </div>

        <div className="lg:col-span-12 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              <h3 className="font-headline font-bold text-xl">Análise de Site</h3>
            </div>
            <p className="text-sm text-on-surface-variant">Última varredura: Hoje, 09:42</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Velocidade de Carregamento', value: 94, icon: Zap, color: 'border-primary', accent: 'text-primary' },
              { label: 'Mobile-friendly', value: 82, icon: Smartphone, color: 'border-indigo-500', accent: 'text-indigo-400' },
              { label: 'SEO & Indexação', value: 91, icon: Search, color: 'border-tertiary', accent: 'text-tertiary' },
            ].map((card, i) => (
              <div key={i} className={cn("bg-surface-container p-6 rounded-xl border-l-4", card.color)}>
                <div className="flex justify-between items-start mb-6">
                  <card.icon className={cn("w-6 h-6", card.accent)} />
                  <span className={cn("text-3xl font-headline font-black", card.accent)}>{card.value}</span>
                </div>
                <h4 className="font-bold mb-2">{card.label}</h4>
                <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden mb-4">
                  <div className={cn("h-full", card.accent.replace('text-', 'bg-'))} style={{ width: `${card.value}%` }}></div>
                </div>
                <ul className="text-xs space-y-2 text-on-surface-variant">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-tertiary" /> Item de análise otimizado</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-tertiary" /> Padrão de mercado atingido</li>
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-12 bg-surface-container-high rounded-xl overflow-hidden">
          <div className="p-6 flex justify-between items-center bg-surface-variant/30">
            <h3 className="font-headline font-bold text-lg">Pontos de Melhoria Identificados</h3>
            <button className="text-primary text-xs font-bold flex items-center gap-2 hover:underline">
              VER RELATÓRIO COMPLETO <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-lowest border-b border-outline-variant/10">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">CANAL</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">PROBLEMA</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">PRIORIDADE</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">ESTIMATIVA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {[
                  { channel: 'Instagram', code: 'IG', issue: 'Baixo uso de Reels para novos cafés', prio: 'ALTA', time: '7-10 dias', color: 'text-primary' },
                  { channel: 'Website', code: 'WB', issue: 'Imagens sem tags \'alt\' descritivas', prio: 'MÉDIA', time: '2 dias', color: 'text-indigo-400' },
                  { channel: 'Google Maps', code: 'GM', issue: 'Avaliações sem resposta há > 30 dias', prio: 'ALTA', time: 'Imediato', color: 'text-tertiary' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-surface-bright transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={cn("w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center font-bold text-xs", row.color)}>{row.code}</span>
                        <span className="text-sm font-medium">{row.channel}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{row.issue}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold",
                        row.prio === 'ALTA' ? "bg-error-container text-on-error-container" : "bg-secondary-container text-on-secondary-container"
                      )}>
                        {row.prio}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-headline">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
