import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

// theme type definitions
export type Theme = 'dark' | 'light';

export interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// create theme context
export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('jqube_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    // default to dark mode for premium tech feel
    return 'dark';
  });

  // sync theme class to document root
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('jqube_theme', theme);
  }, [theme]);

  // toggle theme handler
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // set theme handler
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  // memoized context value
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme,
      setTheme,
    }),
    [theme, toggleTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
