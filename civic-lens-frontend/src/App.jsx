import { useState } from 'react';
import { Box } from '@mui/material';
import ModelPage from './pages/ModelPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const [view, setView] = useState('model');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
      }}
    >
      {view === 'dashboard' ? (
        <DashboardPage onNavigate={setView} />
      ) : (
        <ModelPage onNavigate={setView} />
      )}
    </Box>
  );
}
