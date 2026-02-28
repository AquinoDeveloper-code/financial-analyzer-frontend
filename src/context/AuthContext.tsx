import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_admin: string;
  is_active: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Configuração do interceptador global do Axios
const setupAxiosInterceptors = (token: string | null, logoutCallback: () => void) => {
  axios.interceptors.request.clear();
  axios.interceptors.response.clear();

  if (token) {
    axios.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Se der 401 Unauthorized, forçar logout
      if (error.response && error.response.status === 401) {
        logoutCallback();
      }
      return Promise.reject(error);
    }
  );
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    setupAxiosInterceptors(null, logout);
  };

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('auth_token', newToken);
    setupAxiosInterceptors(newToken, logout);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
        const res = await axios.get(`${apiUrl}/auth/me`);
        setUser(res.data);
      } catch { /* ignore */ }
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        setupAxiosInterceptors(token, logout);
        try {
          const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
          const res = await axios.get(`${apiUrl}/auth/me`);
          setUser(res.data);
        } catch (error) {
          console.error("Token inválido ou expirado", error);
          logout();
        }
      }
      setIsLoading(false);
    };
    fetchUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, isAuthenticated: !!token, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
