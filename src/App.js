import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { ToastContainer } from './components/Toast';
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import TransactionsPage from './pages/TransactionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AuditPage from './pages/AuditPage';
import SettingsPage from './pages/SettingsPage';

const PAGES = {
  overview: OverviewPage,
  transactions: TransactionsPage,
  analytics: AnalyticsPage,
  audit: AuditPage,
  settings: SettingsPage,
};

const Dashboard = () => {
  const [page, setPage] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastUpdated] = useState(Date.now());

  const PageComponent = PAGES[page] || OverviewPage;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar
        active={page}
        onNav={setPage}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div style={{
        marginLeft: 'var(--sidebar-w)',
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <TopBar
          page={page}
          onMenuToggle={() => setMobileOpen(o => !o)}
          lastUpdated={lastUpdated}
        />

        <main style={{
          marginTop: 'var(--header-h)',
          padding: '28px',
          flex: 1,
          minWidth: 0,
        }}>
          <PageComponent />
        </main>
      </div>

      <ToastContainer />

      <style>{`
        @media (max-width: 768px) {
          div[style*="margin-left: var(--sidebar-w)"] {
            margin-left: 0 !important;
          }
          main {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

const AppInner = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <LoginPage />;
};

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  </ThemeProvider>
);

export default App;
