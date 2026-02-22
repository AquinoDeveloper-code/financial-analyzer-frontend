import { Home, PlusCircle, PieChart } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function NavSidebar() {
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
      
      <div className="p-4 border-t border-slate-800 text-center md:text-left">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto md:mx-0">
          <span className="text-slate-400 font-bold text-sm">US</span>
        </div>
      </div>
    </aside>
  );
}
