import { ThemeProvider as MUIThemeProvider } from '@mui/material';
import { PropsWithChildren } from 'react';
import { getMUITheme } from '../lib/i18n-mui';

export function ThemeProvider({ children }: PropsWithChildren) {
  return <MUIThemeProvider theme={getMUITheme()}>{children}</MUIThemeProvider>;
}
