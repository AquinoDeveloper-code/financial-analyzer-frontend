import { TrendingUp, Settings, Home, Shield } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationCenter from './NotificationCenter';

interface HeaderProps {
  onOpenSettings: () => void;
}

export default function Header({ onOpenSettings }: HeaderProps) {
  const { themeBase } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth() as any;

  // Função helper para retornar a cor baseada no tema
  const getThemeClasses = () => {
    if (themeBase === 'emerald') return 'bg-emerald-100 text-emerald-700';
    if (themeBase === 'blue') return 'bg-blue-100 text-blue-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <header 
      className="sticky top-0 z-10 border-b border-slate-200 px-6 py-4 md:px-8 shadow-sm transition-colors"
      style={{ backgroundColor: 'var(--nav-header-bg)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-white/80 rounded-lg px-2 text-slate-800 flex items-center gap-2">
            <span className={`p-1.5 rounded-lg ${getThemeClasses()}`}>
              <TrendingUp size={20} />
            </span>
            Analisador Financeiro IA
          </h1>
          <p className="text-sm font-medium text-slate-600 bg-white/60 rounded px-2 w-max mt-1">
            Transforme faturas e extratos em dados estruturados
          </p>
        </div>



        <div className="flex items-center gap-2 mt-4 md:mt-0 ml-auto md:ml-0 bg-white/80 p-1.5 rounded-full shadow-sm">
          {user?.is_admin === '1' && (
            <button 
              onClick={() => navigate('/admin')}
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors flex-shrink-0"
              title="Painel Administrativo"
            >
              <Shield size={20} />
            </button>
          )}
          <button 
            onClick={() => navigate('/')}
            className="p-2 text-slate-600 hover:bg-slate-200 rounded-full transition-colors flex-shrink-0"
            title="Ir para Home"
          >
            <Home size={20} />
          </button>
          
          <NotificationCenter />
          
          <button 
            onClick={onOpenSettings}
            className="p-2 text-slate-600 hover:bg-slate-200 rounded-full transition-colors flex-shrink-0"
            title="Configurações e Sistema"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
