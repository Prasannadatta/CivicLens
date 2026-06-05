import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme, paletteTokens } from './theme';

const STORAGE_KEY = 'civic-lens-color-mode';

const ColorModeContext = createContext(null);

export function AppThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'light' || stored === 'dark' ? stored : 'dark';
    } catch {
      return 'dark';
    }
  });

  const toggleColorMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const colors = useMemo(() => paletteTokens[mode], [mode]);
  const value = useMemo(
    () => ({ mode, colors, toggleColorMode }),
    [mode, colors, toggleColorMode],
  );

  useEffect(() => {
    document.documentElement.dataset.colorMode = mode;
  }, [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useAppColors() {
  const ctx = useContext(ColorModeContext);
  if (!ctx) {
    throw new Error('useAppColors must be used within AppThemeProvider');
  }
  return ctx.colors;
}

export function useColorMode() {
  const ctx = useContext(ColorModeContext);
  if (!ctx) {
    throw new Error('useColorMode must be used within AppThemeProvider');
  }
  return ctx;
}
