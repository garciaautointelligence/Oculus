import React, { useState } from 'react';
import { Sidebar, TopBar } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { DigitalAudit } from './components/DigitalAudit';
import { MarketExploration } from './components/MarketExploration';
import { AutomationEngine } from './components/AutomationEngine';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="ml-64 flex-1 flex flex-col">
        <TopBar />
        
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'explore' && <MarketExploration />}
              {activeTab === 'audit' && <DigitalAudit />}
              {activeTab === 'automation' && <AutomationEngine />}
              {activeTab === 'saved' && (
                <div className="flex flex-col items-center justify-center h-[60vh] text-on-surface-variant">
                  <p className="text-lg font-medium">Saved Searches View</p>
                  <p className="text-sm">This section is under development.</p>
                </div>
              )}
              {activeTab === 'history' && (
                <div className="flex flex-col items-center justify-center h-[60vh] text-on-surface-variant">
                  <p className="text-lg font-medium">Full History View</p>
                  <p className="text-sm">This section is under development.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
