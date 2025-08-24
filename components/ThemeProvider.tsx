'use client'

import { ThemeProvider as ThemeContextProvider } from '@/components/contexts/ThemeContext';
import { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ThemeContextProvider>
      {children}
    </ThemeContextProvider>
  );
}
