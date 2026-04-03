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
          <h2 className="text-4xl font-headline font-extrabold text-[var(--color-on-surface)] tracking-tight mb-4">Selecione um Lead para Auditar</h2>
          <p className="text-[var(--color-on-surface-variant)]">Clique em "Auditar" em um card de lead na aba de Exploração de Mercado para ver a análise detalhada aqui.</p>
        </div>
      </div>
    );
  }

  const getStatusText = (nivel: string) => {
    switch (nivel) {
      case 'quente': return 'Alta Prioridade';
      case 'morno': return 'Presença Moderada';
      default: return 'Presença Básica';
    }
  };

  const getStatusColor = (nivel: string) => {
    switch (nivel) {
      case 'quente': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'morno': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      default: return 'bg-green-500/20 text-green-500 border-green-500/30';
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
          <h2 className="text-4xl font-headline font-extrabold text-[var(--color-on-surface)] tracking-tight mb-2">{lead.nome}</h2>
          <p className="text-[var(--color-on-surface-variant)] flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {lead.endereco || 'Endereço não informado'} • <span className="text-[var(--color-tertiary)]">{lead.categoria}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Pontuação Global</span>
            <span className="text-4xl font-headline font-black text-[var(--color-primary)]">{lead.score}<span className="text-xl">/100</span></span>
          </div>
          <div className="w-px h-12 bg-[var(--color-outline-variant)]/30"></div>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Status</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-3 h-3 rounded-full border ${getStatusColor(lead.nivel)}`}></span>
              <span className={`font-bold text-sm ${lead.nivel === 'quente' ? 'text-red-500' : lead.nivel === 'morno' ? 'text-amber-500' : 'text-green-500'}`}>
                {getStatusText(lead.nivel)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[var(--color-surface-container-high)] rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-tertiary)]"></div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-[var(--color-tertiary)]" />
              <h3 className="font-headline font-bold text-xl">Informações de Contato</h3>
            </div>
          </div>

          <div className="space-y-4">
            {lead.telefone && (
              <div className="flex items-center gap-3 p-4 bg-[var(--color-surface-container)] rounded-lg">
                <Phone className="w-5 h-5 text-[var(--color-on-surface-variant)]" />
                <div>
                  <p className="font-medium text-[var(--color-on-surface)]">{lead.telefone}</p>
                  <p className="text-sm text-[var(--color-on-surface-variant)]">Telefone</p>
                </div>
              </div>
            )}

            {lead.email && (
              <div className="flex items-center gap-3 p-4 bg-[var(--color-surface-container)] rounded-lg">
                <Mail className="w-5 h-5 text-[var(--color-on-surface-variant)]" />
                <div>
                  <a href={`mailto:${lead.email}`} className="font-medium text-[var(--color-tertiary)] hover:underline">{lead.email}</a>
                  <p className="text-sm text-[var(--color-on-surface-variant)]">E-mail</p>
                </div>
              </div>
            )}

            {lead.site && (
              <div className="flex items-center gap-3 p-4 bg-[var(--color-surface-container)] rounded-lg">
                <Globe className="w-5 h-5 text-[var(--color-on-surface-variant)]" />
                <div>
                  <a href={lead.site} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--color-tertiary)] hover:underline">{lead.site}</a>
                  <p className="text-sm text-[var(--color-on-surface-variant)]">Website</p>
                </div>
              </div>
            )}

            {lead.redesocial && (
              <div className="flex items-center gap-3 p-4 bg-[var(--color-surface-container)] rounded-lg">
                <ExternalLink className="w-5 h-5 text-[var(--color-on-surface-variant)]" />
                <div>
                  <a href={lead.redesocial} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--color-tertiary)] hover:underline">Redes Sociais</a>
                  <p className="text-sm text-[var(--color-on-surface-variant)]">Presença nas redes</p>
                </div>
              </div>
            )}
          </div>

          {mapUrl && (
            <div className="mt-6">
              <h4 className="font-headline font-bold text-lg mb-3">Localização no Mapa</h4>
              <div className="h-64 rounded-xl overflow-hidden border border-[var(--color-outline-variant)]/30">
                <iframe
                  title="Mapa de localização"
                  src={mapUrl}
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.endereco || '')}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center text-sm text-[var(--color-tertiary)] hover:underline">
                <ArrowRight className="w-4 h-4 mr-1" /> Ver no Google Maps
              </a>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 bg-[var(--color-surface-container-high)] rounded-xl p-6">
          <h4 className="font-headline font-bold text-lg mb-4">Resumo da Auditoria</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-on-surface-variant)]">Score Digital</span>
              <span className="font-bold text-[var(--color-tertiary)]">{lead.score}/100</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-on-surface-variant)]">Nível de Presença</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${lead.nivel === 'quente' ? 'bg-red-500/20 text-red-500 border-red-500/30' : lead.nivel === 'morno' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : 'bg-green-500/20 text-green-500 border-green-500/30'}`}>
                {lead.nivel}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-on-surface-variant)]">Categoria</span>
              <span className="font-medium text-[var(--color-on-surface)]">{lead.categoria}</span>
            </div>

            <div className="border-t border-[var(--color-outline-variant)]/30 mt-4 pt-4">
              <h5 className="text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-3">Checklist de Saúde Digital</h5>
              <ul className="space-y-2">
                {auditChecklist.map((item) => (
                  <li key={item.label} className="flex items-center gap-2 text-sm">
                    {item.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                    <span className={item.ok ? 'text-[var(--color-on-surface)]' : 'text-red-500'}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-[var(--color-outline-variant)]/30 mt-4 pt-4">
              <h5 className="text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2">Insights Estratégicos</h5>
              <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
                A presença no Google está bem estruturada, com telefone, site e localização acessíveis, o que favorece buscas locais por especialidade médica.
              </p>
              <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed mt-1">
                A ausência de perfis sociais profissionais identificáveis reduz sinais de autoridade e recorrência de contato para pacientes em fase de decisão.
              </p>
              <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed mt-1">
                Para especialidades médicas, avaliações, conteúdo institucional e consistência entre Google, site e diretórios aumentam confiança e taxa de agendamento.
              </p>
            </div>

            <div className="border-t border-[var(--color-outline-variant)]/30 mt-4 pt-4">
              <h5 className="text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2">Próximas Ações Recomendadas</h5>
              <ul className="text-sm text-[var(--color-on-surface-variant)] space-y-1">
                <li>• Prioridade imediata: criar ou padronizar presença profissional no Instagram e/ou LinkedIn médico, mantendo identidade visual, especialidade, localização e canais de agendamento.</li>
                <li>• Adicionar CTA claro de agendamento no site e reforçar prova social (depoimentos, convênios, diferenciais e especialidades).</li>
                <li>• Revisar SEO local da página principal com foco em 'cirurgia de cabeça e pescoço em São Paulo'.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
