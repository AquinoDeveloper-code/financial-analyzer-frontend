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
  onClearHistoryLocal: () => void;
}

export default function Layout({ children, history, loadDocument, deleteDocument, onClearHistoryLocal }: LayoutProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

  return (
    <div className="flex print:h-auto print:block print:overflow-visible h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* Left Navigation Menu */}
      <NavSidebar />

      {/* Main Content Area */}
      <div className="flex-1 print:h-auto print:block print:overflow-visible flex flex-col h-full overflow-hidden transition-all duration-300">
        <Header 
          onOpenSettings={() => setIsSettingsOpen(true)} 
        />
        
        <main className="flex-1 print:overflow-visible overflow-y-auto p-4 md:p-6">
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
            {children}
          </div>
        </main>
      </div>

      <div className="hidden">
        {/* We are hiding the right panel wrapper from the global layout so History is managed by children */}
        <Sidebar history={history} loadDocument={loadDocument} deleteDocument={deleteDocument} onClearHistoryLocal={onClearHistoryLocal} />
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        apiUrl={apiUrl} 
      />
    </div>
  );
}
