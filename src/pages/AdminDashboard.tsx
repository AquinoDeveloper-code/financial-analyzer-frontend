import { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Shield, Settings, Save, Key, MessageSquare, AlertTriangle, RefreshCcw } from 'lucide-react';

interface LayoutContext {
  apiUrl: string;
}

interface SystemSetting {
  key: string;
  value: string;
  description: string;
  category: string;
  updated_at: string;
}

export default function AdminDashboard() {
  const { apiUrl } = useOutletContext<LayoutContext>();
  const { user } = useAuth() as any;
  const navigate = useNavigate();

  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'users'>('settings');

  useEffect(() => {
    if (!user || user.is_admin !== '1') {
      toast.error('Acesso não autorizado');
      navigate('/');
      return;
    }
    fetchSettings();
    fetchUsers(usersPage);
  }, [user, usersPage]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${apiUrl}/admin/settings`);
      setSettings(response.data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchUsers = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/admin/users?page=${page}&limit=10`);
      setUsersList(response.data.users);
      setTotalUsers(response.data.total);
    } catch (err: any) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    setIsSaving(key);
    try {
      await axios.put(`${apiUrl}/admin/settings/${key}`, { value });
      toast.success('Configuração atualizada!');
      fetchSettings();
    } catch (err: any) {
      toast.error('Erro ao salvar configuração');
    } finally {
      setIsSaving(null);
    }
  };

  const categories = Array.from(new Set(settings.map(s => s.category)));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCcw className="animate-spin text-emerald-500 mb-4" size={32} />
        <p className="text-slate-500">Carregando painel administrativo...</p>
      </div>
    );
  }

  return (
    <div className="col-span-1 lg:col-span-3 w-full max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Painel de Administração</h1>
            <p className="text-slate-500 text-sm">Gerencie prompts, credenciais e configurações dinâmicas.</p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'settings' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Configurações do Sistema
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'users' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Gerenciar Usuários
        </button>
      </div>

      {activeTab === 'settings' && (
        <div className="space-y-8">
          {categories.map(category => (
            <div key={category} className="space-y-4">
              <h2 className="text-lg font-bold text-slate-700 capitalize flex items-center gap-2">
                {category === 'credentials' && <Key size={20} className="text-amber-500" />}
                {category === 'prompts' && <MessageSquare size={20} className="text-blue-500" />}
                {category === 'general' && <Settings size={20} className="text-slate-500" />}
                {category}
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {settings.filter(s => s.category === category).map(setting => (
                  <SettingCard 
                    key={setting.key} 
                    setting={setting} 
                    onSave={handleUpdateSetting}
                    isSaving={isSaving === setting.key}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'users' && (
         <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold">Usuário</th>
                    <th className="px-6 py-4 font-bold">E-mail</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Nível</th>
                    <th className="px-6 py-4 font-bold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                          {u.first_name?.[0] || u.email[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-700">{u.first_name} {u.last_name}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${u.is_active === '1' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {u.is_active === '1' ? 'ATIVO' : 'INATIVO'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${u.is_admin === '1' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                          {u.is_admin === '1' ? 'ADMIN' : 'USUÁRIO'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={async () => {
                            try {
                              await axios.put(`${apiUrl}/admin/users/${u.id}/admin?is_admin=${u.is_admin === '1' ? 'false' : 'true'}`);
                              toast.success('Permissão alterada!');
                              fetchUsers(usersPage);
                            } catch {
                              toast.error('Erro ao alterar permissão');
                            }
                          }}
                          className="text-emerald-600 hover:text-emerald-700 font-bold text-xs hover:underline"
                        >
                          {u.is_admin === '1' ? 'Remover Admin' : 'Tornar Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Mostrando {usersList.length} de {totalUsers} usuários
              </span>
              <div className="flex items-center gap-2">
                <button 
                  disabled={usersPage === 1}
                  onClick={() => setUsersPage(prev => prev - 1)}
                  className="p-1 rounded border border-slate-300 bg-white disabled:opacity-50 text-slate-600 hover:bg-slate-50"
                >
                  <RefreshCcw size={14} className="rotate-180" />
                </button>
                <span className="text-xs font-bold text-slate-700">Página {usersPage}</span>
                <button 
                  disabled={usersPage * 10 >= totalUsers}
                  onClick={() => setUsersPage(prev => prev + 1)}
                  className="p-1 rounded border border-slate-300 bg-white disabled:opacity-50 text-slate-600 hover:bg-slate-50"
                >
                  <RefreshCcw size={14} />
                </button>
              </div>
            </div>
         </div>
      )}
    </div>
  );
}

function SettingCard({ setting, onSave, isSaving }: { setting: SystemSetting, onSave: (key: string, value: string) => void, isSaving: boolean }) {
  const [value, setValue] = useState(setting.value);
  const isDirty = value !== setting.value;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="p-5 border-b border-slate-50 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <code className="text-xs font-bold bg-slate-200 px-2 py-1 rounded text-slate-600 uppercase">{setting.key}</code>
          </div>
          <span className="text-[10px] text-slate-400">
            Atualizado em: {new Date(setting.updated_at).toLocaleString('pt-BR')}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-500">{setting.description || 'Nenhuma descrição fornecida.'}</p>
      </div>
      <div className="p-5 space-y-4">
        {setting.category === 'prompts' ? (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full min-h-[120px] px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            placeholder="Insira o texto do prompt..."
          />
        ) : (
          <input
            type={setting.key.includes('KEY') || setting.key.includes('TOKEN') ? 'password' : 'text'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        )}
        
        <div className="flex justify-end items-center gap-3">
          {isDirty && (
            <span className="text-xs text-amber-500 flex items-center gap-1 animate-pulse">
              <AlertTriangle size={12} /> Alterações não salvas
            </span>
          )}
          <button
            onClick={() => onSave(setting.key, value)}
            disabled={!isDirty || isSaving}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold py-2 px-4 rounded-lg transition-all shadow-sm"
          >
            {isSaving ? (
              <RefreshCcw size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {isSaving ? 'Salvando...' : 'Salvar Alteração'}
          </button>
        </div>
      </div>
    </div>
  );
}
