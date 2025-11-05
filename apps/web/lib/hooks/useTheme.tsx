'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

interface ThemeFonts {
  heading: string;
  body: string;
}

interface ThemeLayout {
  sections: string[];
}

interface ThemeComponents {
  [key: string]: {
    type: string;
    [key: string]: any;
  };
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  layout: ThemeLayout;
  components: ThemeComponents;
}

interface ThemeContextType {
  theme: ThemeConfig | null;
  loading: boolean;
  error: Error | null;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: null,
  loading: true,
  error: null,
});

interface ThemeProviderProps {
  children: ReactNode;
  themeId: string | null;
}

export function ThemeProvider({ children, themeId }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!themeId) {
      setLoading(false);
      return;
    }

    const loadTheme = async () => {
      try {
        setLoading(true);
        setError(null);

        // Dynamically import theme.json from the themes folder
        const themeModule = await import(`@/themes/${themeId}/theme.json`);
        setTheme(themeModule.default || themeModule);
      } catch (err) {
        console.error(`Failed to load theme ${themeId}:`, err);
        setError(err instanceof Error ? err : new Error('Failed to load theme'));
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, [themeId]);

  return (
    <ThemeContext.Provider value={{ theme, loading, error }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
