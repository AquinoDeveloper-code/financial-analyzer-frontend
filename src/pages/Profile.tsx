import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Lock, Save, Shield, Calendar, Mail, Camera } from 'lucide-react';
import AchievementBadges from '../components/profile/AchievementBadges';

const backendBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '');

interface LayoutContext {
  apiUrl: string;
}

export default function Profile() {
  const { apiUrl } = useOutletContext<LayoutContext>();
  const { user, refreshUser } = useAuth() as any;

  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
    }
  }, [user]);

  const getInitials = () => {
    const f = firstName?.charAt(0) || '';
    const l = lastName?.charAt(0) || '';
    return (f + l).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (user?.avatar_url) {
       // Cache busting to ensure newly uploaded avatars render immediately
       return `${backendBaseUrl}${user.avatar_url}?t=${new Date().getTime()}`;
    }
    return null;
  };

  const avatarSrc = getAvatarUrl();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Imagem muito grande. Máximo 5MB.'); return; }

    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axios.post(`${apiUrl}/auth/me/avatar`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (refreshUser) await refreshUser();
      toast.success('Foto atualizada!');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Erro ao enviar foto.');
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm('Deseja remover sua foto de perfil?')) return;
    setUploadingAvatar(true);
    try {
      await axios.delete(`${apiUrl}/auth/me/avatar`);
      if (refreshUser) await refreshUser();
      setAvatarPreview(null);
      toast.success('Foto removida!');
    } catch (err: any) {
      toast.error('Erro ao remover foto.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await axios.put(`${apiUrl}/auth/me`, { first_name: firstName, last_name: lastName });
      if (refreshUser) await refreshUser();
      toast.success('Perfil atualizado com sucesso!');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Erro ao salvar perfil.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('As senhas novas não coincidem.'); return; }
    if (newPassword.length < 4) { toast.error('A nova senha deve ter pelo menos 4 caracteres.'); return; }
    setIsSavingPassword(true);
    try {
      await axios.put(`${apiUrl}/auth/me`, { current_password: currentPassword, new_password: newPassword });
      toast.success('Senha alterada com sucesso!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Erro ao alterar senha.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="col-span-1 lg:col-span-3 w-full max-w-[960px] mx-auto space-y-6">
      {/* Header with avatar */}
      <div className="flex items-center gap-5">
        <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt="Avatar"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-sm"
              style={{ background: 'linear-gradient(135deg, #10b981, #0f766e)' }}
            >
              {getInitials()}
            </div>
          )}
          {/* Overlay */}
          <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {uploadingAvatar
              ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
              : <Camera size={20} className="text-white" />}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {firstName || lastName ? `${firstName} ${lastName}`.trim() : user?.email || 'Meu Perfil'}
          </h1>
          <p className="text-slate-500 text-sm">
            {user?.is_admin === '1' ? '🛡️ Administrador' : '👤 Membro'}
          </p>
          <p className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-3">
            <span className="cursor-pointer hover:underline" onClick={() => fileRef.current?.click()}>
              {uploadingAvatar ? 'Enviando...' : '📷 Alterar foto'}
            </span>
            {user?.avatar_url && !uploadingAvatar && (
              <span className="cursor-pointer text-rose-500 hover:underline" onClick={handleDeleteAvatar}>
                🗑️ Remover
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info Form */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-5 flex items-center gap-2">
            <User size={18} className="text-emerald-500" />
            Informações do Perfil
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nome</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="Seu nome" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Sobrenome</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="Seu sobrenome" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><Mail size={12} /> E-mail</label>
              <input type="email" value={user?.email || ''} disabled
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-400 cursor-not-allowed" />
              <p className="text-xs text-slate-400 mt-1">O e-mail não pode ser alterado.</p>
            </div>
            <button type="submit" disabled={isSavingProfile}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              <Save size={16} />
              {isSavingProfile ? 'Salvando...' : 'Salvar Perfil'}
            </button>
          </form>
        </div>

        {/* Password Form */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-5 flex items-center gap-2">
            <Lock size={18} className="text-emerald-500" />
            Alterar Senha
          </h2>
          <form onSubmit={handleSavePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Senha Atual</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Nova Senha</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Confirmar Nova Senha</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-1 ${confirmPassword && confirmPassword !== newPassword ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500'}`}
                placeholder="••••••••" />
              {confirmPassword && confirmPassword !== newPassword && <p className="text-xs text-rose-500 mt-1">As senhas não coincidem.</p>}
            </div>
            <button type="submit" disabled={isSavingPassword}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              <Lock size={16} />
              {isSavingPassword ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </form>
        </div>

        {/* Account Info Card */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Shield size={18} className="text-emerald-500" />
            Informações da Conta
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Calendar size={11} /> Membro desde</p>
              <p className="font-semibold text-slate-800 text-sm">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Nível de Acesso</p>
              <p className="font-semibold text-slate-800 text-sm">{user?.is_admin === '1' ? '🛡️ Administrador' : '👤 Membro'}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Status da Conta</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="font-semibold text-emerald-600 text-sm">Ativa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Badges - full width */}
        <div className="md:col-span-2">
          <AchievementBadges />
        </div>
      </div>
    </div>
  );
}
