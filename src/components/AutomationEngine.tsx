import React from 'react';
import { 
  Settings, 
  Cpu, 
  Database, 
  Shield, 
  Bell, 
  Globe, 
  Save,
  RefreshCw,
  Sliders
} from 'lucide-react';

export const AutomationEngine: React.FC = () => {
  return (
    <div className="space-y-12 max-w-5xl mx-auto w-full">
      <section>
        <div className="mb-2">
          <span className="text-primary font-bold text-xs tracking-widest uppercase">Configurações Avançadas</span>
          <h3 className="text-4xl font-headline font-extrabold text-on-surface mt-1">Motor de Automação</h3>
        </div>
        <p className="text-on-surface-variant">
          Configure os parâmetros de varredura, integrações de API e lógica de saúde digital para automação de relatórios.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-surface-container-high rounded-2xl p-8 border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-8">
              <Cpu className="w-6 h-6 text-primary" />
                  <h4 className="text-xl font-headline font-bold">Varredura Regional Profunda</h4>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">Frequência de Varredura</p>
                  <p className="text-xs text-on-surface-variant">Intervalo entre atualizações automáticas de dados.</p>
                </div>
                <select className="bg-surface-container-highest border-none rounded-lg px-4 py-2 text-sm text-on-surface outline-none">
                  <option>A cada 24 horas</option>
                  <option>Semanalmente</option>
                  <option>Mensalmente</option>
                </select>
              </div>
              
              <div className="h-px bg-outline-variant/10"></div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">Profundidade de Crawling</p>
                  <p className="text-xs text-on-surface-variant">Nível de detalhamento na análise de redes sociais.</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-1.5 rounded-lg bg-surface-container-highest text-xs font-bold text-on-surface-variant">BÁSICO</button>
                  <button className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold">AVANÇADO</button>
                </div>
              </div>

              <div className="h-px bg-outline-variant/10"></div>

              <div>
                <div className="flex justify-between mb-2">
                  <p className="font-bold text-sm">Limite de Estabelecimentos</p>
                  <span className="text-primary font-bold text-sm">500</span>
                </div>
                <input type="range" className="w-full accent-primary" min="50" max="1000" defaultValue="500" />
              </div>
            </div>
          </div>

          <div className="bg-surface-container-high rounded-2xl p-8 border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-8">
              <Database className="w-6 h-6 text-tertiary" />
                  <h4 className="text-xl font-headline font-bold">Pilha de Integração</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
              {name: 'API Garcia Intelligence', status: 'Conectado', icon: Globe },
                { name: 'Motor de Coleta Social', status: 'Ativo', icon: Shield },
                { name: 'Analisador de Web Vitals', status: 'Conectado', icon: RefreshCw },
                { name: 'Exportação (PDF/CSV)', status: 'Ativo', icon: Save },
              ].map((integration, i) => (
                <div key={i} className="bg-surface-container p-4 rounded-xl flex items-center justify-between border border-outline-variant/5">
                  <div className="flex items-center gap-3">
                    <integration.icon className="w-4 h-4 text-on-surface-variant" />
                    <span className="text-sm font-medium">{integration.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-tertiary bg-tertiary/10 px-2 py-0.5 rounded uppercase">{integration.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-surface-container-high rounded-2xl p-8 border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-6">
              <Sliders className="w-5 h-5 text-secondary" />
              <h4 className="text-lg font-headline font-bold">Lógica de Saúde</h4>
            </div>
            <p className="text-xs text-on-surface-variant mb-6">Defina os pesos para o cálculo do Score Global de presença digital.</p>
            
            <div className="space-y-6">
              {[
                { label: 'Redes Sociais', weight: 40 },
                { label: 'Desempenho Web', weight: 30 },
                { label: 'Visibilidade SEO', weight: 20 },
                { label: 'Feedback de Usuário', weight: 10 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-bold">{item.label}</span>
                    <span className="text-on-surface-variant">{item.weight}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="bg-secondary h-full" style={{ width: `${item.weight}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 rounded-2xl p-8 border border-primary/20">
            <Bell className="w-8 h-8 text-primary mb-4" />
            <h4 className="font-headline font-bold text-lg mb-2">Alertas de Mudança</h4>
            <p className="text-xs text-on-surface-variant mb-4">Receba notificações quando a densidade comercial de um CEP salvo mudar significativamente.</p>
            <button className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl text-sm hover:bg-inverse-primary transition-colors">
              Configurar Notificações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
