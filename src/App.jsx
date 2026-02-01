import { useState } from 'react';
import { Briefcase, Share2, UserPlus, UserCheck, Menu, Bell, Sun, Moon, User, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import BusinessChart from './components/BusinessChart';
import UsersTable from './components/UsersTable';
import CategoryDetails from './components/CategoryDetails';
import LoginDetailPage from './components/LoginDetailPage';
import LoginPage from './components/LoginPage';
import ControlsPage from './components/ControlsPage';
import NotificationsPage from './components/NotificationsPage';
import { useData } from './context/DataContext';
import './index.css';

import { formatIndianCurrency } from './utils/formatters';

function Dashboard({ onNavigate, theme, onToggleTheme, onShowProfile }) {
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
          <button
            className="notification-btn"
            aria-label="Profile"
            onClick={onShowProfile}
            style={{ position: 'relative' }}
          >
            <User size={20} />
          </button>


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
  const [showProfile, setShowProfile] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('mib-admin-theme', newTheme);
  };

  const isCategoryPage = ['business', 'referrals', '1-2-1', 'visitors'].includes(activeNav);

  const { isAuthenticated, user } = useData();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
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
          <Dashboard onNavigate={setActiveNav} theme={theme} onToggleTheme={toggleTheme} onShowProfile={() => setShowProfile(true)} />
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

      {showProfile && (
        <div className="modal-overlay" style={{ zIndex: 9999, backdropFilter: 'blur(12px)', background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowProfile(false)}>
          <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()} style={{
            maxWidth: '450px',
            background: '#1C2336',
            border: '1px solid var(--accent-primary)',
            boxShadow: '0 0 50px rgba(0,0,0,0.5), var(--shadow-glow)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowProfile(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'color 0.2s',
                zIndex: 1
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'white'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <X size={24} />
            </button>
            <div className="modal-header" style={{ background: 'rgba(180, 145, 100, 0.1)', paddingRight: '60px' }}>
              <h2 className="modal-title" style={{ color: 'var(--accent-primary)' }}>My Profile</h2>
            </div>

            <div style={{ padding: 'var(--spacing-2xl)' }}>
              <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                <div style={{
                  width: '90px',
                  height: '90px',
                  background: 'var(--accent-gradient)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--spacing-md)',
                  fontSize: '36px',
                  fontWeight: '700',
                  color: 'white',
                  boxShadow: 'var(--shadow-glow)'
                }}>
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <h3 style={{ fontSize: '24px', color: 'white', marginBottom: '4px' }}>{user?.name}</h3>
                <span style={{
                  color: 'var(--accent-primary)',
                  fontSize: '14px',
                  background: 'rgba(180, 145, 100, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontWeight: '600'
                }}>
                  {user?.role}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                <div className="form-section">
                  <label style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600' }}>login Email</label>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    color: 'white',
                    fontSize: '15px'
                  }}>
                    {user?.email}
                  </div>
                </div>

                <div className="form-section">
                  <label style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600' }}>login Password</label>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    color: 'white',
                    fontSize: '15px',
                    letterSpacing: '1px'
                  }}>
                    {user?.password || <span style={{ color: 'rgba(239, 68, 68, 0.8)', fontSize: '12px' }}>(Relogin required to show password)</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
