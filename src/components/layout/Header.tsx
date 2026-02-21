import { TrendingUp, FileText, Activity } from 'lucide-react';

interface HeaderProps {
  stats: {
    total_documents_processed: number;
    average_processing_time_ms: number;
  } | null;
}

export default function Header({ stats }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 md:px-8 shadow-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700">
              <TrendingUp size={20} />
            </span>
            Analisador Financeiro IA
          </h1>
          <p className="text-sm text-slate-500 mt-1 pl-1">
            Transforme faturas e extratos em dados estruturados
          </p>
        </div>

        {stats && (
          <div className="flex gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm">
            <div className="flex flex-col px-2">
              <span className="text-slate-500 font-medium flex items-center gap-1.5 mb-0.5">
                <FileText size={14} className="text-slate-400" />
                Lidos
              </span>
              <span className="font-bold text-slate-800 text-base">{stats.total_documents_processed}</span>
            </div>
            <div className="w-px bg-slate-200"></div>
            <div className="flex flex-col px-2">
              <span className="text-slate-500 font-medium flex items-center gap-1.5 mb-0.5">
                <Activity size={14} className="text-emerald-500" />
                Velocidade IA
              </span>
              <span className="font-bold text-emerald-700 text-base">
                {(stats.average_processing_time_ms / 1000).toFixed(2)}s
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
