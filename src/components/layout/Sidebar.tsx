import { useProcessing } from '../../context/ProcessingContext';
import { History, ChevronRight, Trash2, Loader2, Eraser } from 'lucide-react';

interface SidebarProps {
  history: Array<{ doc_hash: string; tipo: string; filename?: string; created_at: string }>;
  loadDocument: (docHash: string) => void;
  deleteDocument: (docHash: string) => void;
  onClearHistoryLocal: () => void;
}

export default function Sidebar({ history, loadDocument, deleteDocument, onClearHistoryLocal }: SidebarProps) {
  const { isProcessing } = useProcessing();

  return (
    <aside 
      className="w-full h-full min-h-[400px] md:flex flex-col hidden transition-colors"
      style={{ backgroundColor: 'var(--nav-header-bg)' }}
    >
      <div className="p-5 border-b border-slate-200/50 flex items-center justify-between font-bold bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-slate-800">
           <History size={18} className="text-emerald-600" />
           <span>Histórico</span>
        </div>
        
        {history?.length > 0 && (
          <button 
             onClick={onClearHistoryLocal}
             className="text-slate-400 hover:text-emerald-500 transition-colors p-1.5 rounded-md hover:bg-emerald-50"
             title="Limpar Histórico da Tela"
          >
             <Eraser size={16} />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 relative no-scrollbar">
        
        {/* Card Fake de Processamento */}
        {isProcessing && (
          <div className="w-full text-left p-3 rounded-lg bg-emerald-50 border border-emerald-200 shadow-sm flex items-center justify-between animate-pulse">
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-emerald-800 flex items-center gap-1.5"><Loader2 size={14} className="animate-spin" /> Analisando Documento...</p>
              <p className="text-xs text-emerald-600 mt-0.5">Extraindo via IA</p>
            </div>
          </div>
        )}

        {!history || history.length === 0 && !isProcessing ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <History size={32} className="mb-2 opacity-20" />
            <p className="text-sm font-medium">Nenhum documento</p>
          </div>
        ) : (
          history?.map((doc, idx) => (
            <div
              key={idx}
              className="w-full text-left p-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all shadow-sm hover:shadow flex items-center justify-between group"
            >
              <button 
                onClick={() => loadDocument(doc.doc_hash)}
                className="flex-1 overflow-hidden"
              >
                <p className="text-sm font-medium text-slate-700 capitalize truncate text-left">{doc.filename || doc.tipo}</p>
                <p className="text-xs text-slate-500 mt-0.5 text-left">{new Date(doc.created_at).toLocaleDateString()}</p>
              </button>
              
              <div className="flex gap-1">
                <button
                  onClick={() => deleteDocument(doc.doc_hash)}
                  className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                  title="Excluir Histórico"
                >
                  <Trash2 size={16} />
                </button>
                <button 
                  onClick={() => loadDocument(doc.doc_hash)}
                  className="p-1.5 text-slate-300 group-hover:text-emerald-500 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
