import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { ThemeMode } from './types';

interface ThemeCtx {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  toggle: () => void;
  diaryFont: string;
  setDiaryFont: (f: string) => void;
}

const ThemeContext = createContext<ThemeCtx>({
  theme: 'light',
  setTheme: () => {},
  toggle: () => {},
  diaryFont: '',
  setDiaryFont: () => {},
});

function resolveTheme(mode: ThemeMode): 'light' | 'dark' | 'neon' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

function applyThemeClass(resolved: 'light' | 'dark' | 'neon') {
  const root = document.documentElement;
  root.classList.remove('dark', 'neon');
  if (resolved === 'dark') root.classList.add('dark');
  else if (resolved === 'neon') { root.classList.add('dark'); root.classList.add('neon'); }
}

function applyFont(font: string) {
  const root = document.documentElement;
  if (font) {
    root.style.setProperty('--diary-font', `'${font}', cursive`);
  } else {
    root.style.removeProperty('--diary-font');
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('dd-theme') as ThemeMode | null;
    return saved || 'light';
  });

  const [diaryFont, setDiaryFontState] = useState<string>(() => {
    return localStorage.getItem('dd-diary-font') || '';
  });

  useEffect(() => {
    const resolved = resolveTheme(theme);
    applyThemeClass(resolved);
    localStorage.setItem('dd-theme', theme);

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyThemeClass(mq.matches ? 'dark' : 'light');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  useEffect(() => {
    applyFont(diaryFont);
    localStorage.setItem('dd-diary-font', diaryFont);
  }, [diaryFont]);

  const setTheme = (t: ThemeMode) => setThemeState(t);
  const toggle = () => setThemeState((t) => (t === 'light' ? 'dark' : t === 'dark' ? 'neon' : 'light'));
  const setDiaryFont = (f: string) => setDiaryFontState(f);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle, diaryFont, setDiaryFont }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
