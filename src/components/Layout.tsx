import React, { useState } from 'react';
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
  Sun,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewAnalysis: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onNewAnalysis, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'explore', label: 'Explorar Mercado', icon: Search },
    { id: 'audit', label: 'Auditoria Digital', icon: ShieldCheck },
    { id: 'automation', label: 'Motor de Automação', icon: Settings },
    { id: 'saved', label: 'Buscas Salvas', icon: Bookmark },
    { id: 'history', label: 'Histórico', icon: History },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed left-0 top-0 h-full w-64 bg-[var(--color-surface)] border-r border-[var(--color-outline-variant)]/10 flex flex-col z-50 card-soft gradient-panel transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6">
          <div className="flex items-center justify-between lg:justify-start">
            <h1 className="text-xl font-extrabold text-[var(--color-on-surface)] font-headline tracking-tighter">Oculus</h1>
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-[var(--color-surface-container)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-[var(--color-primary)] font-bold uppercase tracking-widest mt-1">Garcia Intelligence</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false); // Close on mobile
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                activeTab === item.id 
                  ? "bg-[var(--color-surface-container-high)] text-[var(--color-tertiary)] border-l-4 border-[var(--color-tertiary)]" 
                  : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)]"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-[var(--color-primary)]" : "text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-on-surface)]")} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto space-y-4">
          <button
            onClick={() => {
              onNewAnalysis();
              setIsOpen(false);
            }}
            className="w-full bg-gradient-to-r from-[var(--color-tertiary)] via-yellow-300 to-[var(--color-primary)] text-black drop-shadow-xl font-bold py-3 rounded-md flex items-center justify-center gap-2 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 shadow-xl shadow-[var(--color-tertiary)]/30 transition-all"
            aria-label="Iniciar nova análise"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="text-sm tracking-wide leading-tight">Nova Análise</span>
          </button>

          <div className="pt-4 border-t border-[var(--color-outline-variant)]/10 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">
              <HelpCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Suporte</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">
              <UserCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Conta</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

interface TopBarProps {
  darkMode: boolean;
  onThemeToggle: () => void;
  onMenuToggle: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ darkMode, onThemeToggle, onMenuToggle }) => {
  return (
    <header className="sticky top-0 z-40 flex justify-between items-center w-full px-4 lg:px-8 py-4 bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-outline-variant)]/5">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-[var(--color-surface-container)]"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-xl lg:text-2xl font-black tracking-tighter text-[var(--color-on-surface)] font-headline uppercase">Oculus</h2>
        <div className="hidden lg:block h-6 w-px bg-[var(--color-outline-variant)]/20"></div>
        <nav className="hidden lg:flex gap-6">
          <button className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] font-headline font-bold text-sm transition-colors">Explorar</button>
          <button className="text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] pb-1 font-headline font-bold text-sm">Histórico</button>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-on-surface-variant)]" />
          <input 
            type="text" 
            placeholder="Filtrar histórico..." 
            className="input-field pl-10 pr-4 py-2 text-sm w-64"
          />
        </div>

        <button
          onClick={onThemeToggle}
          className="p-2 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] rounded-lg transition-colors"
          aria-label="Alternar tema"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="p-2 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
