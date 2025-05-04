import React from 'react';
import { Layout as AntLayout } from 'antd';
import 'antd/dist/reset.css';
import './styles/dashboard.css';
import './App.css';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import NotificationCenter from './components/ui/NotificationCenter';
import { useAuth } from './hooks/useAuth';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import AccessibilityProvider from './components/ui/AccessibilityProvider';
import AppRoutes from './routes';

const { Content } = AntLayout;

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { collapsed } = useSidebar();

  // Si está cargando, mostrar pantalla de carga
  if (isLoading) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div className="loading-spinner" style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #1890ff',
          borderRadius: '50%',
          width: '30px',
          height: '30px',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Cargando aplicación...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Si no hay usuario, mostrar solo las rutas de login/register
  if (!user) {
    return (
      <AntLayout style={{ minHeight: '100vh' }}>
        <Content>
          <AppRoutes />
        </Content>
      </AntLayout>
    );
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <AntLayout>
        <Header />
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280 }}>
          <AppRoutes />
        </Content>
      </AntLayout>
      <NotificationCenter />
    </AntLayout>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <ThemeProvider>
          <SidebarProvider>
            <AppContent />
          </SidebarProvider>
        </ThemeProvider>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
};

export default App;
