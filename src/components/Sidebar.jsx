import { Calendar, Heart, BarChart3, Settings, LogOut, Cloud, CloudOff, RefreshCw, Sun, Moon, Feather } from 'lucide-react';

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
    <aside style={styles.sidebar}>
      <div style={styles.topSection}>
        {/* Brand Logo */}
        <div style={styles.brand}>
          <div style={styles.logoBadge} className="pulse-logo">
            <Feather size={18} strokeWidth={2.4} />
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
                className="sidebar-nav-item"
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
              className="sidebar-nav-item"
            >
              <Heart size={18} fill={filterFavorites ? 'currentColor' : 'none'} />
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
              className="sidebar-nav-item"
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
            backgroundColor: isCloud ? 'hsla(var(--mood-tough), 0.12)' : 'hsla(42, 22%, 70%, 0.1)',
            borderColor: isCloud ? 'hsla(var(--mood-tough), 0.35)' : 'var(--border-color)',
          }}
        >
          <div style={styles.syncStatusLeft}>
            {isCloud ? (
              <>
                <Cloud size={14} color="hsl(var(--mood-tough))" />
                <span style={{ ...styles.syncText, color: 'hsl(var(--mood-tough))' }}>Cloud Sync</span>
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
              className="icon-button"
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
            className="tool-button"
            data-tooltip={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={onOpenSettings} style={styles.toolBtn} className="tool-button" data-tooltip="App Settings">
            <Settings size={18} />
          </button>
          {user && (
            <button onClick={onLogout} style={styles.toolBtn} className="tool-button" data-tooltip="Sign Out">
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
    width: '268px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '26px 18px',
    borderRight: '1px solid hsla(42, 28%, 74%, 0.12)',
    backgroundColor: 'var(--bg-sidebar)',
    color: 'var(--text-on-dark)',
    boxShadow: 'inset -1px 0 0 hsla(42, 28%, 74%, 0.06)',
    flexShrink: 0,
    zIndex: 10,
  },
  topSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '34px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingLeft: '8px',
  },
  logoBadge: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, var(--brass), var(--accent-color))',
    color: 'hsl(196, 31%, 9%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: '24px',
    fontWeight: '750',
    fontFamily: 'var(--font-title)',
    color: 'var(--text-on-dark)',
    letterSpacing: '0',
  },
  navGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  navHeader: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-on-dark-muted)',
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
    borderRadius: '8px',
    color: 'var(--text-on-dark-muted)',
    fontSize: '14px',
    fontWeight: '500',
    border: '1px solid transparent',
    transition: 'var(--transition-normal)',
  },
  navItemActive: {
    backgroundColor: 'hsla(42, 55%, 93%, 0.1)',
    color: 'var(--text-on-dark)',
    borderColor: 'hsla(42, 28%, 74%, 0.16)',
    boxShadow: 'inset 3px 0 0 var(--brass)',
  },
  bottomSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderTop: '1px solid hsla(42, 28%, 74%, 0.12)',
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
    color: 'var(--text-on-dark-muted)',
  },
  syncActionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    borderRadius: '4px',
    color: 'hsl(var(--mood-tough))',
    border: '1px solid transparent',
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
    background: 'hsla(42, 55%, 93%, 0.09)',
    border: '1px solid hsla(42, 28%, 74%, 0.15)',
    color: 'var(--text-on-dark)',
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
    color: 'var(--text-on-dark)',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  userRole: {
    fontSize: '11px',
    color: 'var(--text-on-dark-muted)',
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
    border: '1px solid hsla(42, 28%, 74%, 0.14)',
    color: 'var(--text-on-dark-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition-normal)',
  }
};
