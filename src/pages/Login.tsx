import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PieChart, Mail, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', email); // OAuth2 expects 'username' instead of 'email'
      formData.append('password', password);

      const response = await axios.post(`${apiUrl}/auth/login`, formData);
      const { access_token } = response.data;
      
      // Fetch user data directly after login
      const userResp = await axios.get(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      login(access_token, userResp.data);
      navigate('/');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Erro ao conectar. Tente novamente.");
      } else {
        setError("Ocorreu um erro inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div>
          <div className="mx-auto flex flex-col items-center justify-center gap-3">
            <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
              <PieChart size={36} className="text-emerald-400" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-2">FinAnalyzer</h1>
          </div>
          <h2 className="mt-8 text-center text-xl font-bold text-slate-700">
            Acesse o sistema
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Análises automáticas de faturas e extratos
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4 rounded-md shadow-sm">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                id="email-address"
                name="email"
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full px-10 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="Endereço de e-mail ou usuário"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-xl relative block w-full px-10 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !email || !password}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Acessando...' : 'Entrar'}
            </button>
          </div>
          
          <div className="text-center text-sm text-slate-500">
            Não possui uma conta? {' '}
            <Link to="/register" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
              Cadastre-se aqui
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
