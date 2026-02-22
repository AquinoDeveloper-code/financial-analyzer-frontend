import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// Helper function to convert Hex to HSL arrays for Tailwind v4 
// Tailwinds v4 maps its colors differently, but we can override the slate variables with our own hex
// For simplicity, we'll map the base hex to the primary 500-700 range and lighten/darken the others
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function adjustColor(color: {r: number, g: number, b: number}, amount: number) {
  return {
    r: Math.max(0, Math.min(255, color.r + amount)),
    g: Math.max(0, Math.min(255, color.g + amount)),
    b: Math.max(0, Math.min(255, color.b + amount))
  };
}

function toRgbString(color: {r: number, g: number, b: number}) {
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
}


type ThemeContextType = {
  themeBase: string;
  setThemeBase: (theme: string) => void;
};

const ThemeContext = createContext<ThemeContextType>({ 
  themeBase: 'emerald',
  setThemeBase: () => {} 
});

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

  const customStyles = useMemo(() => {
    if (!themeBase.startsWith('#')) return {};
    
    const baseColor = hexToRgb(themeBase);
    if (!baseColor) return {};

    // Create a dynamic scale based on the hex color
    return {
      '--color-emerald-50': toRgbString(adjustColor(baseColor, 150)),
      '--color-emerald-100': toRgbString(adjustColor(baseColor, 120)),
      '--color-emerald-200': toRgbString(adjustColor(baseColor, 90)),
      '--color-emerald-300': toRgbString(adjustColor(baseColor, 60)),
      '--color-emerald-400': toRgbString(adjustColor(baseColor, 30)),
      '--color-emerald-500': toRgbString(baseColor),
      '--color-emerald-600': toRgbString(adjustColor(baseColor, -30)),
      '--color-emerald-700': toRgbString(adjustColor(baseColor, -60)),
      '--color-emerald-800': toRgbString(adjustColor(baseColor, -90)),
      '--color-emerald-900': toRgbString(adjustColor(baseColor, -120)),
    } as React.CSSProperties;
  }, [themeBase]);

  const themeClass = themeBase.startsWith('#') ? 'theme-custom' : `theme-${themeBase}`;

  return (
    <ThemeContext.Provider value={{ themeBase, setThemeBase }}>
      <div className={themeClass} style={customStyles}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
