import React from 'react';
import { Calendar, Heart, BarChart3, Settings, LogOut, Cloud, CloudOff, RefreshCw, Sun, Moon } from 'lucide-react';

export default function Sidebar({
  selectedInterval,
  setSelectedInterval,
  filterFavorites,
  setFilterFavorites,
  showInsights,
  setShowInsights,
  user,
  isCloud,
  onOpenSettings,
  onLogout,
  onForceSync,
  syncing,
  theme,
  toggleTheme
}) {
  const intervals = [
    { id: 'day', label: 'Day' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'year', label: 'Year' },
  ];

  // Helper to get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.email) return 'L'; // 'L' for Local
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <aside style={styles.sidebar} className="glass">
      <div style={styles.topSection}>
        {/* Brand Logo */}
        <div style={styles.brand}>
          <div style={styles.logoBadge} className="pulse-logo">
            <span style={styles.logoSymbol}>✦</span>
          </div>
          <span style={styles.brandName}>Blip</span>
        </div>

        {/* Navigation Categories */}
        <div style={styles.navGroup}>
          <div style={styles.navHeader}>Intervals</div>
          <nav style={styles.nav}>
            {intervals.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedInterval(item.id);
                  setShowInsights(false);
                }}
                style={{
                  ...styles.navItem,
                  ...(selectedInterval === item.id && !showInsights && !filterFavorites
                    ? styles.navItemActive
                    : {}),
                }}
              >
                <Calendar size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Filters & Extra Views */}
        <div style={styles.navGroup}>
          <div style={styles.navHeader}>Library</div>
          <nav style={styles.nav}>
            <button
              onClick={() => {
                setFilterFavorites(!filterFavorites);
                setShowInsights(false);
              }}
              style={{
                ...styles.navItem,
                ...(filterFavorites && !showInsights ? styles.navItemActive : {}),
              }}
            >
              <Heart size={18} fill={filterFavorites ? 'currentColor' : 'none'} color={filterFavorites ? '#ff6b6b' : 'currentColor'} />
              <span>Favorites</span>
            </button>

            <button
              onClick={() => {
                setShowInsights(!showInsights);
                setFilterFavorites(false);
              }}
              style={{
                ...styles.navItem,
                ...(showInsights ? styles.navItemActive : {}),
              }}
            >
              <BarChart3 size={18} />
              <span>Mood Insights</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Bottom Profile and Sync Status Section */}
      <div style={styles.bottomSection}>
        {/* Sync Status Badge */}
        <div 
          style={{
            ...styles.syncBadge,
            backgroundColor: isCloud ? 'rgba(77, 171, 247, 0.1)' : 'rgba(156, 163, 175, 0.1)',
            borderColor: isCloud ? 'rgba(77, 171, 247, 0.3)' : 'rgba(156, 163, 175, 0.2)',
          }}
        >
          <div style={styles.syncStatusLeft}>
            {isCloud ? (
              <>
                <Cloud size={14} color="#4dabf7" />
                <span style={{ ...styles.syncText, color: '#4dabf7' }}>Cloud Sync</span>
              </>
            ) : (
              <>
                <CloudOff size={14} color="var(--text-muted)" />
                <span style={styles.syncText}>Local Only</span>
              </>
            )}
          </div>
          {isCloud && (
            <button 
              onClick={onForceSync} 
              disabled={syncing}
              style={styles.syncActionBtn}
              data-tooltip="Sync entries now"
            >
              <RefreshCw size={12} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          )}
        </div>

        {/* User Card */}
        <div style={styles.userCard}>
          <div style={styles.avatar}>
            {getUserInitials()}
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user ? user.email.split('@')[0] : 'Guest User'}</div>
            <div style={styles.userRole}>{user ? 'Cloud Sync active' : 'Offline Journal'}</div>
          </div>
        </div>

        {/* Toolbar Footer */}
        <div style={styles.toolbar}>
          <button 
            onClick={toggleTheme} 
            style={styles.toolBtn}
            data-tooltip={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={onOpenSettings} style={styles.toolBtn} data-tooltip="App Settings">
            <Settings size={18} />
          </button>
          {user && (
            <button onClick={onLogout} style={styles.toolBtn} data-tooltip="Sign Out">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '24px 16px',
    borderRight: '1px solid var(--border-color)',
    flexShrink: 0,
    zIndex: 10,
  },
  topSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingLeft: '8px',
  },
  logoBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, hsl(255, 85%, 65%) 0%, hsl(205, 100%, 62%) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSymbol: {
    color: 'white',
    fontSize: '20px',
    fontWeight: 'bold',
    lineHeight: 1,
    marginTop: '-2px',
  },
  brandName: {
    fontSize: '20px',
    fontWeight: '800',
    fontFamily: 'var(--font-title)',
    color: 'var(--text-heading)',
    letterSpacing: '-0.02em',
  },
  navGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  navHeader: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    paddingLeft: '12px',
    marginBottom: '4px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '10px',
    color: 'var(--text-main)',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'var(--transition-normal)',
    ':hover': {
      backgroundColor: 'hsla(0, 0%, 50%, 0.08)',
      transform: 'translateX(2px)',
    }
  },
  navItemActive: {
    backgroundColor: 'var(--accent-color)',
    color: 'white',
    boxShadow: '0 4px 12px hsla(255, 85%, 65%, 0.25)',
    ':hover': {
      backgroundColor: 'var(--accent-hover)',
      transform: 'none',
    }
  },
  bottomSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '20px',
  },
  syncBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid',
  },
  syncStatusLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  syncText: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  syncActionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    borderRadius: '4px',
    color: '#4dabf7',
    ':hover': {
      backgroundColor: 'rgba(77, 171, 247, 0.15)',
    }
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '4px 6px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, hsla(255, 85%, 65%, 0.15) 0%, hsla(205, 100%, 62%, 0.15) 100%)',
    border: '1px solid var(--border-color)',
    color: 'var(--accent-color)',
    fontWeight: '700',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    overflow: 'hidden',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-heading)',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  userRole: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '4px',
  },
  toolBtn: {
    flex: 1,
    height: '36px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition-normal)',
    ':hover': {
      backgroundColor: 'hsla(0, 0%, 50%, 0.08)',
      color: 'var(--text-main)',
      borderColor: 'var(--border-color-hover)',
    }
  }
};
