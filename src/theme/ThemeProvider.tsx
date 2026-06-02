import React, {createContext, useContext, useMemo, useState} from 'react';

export type ThemeMode = 'light' | 'dark';

export const appThemes = {
  light: {
    mode: 'light' as ThemeMode,
    background: '#EEF7EC',
    surface: '#FFFFFF',
    surfaceMuted: '#F4F8F1',
    nav: '#C9DEBF',
    navIndicator: '#EEF7EC',
    text: '#2F352F',
    textMuted: '#788276',
    border: '#E7ECE3',
    iconSurface: '#EEF7EC',
    icon: '#5F705C',
    pressed: '#F4F8F1',
  },
  dark: {
    mode: 'dark' as ThemeMode,
    background: '#18231B',
    surface: '#243026',
    surfaceMuted: '#2E3B30',
    nav: '#334733',
    navIndicator: '#4F6A4B',
    text: '#F0F6EE',
    textMuted: '#B9C8B5',
    border: '#3C4C3D',
    iconSurface: '#334733',
    icon: '#DCEADC',
    pressed: '#2D3A30',
  },
};

type AppTheme = typeof appThemes.light;

interface ThemeContextValue {
  theme: AppTheme;
  themeMode: ThemeMode;
  toggleThemeMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({children}: {children: React.ReactNode}) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  const value = useMemo(
    () => ({
      theme: appThemes[themeMode],
      themeMode,
      toggleThemeMode: () => {
        setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
      },
    }),
    [themeMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useAppTheme = () => {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error('useAppTheme must be used inside ThemeProvider');
  }

  return value;
};

