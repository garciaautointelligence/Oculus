import React from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Bookmark, 
  History, 
  PlusCircle, 
  HelpCircle, 
  UserCircle,
  Search,
  Bell,
  Settings,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewAnalysis: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onNewAnalysis }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'explore', label: 'Explorar Mercado', icon: Search },
    { id: 'audit', label: 'Auditoria Digital', icon: ShieldCheck },
    { id: 'automation', label: 'Motor de Automação', icon: Settings },
    { id: 'saved', label: 'Buscas Salvas', icon: Bookmark },
    { id: 'history', label: 'Histórico', icon: History },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface border-r border-outline-variant/10 flex flex-col z-50 card-soft gradient-panel">
      <div className="p-6">
        <h1 className="text-xl font-extrabold text-on-surface font-headline tracking-tighter">Oculus</h1>
        <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Garcia Intelligence</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
              activeTab === item.id 
                ? "bg-surface-container-high text-tertiary border-l-4 border-tertiary" 
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            )}
          >
            <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface")} />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto space-y-4">
        <button
          onClick={onNewAnalysis}
          className="w-full bg-gradient-to-r from-tertiary via-yellow-300 to-primary text-black drop-shadow-xl font-bold py-3 rounded-md flex items-center justify-center gap-2 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-xl shadow-tertiary/30 transition-all"
          aria-label="Iniciar nova análise"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="text-sm tracking-wide leading-tight">Nova Análise</span>
        </button>

        <div className="pt-4 border-t border-outline-variant/10 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors">
            <HelpCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Suporte</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors">
            <UserCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Conta</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

interface TopBarProps {
  darkMode: boolean;
  onThemeToggle: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ darkMode, onThemeToggle }) => {
  return (
    <header className="sticky top-0 z-40 flex justify-between items-center w-full px-8 py-4 bg-surface/80 backdrop-blur-md border-b border-outline-variant/5">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-black tracking-tighter text-on-surface font-headline uppercase">Oculus</h2>
        <div className="h-6 w-px bg-outline-variant/20"></div>
        <nav className="flex gap-6">
          <button className="text-on-surface-variant hover:text-on-surface font-headline font-bold text-sm transition-colors">Explorar</button>
          <button className="text-primary border-b-2 border-primary pb-1 font-headline font-bold text-sm">Histórico</button>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Filtrar histórico..." 
            className="bg-surface-container-high border-none rounded-full pl-10 pr-4 py-2 text-sm text-on-surface focus:ring-1 focus:ring-primary w-64 transition-all outline-none"
          />
        </div>

        <button
          onClick={onThemeToggle}
          className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors"
          aria-label="Alternar tema"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-tertiary rounded-full"></span>
        </button>
        <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30">
          <img 
            src="https://picsum.photos/seed/analyst/100/100" 
            alt="User" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};
