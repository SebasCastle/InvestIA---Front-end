import { useContext } from 'react';
import { ThemeContext } from '../theme/theme-context';

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return theme;
}
