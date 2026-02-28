import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { History } from 'lucide-react';
import UploadSection from '../components/dashboard/UploadSection';
import Sidebar from '../components/layout/Sidebar';
import { useProcessing } from '../context/ProcessingContext';

interface LayoutContext {
  refreshLayout: () => void;
  apiUrl: string;
  stats: any;
  history: Array<{ doc_hash: string; tipo: string; created_at: string }>;
  loadDocument: (docHash: string) => void;
  deleteDocument: (docHash: string) => void;
  clearHistoryLocal: () => void;
}

export default function NewDocument() {
  const { apiUrl, refreshLayout, stats, history, loadDocument, deleteDocument, clearHistoryLocal } = useOutletContext<LayoutContext>();
  const { isProcessing, processDocument } = useProcessing();
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    await processDocument(formData, apiUrl, refreshLayout);
  };

  return (
    <div className="col-span-1 lg:col-span-3 w-full relative">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Nova Análise Inteligente</h2>
          <p className="text-slate-500 mt-1">Faça o upload de um PDF ou cole o texto de uma fatura para estruturar os dados com a Inteligência Artificial.</p>
        </div>
        
        <button 
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className={`p-2 rounded-lg transition-colors flex-shrink-0 flex items-center gap-2 border ${isHistoryOpen ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          title="Alternar Painel de Histórico"
        >
          <History size={20} />
          <span className="text-sm font-medium hidden md:block">Histórico</span>
        </button>
      </div>

      <div className="w-full flex flex-col md:flex-row gap-6 relative">
        <div className="flex-1 w-full animate-fade-in transition-all duration-300">
          <UploadSection
            handleFileUpload={handleFileUpload}
            loading={isProcessing}
            stats={stats}
          />
        </div>

        {/* Embedded Contextual Sidebar */}
        <div className={`transition-all duration-300 ease-in-out ${isHistoryOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
          <div className="w-64 h-[500px] sticky top-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white">
            <Sidebar 
            history={history} 
            loadDocument={loadDocument} 
            deleteDocument={deleteDocument} 
            onClearHistoryLocal={clearHistoryLocal} 
          />
        </div>
        </div>
      </div>
    </div>
  );
}
