import React, { useEffect, useState } from 'react';
import { Sidebar, TopBar } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { DigitalAudit } from './components/DigitalAudit';
import { MarketExploration } from './components/MarketExploration';
import { AutomationEngine } from './components/AutomationEngine';
import { SavedSearches } from './components/SavedSearches';
import { HistoryPanel } from './components/History';
import { AnimatePresence, motion } from 'framer-motion';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-surface text-on-surface">
          <div className="max-w-xl p-6 bg-surface-container-high rounded-xl shadow-lg border border-outline-variant/20">
            <h1 className="text-2xl font-bold mb-3">Ocorreu um erro</h1>
            <p className="text-on-surface-variant mb-4">Por favor, recarregue a página ou contate suporte.</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Recarregar
            </button>
            <pre className="mt-4 text-xs text-on-surface-variant overflow-auto max-h-40">{this.state.error?.toString()}</pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const VALID_TABS = ['dashboard', 'explore', 'audit', 'automation', 'saved', 'history'];

const isValidLead = (lead) => {
  return lead && typeof lead === 'object' && ('id' in lead || 'nome' in lead || 'cep' in lead);
};

const loadAppState = () => {
  if (typeof window === 'undefined' || !window.sessionStorage) return null;

  const timestamp = Number(sessionStorage.getItem('oculus_state_timestamp') || '0');
  const staleThreshold = 1000 * 60 * 60; // 60 min
  if (Date.now() - timestamp > staleThreshold) {
    sessionStorage.removeItem('oculus_activeTab');
    sessionStorage.removeItem('oculus_selectedLead');
    sessionStorage.removeItem('oculus_sidebarOpen');
    sessionStorage.setItem('oculus_state_timestamp', Date.now().toString());
    return null;
  }

  const activeTab = sessionStorage.getItem('oculus_activeTab');
  const selectedLeadRaw = sessionStorage.getItem('oculus_selectedLead');
  const sidebarOpen = sessionStorage.getItem('oculus_sidebarOpen');

  let selectedLead = null;
  try {
    selectedLead = selectedLeadRaw ? JSON.parse(selectedLeadRaw) : null;
  } catch {
    selectedLead = null;
  }

  return {
    activeTab: VALID_TABS.includes(activeTab) ? activeTab : 'dashboard',
    selectedLead: isValidLead(selectedLead) ? selectedLead : null,
    sidebarOpen: sidebarOpen === 'true',
  };
};

const saveAppState = ({ activeTab, selectedLead, sidebarOpen }) => {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  sessionStorage.setItem('oculus_activeTab', activeTab);
  sessionStorage.setItem('oculus_selectedLead', JSON.stringify(selectedLead || null));
  sessionStorage.setItem('oculus_sidebarOpen', String(sidebarOpen));
  sessionStorage.setItem('oculus_state_timestamp', Date.now().toString());
};

export default function App() {
  const persistedState = loadAppState();

  const [activeTab, setActiveTab] = useState(persistedState?.activeTab || 'dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedLead, setSelectedLead] = useState(persistedState?.selectedLead || null);
  const [sidebarOpen, setSidebarOpen] = useState(persistedState?.sidebarOpen || false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('oculus-theme');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    setDarkMode(savedTheme ? savedTheme === 'dark' : prefersDark);
  }, []);

  useEffect(() => {
    saveAppState({ activeTab, selectedLead, sidebarOpen });
  }, [activeTab, selectedLead, sidebarOpen]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('oculus-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const onThemePresetChange = (event) => {
      const preset = event.detail;
      const themeClasses = ['theme-sunny', 'theme-aqua', 'theme-night'];
      document.documentElement.classList.remove(...themeClasses);

      if (themeClasses.includes(`theme-${preset}`)) {
        document.documentElement.classList.add(`theme-${preset}`);
        localStorage.setItem('oculus-theme-preset', preset);
      } else {
        localStorage.removeItem('oculus-theme-preset');
      }
    };

    window.addEventListener('themePresetChange', onThemePresetChange);

    const savedPreset = localStorage.getItem('oculus-theme-preset');
    if (savedPreset && themeClasses.includes(`theme-${savedPreset}`)) {
      document.documentElement.classList.add(`theme-${savedPreset}`);
    }

    return () => window.removeEventListener('themePresetChange', onThemePresetChange);
  }, []);

  const handleNewAnalysis = () => {
    // UX: Nova Análise deve levar ao painel de exploração por padrão
    setActiveTab('explore');
    setSidebarOpen(false);
  };

  const handleAuditLead = (lead) => {
    setSelectedLead(lead);
    setActiveTab('audit');
    setSidebarOpen(false);
  };

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)]">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onNewAnalysis={handleNewAnalysis}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        
        <main className="lg:ml-64 flex-1 flex flex-col min-h-screen">
          <TopBar 
            darkMode={darkMode} 
            onThemeToggle={() => setDarkMode((current) => !current)}
            onMenuToggle={() => setSidebarOpen(true)}
          />
          
          <div className="p-4 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'explore' && <MarketExploration onAuditLead={handleAuditLead} />}
                {activeTab === 'audit' && <DigitalAudit lead={selectedLead} onBack={() => { setSelectedLead(null); setActiveTab('explore'); }} />}
                {activeTab === 'automation' && <AutomationEngine />}
                {activeTab === 'saved' && <SavedSearches />}
                {activeTab === 'history' && <HistoryPanel />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
