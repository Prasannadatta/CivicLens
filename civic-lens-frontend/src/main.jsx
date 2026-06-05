import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppThemeProvider } from './ColorModeContext';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  </StrictMode>,
);
