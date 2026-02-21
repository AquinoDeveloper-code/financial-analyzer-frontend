import { History, ChevronRight } from 'lucide-react';

interface SidebarProps {
  history: Array<{ doc_hash: string; tipo: string; created_at: string }>;
  loadDocument: (docHash: string) => void;
}

export default function Sidebar({ history, loadDocument }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 md:flex flex-col hidden shadow-sm">
      <div className="p-5 border-b border-slate-100 flex items-center gap-2 text-slate-800 font-bold bg-slate-50">
        <History size={18} className="text-emerald-600" />
        <span>Histórico</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 relative no-scrollbar">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <History size={32} className="mb-2 opacity-20" />
            <p className="text-sm font-medium">Nenhum documento</p>
          </div>
        ) : (
          history.map((doc, idx) => (
            <button
              key={idx}
              onClick={() => loadDocument(doc.doc_hash)}
              className="w-full text-left p-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all shadow-sm hover:shadow flex items-center justify-between group"
            >
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-slate-700 capitalize truncate">{doc.tipo}</p>
                <p className="text-xs text-slate-500 mt-0.5">{new Date(doc.created_at).toLocaleDateString()}</p>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 flex-shrink-0" />
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
