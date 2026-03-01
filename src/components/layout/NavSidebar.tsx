import { Home, PlusCircle, PieChart, LogOut, PiggyBank, User, Users, TrendingUp, Globe, ArrowRightLeft } from 'lucide-react';
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
  const categorizedRoutes = [
    {
      category: 'Home',
      items: [
        { name: 'Central', path: '/', icon: <Home size={20} /> },
      ]
    },
    {
      category: 'Ferramentas',
      items: [
        { name: 'Nova Análise', path: '/new', icon: <PlusCircle size={20} /> },
        { name: 'Conciliação', path: '/reconciliation', icon: <ArrowRightLeft size={20} /> },
        { name: 'Carteira & Metas', path: '/goals', icon: <PiggyBank size={20} /> },
      ]
    },
    {
      category: 'Dados',
      items: [
        { name: 'Câmbio & Forex', path: '/forex', icon: <Globe size={20} /> },
        { name: 'Inteligência (IA)', path: '/market', icon: <TrendingUp size={20} /> },
      ]
    },
    {
      category: 'Outros',
      items: [
        { name: 'Comunidade', path: '/community', icon: <Users size={20} /> },
      ]
    },
    {
      category: 'Config',
      items: [
        { name: 'Meu Perfil', path: '/profile', icon: <User size={20} /> },
      ]
    }
  ];

  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8000';
  const avatarSrc = user?.avatar_url ? `${backendBaseUrl}${user.avatar_url}` : null;

  return (
    <aside 
      className="w-20 md:w-64 text-slate-300 h-screen flex flex-col shadow-xl flex-shrink-0 transition-all font-nav border-r border-slate-800/50"
      style={{ backgroundColor: 'var(--nav-sidebar-bg)' }}
    >
      <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-center md:justify-start">
        <PieChart size={24} className="text-emerald-400" />
        <span className="ml-3 font-bold text-white text-lg hidden md:block tracking-tight">FinAnalyzer</span>
      </div>
      
      <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto custom-scrollbar">
        {categorizedRoutes.map((section) => (
          <div key={section.category} className="space-y-1">
            <h4 className="hidden md:block px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {section.category}
            </h4>
            {section.items.map((r) => (
              <NavLink
                key={r.path}
                to={r.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
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
          </div>
        ))}
      </nav>
      
      <div className="p-4 border-t border-white/10 flex flex-col items-center md:items-start md:flex-row md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700 hover:border-emerald-500 transition-all overflow-hidden"
            title="Ver Perfil"
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-slate-300 font-bold text-sm">{getUserInitial()}</span>
            )}
          </button>
          <div className="hidden md:block overflow-hidden">
            <p className="text-sm font-medium text-slate-300 truncate w-[100px]" title={getDisplayName()}>
              {getDisplayName()}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.is_admin === "1" ? "Administrador" : "Membro"}
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
          title="Sair do sistema"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
