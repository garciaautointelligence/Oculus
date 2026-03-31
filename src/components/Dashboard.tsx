import React from 'react';
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
  TrendingUp
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { value: 40 },
  { value: 60 },
  { value: 30 },
  { value: 80 },
  { value: 50 },
  { value: 90 },
  { value: 70 },
  { value: 100 },
];

export const Dashboard: React.FC = () => {
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
          <div className="bg-surface-container-high p-5 rounded-xl border-l-2 border-tertiary">
            <div className="flex items-center justify-between mb-2">
              <span className="text-on-surface-variant text-xs font-bold uppercase">Total de Buscas</span>
              <BarChart3 className="w-4 h-4 text-tertiary" />
            </div>
            <div className="text-2xl font-headline font-bold">1,284</div>
          </div>
          <div className="bg-surface-container-high p-5 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-on-surface-variant text-xs font-bold uppercase">CEPs Únicos</span>
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-headline font-bold">412</div>
          </div>
          <div className="bg-surface-container-high p-5 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-on-surface-variant text-xs font-bold uppercase">Média de Lojas</span>
              <Store className="w-4 h-4 text-secondary" />
            </div>
            <div className="text-2xl font-headline font-bold">18.4</div>
          </div>
          <button className="bg-surface-container-high p-5 rounded-xl border border-dashed border-outline-variant/40 flex flex-col items-center justify-center gap-2 text-primary hover:bg-surface-container-highest transition-colors">
            <DownloadIcon className="w-5 h-5" />
            <span className="text-xs font-bold uppercase">Exportar Tudo</span>
          </button>
        </div>
      </section>

      <section className="bg-surface-container rounded-2xl overflow-hidden shadow-2xl shadow-primary/5">
        <div className="flex items-center justify-between p-6 bg-surface-container-low/50">
          <div className="flex gap-4">
            <button className="bg-surface-container-highest px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-outline-variant/20">
              <Calendar className="w-4 h-4" />
              Últimos 30 dias
            </button>
            <button className="bg-surface-container-highest px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-outline-variant/20">
              <Filter className="w-4 h-4" />
              Filtros Avançados
            </button>
          </div>
          <div className="text-sm text-on-surface-variant">
            Exibindo 1-10 de 1,284 registros
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-lowest/50 border-b border-outline-variant/10">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Data da Consulta</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">CEP Pesquisado</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Distância (Raio)</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Estabelecimentos</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {[
                { date: '24 Out, 2023', time: '14:32', cep: '04571-010', dist: '5.0 km', count: 142, progress: 70 },
                { date: '23 Out, 2023', time: '09:15', cep: '22775-040', dist: '2.5 km', count: 58, progress: 30 },
                { date: '22 Out, 2023', time: '17:48', cep: '30140-061', dist: '10.0 km', count: 312, progress: 95 },
                { date: '22 Out, 2023', time: '11:02', cep: '80020-000', dist: '1.0 km', count: 12, progress: 10 },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-surface-bright/20 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-on-surface font-medium text-sm">{row.date}</span>
                      <span className="text-xs text-on-surface-variant">{row.time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-mono text-sm text-on-surface">{row.cep}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm">{row.dist}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-tertiary">{row.count}</span>
                      <div className="w-12 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="bg-tertiary h-full" style={{ width: `${row.progress}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary rounded-lg transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-surface-container-lowest/30 flex items-center justify-center gap-4">
          <button className="p-2 rounded-lg bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-lg bg-primary text-on-primary font-bold text-sm">1</button>
            <button className="w-8 h-8 rounded-lg bg-surface-container-highest text-on-surface-variant text-sm hover:bg-surface-bright">2</button>
            <button className="w-8 h-8 rounded-lg bg-surface-container-highest text-on-surface-variant text-sm hover:bg-surface-bright">3</button>
            <span className="text-on-surface-variant">...</span>
            <button className="w-8 h-8 rounded-lg bg-surface-container-highest text-on-surface-variant text-sm hover:bg-surface-bright">128</button>
          </div>
          <button className="p-2 rounded-lg bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors">
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-container-high rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
          <h4 className="text-lg font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-tertiary" />
            Tendência de Volume
          </h4>
          <div className="h-40 w-full bg-surface-container flex items-end justify-between p-4 rounded-xl gap-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === data.length - 1 ? '#44ddc1' : '#bbc3ff'} 
                      fillOpacity={index === data.length - 1 ? 1 : 0.4}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-on-surface-variant mt-4">
            As pesquisas aumentaram <span className="text-tertiary font-bold">12%</span> em relação à semana passada.
          </p>
        </div>

        <div className="bg-surface-container-high rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-headline font-bold text-on-surface mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Buscas Inteligentes
            </h4>
            <p className="text-sm text-on-surface-variant">
              Sua análise mais frequente é no setor de <strong>Varejo Alimentar</strong> com raio médio de <strong>3km</strong>.
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
