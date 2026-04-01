import React, { useEffect, useState } from 'react';
import { Sidebar, TopBar } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { DigitalAudit } from './components/DigitalAudit';
import { MarketExploration } from './components/MarketExploration';
import { AutomationEngine } from './components/AutomationEngine';
import { SavedSearches } from './components/SavedSearches';
import { HistoryPanel } from './components/History';
import { AnimatePresence, motion } from 'framer-motion';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('oculus-theme');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    setDarkMode(savedTheme ? savedTheme === 'dark' : prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('oculus-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleNewAnalysis = () => {
    // UX: Nova Análise deve levar ao painel de exploração por padrão
    setActiveTab('explore');
  };

  return (
    <div className="flex min-h-screen bg-surface text-on-surface">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onNewAnalysis={handleNewAnalysis} />
      
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <TopBar darkMode={darkMode} onThemeToggle={() => setDarkMode((current) => !current)} />
        
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'explore' && <MarketExploration />}
              {activeTab === 'audit' && <DigitalAudit />}
              {activeTab === 'automation' && <AutomationEngine />}
              {activeTab === 'saved' && <SavedSearches />}
              {activeTab === 'history' && <HistoryPanel />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
