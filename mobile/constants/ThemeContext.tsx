import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { earthTheme, lightTheme, type ThemeColors, type ThemeMode } from './theme';

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'earth',
  colors: earthTheme,
  toggle: () => {},
});

const STORAGE_KEY = 'kukatonon_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('earth');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'light' || val === 'earth') setMode(val);
    });
  }, []);

  function toggle() {
    const next = mode === 'earth' ? 'light' : 'earth';
    setMode(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }

  const colors = mode === 'earth' ? earthTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
