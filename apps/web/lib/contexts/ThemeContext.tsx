'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to apply theme to DOM (defined outside component for stability)
function applyTheme(newTheme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const html = document.documentElement;
  
  console.log('🎨 Applying theme:', newTheme);
  console.log('📋 Before - HTML classes:', html.className);
  
  // Remove both classes first to ensure clean state
  html.classList.remove('dark', 'light');
  
  if (newTheme === 'dark') {
    html.classList.add('dark');
    html.setAttribute('data-theme', 'dark');
    console.log('✅ Added dark class and data-theme="dark" to html element');
  } else {
    html.classList.remove('dark');
    html.setAttribute('data-theme', 'light');
    console.log('✅ Removed dark class, set data-theme="light"');
  }
  
  console.log('📋 After - HTML classes:', html.className);
  console.log('📋 After - HTML data-theme:', html.getAttribute('data-theme'));
  
  // Force a repaint to ensure changes are visible
  void html.offsetHeight;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize theme from localStorage or system preference (only on client)
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme) return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Apply initial theme
    applyTheme(theme);
  }, []); // Run only once on mount

  // Apply theme whenever it changes (after mount)
  useEffect(() => {
    if (!mounted) return;
    console.log('🎨 useEffect: theme changed to', theme, 'mounted:', mounted);
    applyTheme(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      console.log('💾 Saved theme to localStorage:', theme);
    }
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    console.log('📝 setTheme called with:', newTheme);
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    console.log('🔄 Toggle theme called, current theme state:', theme);
    setThemeState((currentTheme) => {
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      console.log('🔄 Setting theme from', currentTheme, 'to', newTheme);
      // Apply immediately (don't wait for useEffect)
      if (typeof window !== 'undefined') {
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        console.log('⚡ Applied theme immediately:', newTheme);
      }
      return newTheme;
    });
  }, [theme]); // Include theme so we can log it, but functional update handles state correctly

  // Memoize context value to ensure React detects changes
  const contextValue = useMemo(() => {
    const currentTheme = mounted ? theme : 'light';
    console.log('🎯 Creating context value, mounted:', mounted, 'theme:', theme, 'currentTheme:', currentTheme);
    return {
      theme: currentTheme,
      toggleTheme,
      setTheme,
    };
  }, [theme, mounted, toggleTheme, setTheme]);
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
