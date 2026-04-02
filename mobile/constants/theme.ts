export type ThemeMode = 'earth' | 'light';

export interface ThemeColors {
  earth: {
    darkest: string;
    dark: string;
    brown: string;
    warm: string;
    medium: string;
    gold: string;
    amber: string;
    cream: string;
    light: string;
    olive: string;
    forest: string;
  };
  white: string;
  black: string;
  gray: {
    100: string;
    200: string;
    400: string;
    500: string;
    600: string;
  };
  // Semantic tokens that change per theme
  bg: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  headerBg: string;
  headerText: string;
  tabBarBg: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
}

const earthPalette = {
  darkest: '#1a0f0a',
  dark: '#2c1810',
  brown: '#3b2418',
  warm: '#5c4033',
  medium: '#8b6914',
  gold: '#b8860b',
  amber: '#daa520',
  cream: '#faebd7',
  light: '#fff8dc',
  olive: '#6b8e23',
  forest: '#2d5016',
};

export const earthTheme: ThemeColors = {
  earth: earthPalette,
  white: '#ffffff',
  black: '#000000',
  gray: { 100: '#f5f5f5', 200: '#e5e5e5', 400: '#a3a3a3', 500: '#737373', 600: '#525252' },
  bg: earthPalette.light,
  card: '#ffffff',
  text: earthPalette.dark,
  textSecondary: earthPalette.warm,
  textMuted: '#8b7355',
  border: earthPalette.cream,
  headerBg: earthPalette.darkest,
  headerText: earthPalette.cream,
  tabBarBg: earthPalette.darkest,
  tabBarBorder: earthPalette.brown,
  tabBarActive: earthPalette.gold,
  tabBarInactive: earthPalette.warm,
};

export const lightTheme: ThemeColors = {
  earth: earthPalette,
  white: '#ffffff',
  black: '#000000',
  gray: { 100: '#f5f5f5', 200: '#e5e5e5', 400: '#a3a3a3', 500: '#737373', 600: '#525252' },
  bg: '#ffffff',
  card: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#4b5563',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  headerBg: '#ffffff',
  headerText: '#1a1a1a',
  tabBarBg: '#ffffff',
  tabBarBorder: '#e5e7eb',
  tabBarActive: earthPalette.gold,
  tabBarInactive: '#9ca3af',
};

// Legacy exports for backward compat during migration
export const colors = earthTheme;

export const fonts = {
  serif: 'Georgia',
  sans: 'System',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
