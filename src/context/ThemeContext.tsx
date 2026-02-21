import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

type ThemeContextType = {
  themeBase: string;
};

const ThemeContext = createContext<ThemeContextType>({ themeBase: 'emerald' });

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeBase, setThemeBase] = useState('emerald');
  const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

  useEffect(() => {
    // Buscar o tema global no boot
    const fetchConfig = async () => {
      try {
        const response = await axios.get(`${apiUrl}/system/config`);
        setThemeBase(response.data.data.ui_theme || 'emerald');
      } catch {
        console.warn("ThemeProvider: API backend indisponível para config de cores");
      }
    };
    fetchConfig();
  }, [apiUrl]);

  return (
    <ThemeContext.Provider value={{ themeBase }}>
      <div className={`theme-${themeBase}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
