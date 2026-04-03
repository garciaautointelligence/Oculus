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
  ArrowRight,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';

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

interface DigitalAuditProps {
  lead?: Lead | null;
}

export const DigitalAudit: React.FC<DigitalAuditProps> = ({ lead }) => {
  if (!lead) {
    return (
      <div className="space-y-12 max-w-7xl mx-auto w-full">
        <div className="text-center py-12">
          <h2 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight mb-4">Selecione um Lead para Auditar</h2>
          <p className="text-on-surface-variant">Clique em "Auditar" em um card de lead na aba de Exploração de Mercado para ver a análise detalhada aqui.</p>
        </div>
      </div>
    );
  }

  const getStatusText = (nivel: string) => {
    switch (nivel) {
      case 'quente': return 'PRESENÇA FORTE';
      case 'morno': return 'PRESENÇA MODERADA';
      default: return 'PRESENÇA BÁSICA';
    }
  };

  const getStatusColor = (nivel: string) => {
    switch (nivel) {
      case 'quente': return 'bg-error-container/20 text-error-container';
      case 'morno': return 'bg-tertiary shadow-[0_0_8px_rgba(68,221,193,0.6)]';
      default: return 'bg-surface-container-highest text-on-surface-variant';
    }
  };

  const hasGoogleMyBusiness = Boolean(lead.endereco);
  const hasContactInfo = Boolean(lead.telefone || lead.email || lead.site);
  const hasSocialPresence = Boolean(lead.redesocial);
  const isSecureSite = Boolean(lead.site && lead.site.startsWith('https://'));

  const auditChecklist = [
    { label: 'Ficha de Google Meu Negócio', ok: hasGoogleMyBusiness },
    { label: 'Contato visível', ok: hasContactInfo },
    { label: 'Perfil social ativo', ok: hasSocialPresence },
    { label: 'Site seguro (HTTPS)', ok: isSecureSite },
  ];

  const mapUrl = lead.endereco
    ? `https://www.google.com/maps?q=${encodeURIComponent(lead.endereco)}&output=embed`
    : null;

  return (
    <div className="space-y-12 max-w-7xl mx-auto w-full">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight mb-2">{lead.nome}</h2>
          <p className="text-on-surface-variant flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {lead.endereco || 'Endereço não informado'} • <span className="text-tertiary">{lead.categoria}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Pontuação Global</span>
            <span className="text-4xl font-headline font-black text-primary">{lead.score}<span className="text-xl">/100</span></span>
          </div>
          <div className="w-px h-12 bg-outline-variant/30"></div>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Status</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${getStatusColor(lead.nivel)}`}></span>
              <span className={`font-bold text-sm ${lead.nivel === 'quente' ? 'text-error-container' : lead.nivel === 'morno' ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                {getStatusText(lead.nivel)}
              </span>
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
              <h3 className="font-headline font-bold text-xl">Informações de Contato</h3>
            </div>
          </div>

          <div className="space-y-4">
            {lead.telefone && (
              <div className="flex items-center gap-3 p-4 bg-surface-container rounded-lg">
                <Phone className="w-5 h-5 text-on-surface-variant" />
                <div>
                  <p className="font-medium text-on-surface">{lead.telefone}</p>
                  <p className="text-sm text-on-surface-variant">Telefone</p>
                </div>
              </div>
            )}

            {lead.email && (
              <div className="flex items-center gap-3 p-4 bg-surface-container rounded-lg">
                <Mail className="w-5 h-5 text-on-surface-variant" />
                <div>
                  <a href={`mailto:${lead.email}`} className="font-medium text-tertiary hover:underline">{lead.email}</a>
                  <p className="text-sm text-on-surface-variant">E-mail</p>
                </div>
              </div>
            )}

            {lead.site && (
              <div className="flex items-center gap-3 p-4 bg-surface-container rounded-lg">
                <Globe className="w-5 h-5 text-on-surface-variant" />
                <div>
                  <a href={lead.site} target="_blank" rel="noopener noreferrer" className="font-medium text-tertiary hover:underline">{lead.site}</a>
                  <p className="text-sm text-on-surface-variant">Website</p>
                </div>
              </div>
            )}

            {lead.redesocial && (
              <div className="flex items-center gap-3 p-4 bg-surface-container rounded-lg">
                <ExternalLink className="w-5 h-5 text-on-surface-variant" />
                <div>
                  <a href={lead.redesocial} target="_blank" rel="noopener noreferrer" className="font-medium text-tertiary hover:underline">Redes Sociais</a>
                  <p className="text-sm text-on-surface-variant">Presença nas redes</p>
                </div>
              </div>
            )}
          </div>

          {mapUrl && (
            <div className="mt-6">
              <h4 className="font-headline font-bold text-lg mb-3">Localização no Mapa</h4>
              <div className="h-64 rounded-xl overflow-hidden border border-outline-variant/30">
                <iframe
                  title="Mapa de localização"
                  src={mapUrl}
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 bg-surface-container-high rounded-xl p-6">
          <h4 className="font-headline font-bold text-lg mb-4">Resumo da Auditoria</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-on-surface-variant">Score Digital</span>
              <span className="font-bold text-tertiary">{lead.score}/100</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-on-surface-variant">Nível de Presença</span>
              <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${lead.nivel === 'quente' ? 'bg-error-container/20 text-error-container' : lead.nivel === 'morno' ? 'bg-tertiary/15 text-tertiary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                {lead.nivel}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-on-surface-variant">Categoria</span>
              <span className="font-medium text-on-surface">{lead.categoria}</span>
            </div>

            <div className="border-t border-outline-variant/30 mt-4 pt-4">
              <h5 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3">Checklist de Saúde Digital</h5>
              <ul className="space-y-2">
                {auditChecklist.map((item) => (
                  <li key={item.label} className="flex items-center gap-2 text-sm">
                    {item.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-error-container" />}
                    <span className={item.ok ? 'text-on-surface' : 'text-error-container'}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-outline-variant/30 mt-4 pt-4">
              <h5 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2">Detalhes Extras</h5>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                - Boa base para operação local. Sugestão de próximos passos: validar informações no Google Maps e publicar alterações nos perfis sociais.
              </p>
              <p className="text-sm text-on-surface-variant leading-relaxed mt-1">
                - Se o site não usar HTTPS, considere migração rápida; para leads com notas &lt; 60, priorizar correção de contacto e SEO on-page.
              </p>
            </div>

            <div className="border-t border-outline-variant/30 mt-4 pt-4">
              <h5 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2">Recomendações Rápidas</h5>
              <ul className="text-sm text-on-surface-variant space-y-1">
                <li>• Atualizar endereço e horário no Google Meu Negócio</li>
                <li>• Garantir telefone e website acessíveis em todas as páginas</li>
                <li>• Publicar conteúdo local para melhorar SEO de bairro</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
