import { useState } from 'react';
import { Briefcase, Share2, UserPlus, UserCheck, Menu, Bell, Sun, Moon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import BusinessChart from './components/BusinessChart';
import UsersTable from './components/UsersTable';
import CategoryDetails from './components/CategoryDetails';
import LoginDetailPage from './components/LoginDetailPage';
import ControlsPage from './components/ControlsPage';
import NotificationsPage from './components/NotificationsPage';
import { DataProvider, useData } from './context/DataContext';
import './index.css';

import { formatIndianCurrency } from './utils/formatters';

function Dashboard({ onNavigate, theme, onToggleTheme }) {
  const { data, loading } = useData();

  if (loading) {
    return (
      <div className="main-content" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <main className="main-content">
      <header className="page-header center-header">
        <div className="header-content">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <button className="notification-btn" onClick={onToggleTheme} aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            className="notification-btn"
            aria-label="Notifications"
            onClick={() => onNavigate('notifications')}
          >
            <Bell size={20} />
            <span className="notification-badge"></span>
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <StatCard
          title="Total Business"
          value={`₹ ${formatIndianCurrency(data.stats.totalBusiness)}`}
          icon={Briefcase}
          change="12%"
          changeType="positive"
          delay={1}
          onClick={() => onNavigate('business')}
        />
        <StatCard
          title="Total Referrals"
          value={data.stats.totalReferrals}
          icon={Share2}
          change="8%"
          changeType="positive"
          delay={2}
          onClick={() => onNavigate('referrals')}
        />
        <StatCard
          title="Total 1-2-1"
          value={data.stats.total121}
          icon={UserPlus}
          change="15%"
          changeType="positive"
          delay={3}
          onClick={() => onNavigate('1-2-1')}
        />
        <StatCard
          title="Total Visitors"
          value={data.stats.totalVisitors}
          icon={UserCheck}
          change="5%"
          changeType="positive"
          delay={4}
          onClick={() => onNavigate('visitors')}
        />
      </div>

      <BusinessChart />
    </main>
  );
}

function App() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('mib-admin-theme') || 'dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('mib-admin-theme', newTheme);
  };

  const isCategoryPage = ['business', 'referrals', '1-2-1', 'visitors'].includes(activeNav);

  return (
    <DataProvider>
      <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'} ${theme === 'light' ? 'theme-light' : ''}`}>
        {!isSidebarOpen && (
          <button
            className="mobile-menu-btn"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>
        )}
        <Sidebar
          activeItem={activeNav}
          onNavClick={setActiveNav}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {activeNav === 'dashboard' ? (
          <Dashboard onNavigate={setActiveNav} theme={theme} onToggleTheme={toggleTheme} />
        ) : activeNav === 'users' ? (
          <main className="main-content">
            <header className="page-header center-header">
              <div className="header-content">
                <h1 className="page-title">Users</h1>
                <p className="page-subtitle">Manage and track your app users efficiently.</p>
              </div>
            </header>
            <UsersTable />
          </main>
        ) : isCategoryPage ? (
          <main className="main-content">
            <header className="page-header center-header">
              <div className="header-content">
                <h1 className="page-title">
                  {activeNav === '1-2-1' ? '1-2-1 Meetings' : activeNav.charAt(0).toUpperCase() + activeNav.slice(1) + ' Analytics'}
                </h1>
                <p className="page-subtitle">Deep dive into performance metrics and historical data.</p>
              </div>
            </header>
            <CategoryDetails type={activeNav} />
          </main>
        ) : activeNav === 'login' ? (
          <LoginDetailPage />
        ) : activeNav === 'controls' ? (
          <ControlsPage />
        ) : activeNav === 'notifications' ? (
          <main className="main-content">
            <NotificationsPage onNavigate={setActiveNav} />
          </main>
        ) : (
          <main className="main-content">
            <header className="page-header center-header">
              <div className="header-content">
                <h1 className="page-title">{activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}</h1>
                <p className="page-subtitle">This page is under construction.</p>
              </div>
            </header>
          </main>
        )}
      </div>
    </DataProvider>
  );
}

export default App;
