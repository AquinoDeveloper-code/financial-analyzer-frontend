import { TrendingUp, FileText, Activity, Settings, Home, History } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  stats: {
    total_documents_processed: number;
    average_processing_time_ms: number;
  } | null;
  onOpenSettings: () => void;
  onToggleHistory: () => void;
  isHistoryOpen: boolean;
}

export default function Header({ stats, onOpenSettings, onToggleHistory, isHistoryOpen }: HeaderProps) {
  const { themeBase } = useTheme();
  const navigate = useNavigate();

  // Função helper para retornar a cor baseada no tema
  const getThemeClasses = () => {
    if (themeBase === 'emerald') return 'bg-emerald-100 text-emerald-700';
    if (themeBase === 'blue') return 'bg-blue-100 text-blue-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 md:px-8 shadow-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span className={`p-1.5 rounded-lg ${getThemeClasses()}`}>
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

        <div className="flex items-center gap-2 mt-4 md:mt-0 ml-auto md:ml-0">
          <button 
            onClick={() => navigate('/')}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
            title="Ir para Home"
          >
            <Home size={20} />
          </button>
          
          <button 
            onClick={onOpenSettings}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
            title="Configurações e Sistema"
          >
            <Settings size={20} />
          </button>

          <div className="w-px h-6 bg-slate-200 mx-1"></div>

          <button 
            onClick={onToggleHistory}
            className={`p-2 rounded-full transition-colors flex-shrink-0 flex items-center gap-2 ${isHistoryOpen ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-100'}`}
            title="Alternar Histórico"
          >
            <History size={20} />
            <span className="text-sm font-medium hidden md:block pr-1">Histórico</span>
          </button>
        </div>
      </div>
    </header>
  );
}
