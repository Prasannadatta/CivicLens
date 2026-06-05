import { useState } from 'react';
import AppLayout from './components/AppLayout';
import HomePage from './pages/HomePage';
import ModelPage from './pages/ModelPage';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';

export default function App() {
  const [view, setView] = useState('home');

  const renderPage = () => {
    switch (view) {
      case 'model':
        return <ModelPage onNavigate={setView} />;
      case 'dashboard':
        return <DashboardPage onNavigate={setView} />;
      case 'map':
        return <MapPage />;
      case 'home':
      default:
        return <HomePage onNavigate={setView} />;
    }
  };

  return (
    <AppLayout currentView={view} onNavigate={setView}>
      {renderPage()}
    </AppLayout>
  );
}
