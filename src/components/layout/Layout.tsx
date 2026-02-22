import React, { useState } from 'react';
import Sidebar from './Sidebar';
import NavSidebar from './NavSidebar';
import Header from './Header';
import SettingsModal from './SettingsModal';

interface LayoutProps {
  children: React.ReactNode;
  history: Array<{ doc_hash: string; tipo: string; created_at: string }>;
  loadDocument: (docHash: string) => void;
  deleteDocument: (docHash: string) => void;
  stats: {
    total_documents_processed: number;
    average_processing_time_ms: number;
  } | null;
}

export default function Layout({ children, history, loadDocument, deleteDocument, stats }: LayoutProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* Left Navigation Menu */}
      <NavSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300">
        <Header 
          stats={stats} 
          onOpenSettings={() => setIsSettingsOpen(true)} 
          onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
          isHistoryOpen={isHistoryOpen}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            {children}
          </div>
        </main>
      </div>

      {/* Right History Panel (Toggleable) */}
      <div className={`transition-all duration-300 ease-in-out border-l border-slate-200 bg-white ${isHistoryOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden border-none'}`}>
        <div className="w-80 h-full"> 
          <Sidebar history={history} loadDocument={loadDocument} deleteDocument={deleteDocument} />
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        apiUrl={apiUrl} 
      />
    </div>
  );
}
