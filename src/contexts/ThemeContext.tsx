import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type AccentColor = 'emerald' | 'violet' | 'red';

interface ThemeContextType {
  theme: 'light' | 'dark';
  accent: AccentColor;
  toggleTheme: () => void;
  setAccent: (c: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [accent, setAccent] = useState<AccentColor>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('accent') as AccentColor) || 'violet';
    }
    return 'violet';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('accent', accent);
    // Set CSS variable for accent color
    const root = document.documentElement;
    const colors = {
      violet: { '--accent-500': '#8b5cf6', '--accent-600': '#7c3aed', '--accent-700': '#6d28d9' },
      emerald: { '--accent-500': '#10b981', '--accent-600': '#059669', '--accent-700': '#047857' },
      red: { '--accent-500': '#ef4444', '--accent-600': '#dc2626', '--accent-700': '#b91c1c' },
    };
    const c = colors[accent];
    Object.entries(c).forEach(([key, val]) => root.style.setProperty(key, val));
  }, [accent]);

  function toggleTheme() {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }

  return (
    <ThemeContext.Provider value={{ theme, accent, toggleTheme, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}