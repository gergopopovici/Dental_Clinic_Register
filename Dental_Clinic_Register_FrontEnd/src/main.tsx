import { StrictMode, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App';
import { AppThemeProvider } from './theme/ThemeContext';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  createElement(
    StrictMode,
    null,
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(AppThemeProvider, null, createElement(App)),
    ),
  ),
);
