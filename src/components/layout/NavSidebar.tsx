import { Home, PlusCircle, PieChart, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function NavSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserInitial = () => {
    if (user?.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    if (user && user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };
  
  const getDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.email || 'Usuário';
  };
  const routes = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Nova Análise', path: '/new', icon: <PlusCircle size={20} /> },
  ];

  return (
    <aside className="w-20 md:w-64 bg-slate-900 text-slate-300 h-screen flex flex-col shadow-xl flex-shrink-0 transition-all">
      <div className="p-4 md:p-6 border-b border-slate-800 flex items-center justify-center md:justify-start">
        <PieChart size={24} className="text-emerald-400" />
        <span className="ml-3 font-bold text-white text-lg hidden md:block tracking-tight">FinAnalyzer</span>
      </div>
      
      <nav className="flex-1 px-3 py-6 space-y-2">
        {routes.map((r) => (
          <NavLink
            key={r.path}
            to={r.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 font-medium' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <div className="flex items-center justify-center min-w-[24px]">
              {r.icon}
            </div>
            <span className="hidden md:block">{r.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-800 flex flex-col items-center md:items-start md:flex-row md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700">
            <span className="text-slate-300 font-bold text-sm">{getUserInitial()}</span>
          </div>
          <div className="hidden md:block overflow-hidden">
            <p className="text-sm font-medium text-slate-300 truncate w-full" title={getDisplayName()}>
              {getDisplayName()}
            </p>
            <p className="text-xs text-slate-500">
              {user?.is_admin === "1" ? "Administrador" : "Membro"}
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="Sair do sistema"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
