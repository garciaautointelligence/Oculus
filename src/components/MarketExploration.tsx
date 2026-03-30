import React from 'react';
import { 
  Search, 
  MapPin, 
  Compass, 
  Target, 
  ArrowRight,
  TrendingUp,
  Users,
  Building2
} from 'lucide-react';

export const MarketExploration: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-4xl mx-auto w-full space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
          <Compass className="w-3 h-3" />
          Market Intelligence Engine
        </div>
        <h1 className="text-6xl font-headline font-black text-on-surface tracking-tighter leading-none">
          Explore Novas <span className="text-primary">Oportunidades</span>
        </h1>
        <p className="text-on-surface-variant text-lg max-w-xl mx-auto">
          Insira um CEP para iniciar uma varredura profunda de densidade comercial e presença digital na região.
        </p>
      </div>

      <div className="w-full bg-surface-container p-2 rounded-2xl border border-outline-variant/10 shadow-2xl shadow-primary/10 flex flex-col md:flex-row gap-2">
        <div className="flex-1 relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Digite o CEP (ex: 04571-010)" 
            className="w-full bg-transparent border-none pl-12 pr-4 py-4 text-lg font-medium text-on-surface focus:ring-0 outline-none"
          />
        </div>
        <div className="w-px h-8 bg-outline-variant/20 self-center hidden md:block"></div>
        <div className="flex-1 relative">
          <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
          <select className="w-full bg-transparent border-none pl-12 pr-4 py-4 text-lg font-medium text-on-surface focus:ring-0 outline-none appearance-none cursor-pointer">
            <option>Raio de 1.0 km</option>
            <option>Raio de 2.5 km</option>
            <option>Raio de 5.0 km</option>
            <option>Raio de 10.0 km</option>
          </select>
        </div>
        <button className="bg-primary text-on-primary font-black px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-inverse-primary transition-all group">
          INICIAR SCAN
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

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
    </div>
  );
};
