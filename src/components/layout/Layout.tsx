import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  history: Array<{ doc_hash: string; tipo: string; created_at: string }>;
  loadDocument: (docHash: string) => void;
  stats: {
    total_documents_processed: number;
    average_processing_time_ms: number;
  } | null;
}

export default function Layout({ children, history, loadDocument, stats }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      <Sidebar history={history} loadDocument={loadDocument} />
      
      <div className="flex-1 overflow-y-auto h-screen flex flex-col">
        <Header stats={stats} />
        <main className="flex-1 p-6 md:p-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
