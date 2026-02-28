import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Info, AlertTriangle } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
  date: string;
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Exemplo de mockup de notificações
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Bem-vindo(a)!',
      message: 'Explore o novo painel de Inteligência de Mercado.',
      type: 'info',
      read: false,
      date: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Atualização do Sistema',
      message: 'O widget de cotações em tempo real está online.',
      type: 'success',
      read: false,
      date: new Date(Date.now() - 3600000).toISOString() 
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    if (type === 'warning') return <AlertTriangle size={16} className="text-amber-500" />;
    if (type === 'success') return <Check size={16} className="text-emerald-500" />;
    return <Info size={16} className="text-blue-500" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:bg-slate-200 rounded-full transition-colors flex-shrink-0 focus:outline-none"
        title="Notificações"
      >
        <Bell size={20} className={unreadCount > 0 ? "text-indigo-500" : ""} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 w-2 h-2 bg-rose-500 border border-white rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden font-sans origin-top-right animate-in fade-in slide-in-from-top-2">
          
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Bell size={18} className="text-indigo-500"/>
              Notificações
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 rounded-full">
                  {unreadCount} Novas
                </span>
              )}
            </h3>
            
            <div className="flex gap-2">
              <button 
                onClick={markAllAsRead} 
                className="text-xs font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                title="Marcar todas como lidas"
              >
                Lido
              </button>
              <span className="text-slate-300">|</span>
              <button 
                onClick={clearAll}
                className="text-xs font-medium text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
                title="Limpar Histórico"
              >
                Limpar
              </button>
            </div>
          </div>

          <div className="max-h-[350px] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-800">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 opacity-60">
                <Bell size={32} strokeWidth={1} className="text-slate-400 mb-2"/>
                <p className="text-slate-500 text-sm font-medium">Nenhuma notificação por aqui.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                {notifications.map(n => (
                  <li 
                    key={n.id} 
                    className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex gap-3 ${!n.read ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className="mt-1 flex-shrink-0">
                      <div className={`p-1.5 rounded-full ${!n.read ? 'bg-white shadow-sm border border-slate-100 dark:border-slate-600 dark:bg-slate-700' : 'bg-transparent'}`}>
                        {getIcon(n.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">
                        {new Date(n.date).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!n.read && (
                       <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0 self-start"></div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-center">
            <p className="text-xs text-slate-500">Configurar preferências de aviso no Perfil.</p>
          </div>
        </div>
      )}
    </div>
  );
}
