import { useState, useEffect, useCallback } from 'react';
import { db } from './services/db';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Composer from './components/Composer';
import EntryList from './components/EntryList';
import Insights from './components/Insights';
import SettingsModal from './components/SettingsModal';
import Login from './components/Login';
import confetti from 'canvas-confetti';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bypassAuth, setBypassAuth] = useState(localStorage.getItem('blip_bypass_auth') === 'true');
  const [user, setUser] = useState(null);
  const [allEntries, setAllEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [focusDate, setFocusDate] = useState(new Date());
  const [selectedInterval, setSelectedInterval] = useState('day');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  // Sync and Modal States
  const [syncing, setSyncing] = useState(false);
  const [savingEntry, setSavingEntry] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('blip_theme') || 'light');

  const refreshEntries = useCallback(async () => {
    try {
      const fetched = await db.getEntries();
      setAllEntries(fetched);
    } catch (e) {
      console.error("Failed to load journal entries:", e);
    }
  }, []);

  // Load Theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-mode');
    } else {
      root.classList.remove('light-mode');
    }
    localStorage.setItem('blip_theme', theme);
  }, [theme]);

  // Auth State Listener
  useEffect(() => {
    db.registerAuthListener(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        localStorage.setItem('blip_bypass_auth', 'false');
        setBypassAuth(false);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      // Load initial entries
      await refreshEntries();
      setLoading(false);
    });
  }, [refreshEntries]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSaveEntry = async (entryData) => {
    setSavingEntry(true);
    try {
      await db.saveEntry(entryData);
      await refreshEntries();
      
      // Trigger a beautiful visual confetti celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#6a8b6f', '#bb7a3b', '#b95f4a', '#d2a536']
      });
      return true;
    } catch (err) {
      alert("Error saving journal entry: " + err.message);
      return false;
    } finally {
      setSavingEntry(false);
    }
  };

  const handleUpdateEntry = async (id, updatedFields) => {
    try {
      const entry = allEntries.find(e => e.id === id);
      if (!entry) return;
      await db.saveEntry({
        ...entry,
        ...updatedFields
      });
      await refreshEntries();
    } catch (err) {
      alert("Error updating entry: " + err.message);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await db.deleteEntry(id);
        await refreshEntries();
      } catch (err) {
        alert("Error deleting entry: " + err.message);
      }
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      await db.toggleFavorite(id);
      await refreshEntries();
    } catch (err) {
      alert("Error updating favorite status: " + err.message);
    }
  };

  const handleForceSync = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      await db.syncLocalToCloud(user.id);
      await refreshEntries();
    } catch (e) {
      alert("Sync failed: " + e.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    if (user) {
      if (window.confirm("Sign out of your account?")) {
        await db.logout();
        setIsAuthenticated(false);
        setUser(null);
        localStorage.setItem('blip_bypass_auth', 'false');
        setBypassAuth(false);
        await refreshEntries();
      }
    } else {
      localStorage.setItem('blip_bypass_auth', 'false');
      setBypassAuth(false);
    }
  };

  const handleBypassAuth = () => {
    localStorage.setItem('blip_bypass_auth', 'true');
    setBypassAuth(true);
    refreshEntries();
  };

  // Helper date logic to filter entries by current focus date range
  const getFilteredEntries = () => {
    // If favorites mode, show all favorited entries
    if (filterFavorites && !showInsights) {
      return allEntries.filter(e => e.isFavorite);
    }

    const currentYear = focusDate.getFullYear();
    const currentMonth = focusDate.getMonth();
    const currentDate = focusDate.getDate();

    return allEntries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      const entryYear = entryDate.getFullYear();
      const entryMonth = entryDate.getMonth();
      const entryDay = entryDate.getDate();

      if (selectedInterval === 'day') {
        return (
          entryYear === currentYear &&
          entryMonth === currentMonth &&
          entryDay === currentDate
        );
      }

      if (selectedInterval === 'week') {
        // Calculate week bounds (Monday start)
        const day = focusDate.getDay();
        const diffToMonday = focusDate.getDate() - day + (day === 0 ? -6 : 1);
        
        const monday = new Date(focusDate);
        monday.setDate(diffToMonday);
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        return entryDate >= monday && entryDate <= sunday;
      }

      if (selectedInterval === 'month') {
        return entryYear === currentYear && entryMonth === currentMonth;
      }

      if (selectedInterval === 'year') {
        return entryYear === currentYear;
      }

      return false;
    });
  };

  const activeEntries = getFilteredEntries();

  // Loading Screen
  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <Loader2 size={40} style={styles.spinner} color="var(--accent-color)" />
        <span style={styles.loadingText}>Opening journal...</span>
      </div>
    );
  }

  // Show Auth Screen if not signed in AND they haven't explicitly chosen offline
  const showAuth = !isAuthenticated && !bypassAuth;

  if (showAuth) {
    return (
      <Login 
        onAuthSuccess={refreshEntries} 
        onBypassAuth={handleBypassAuth} 
      />
    );
  }

  return (
    <div style={styles.dashboardContainer} className="animate-fade-in">
      {/* Sidebar navigation */}
      <Sidebar
        selectedInterval={selectedInterval}
        setSelectedInterval={setSelectedInterval}
        filterFavorites={filterFavorites}
        setFilterFavorites={setFilterFavorites}
        showInsights={showInsights}
        setShowInsights={setShowInsights}
        user={user}
        isCloud={db.isCloudConfigured()}
        onOpenSettings={() => setSettingsOpen(true)}
        onLogout={handleLogout}
        onForceSync={handleForceSync}
        syncing={syncing}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Journal Board */}
      <main style={styles.mainFeed}>
        <Header
          focusDate={focusDate}
          setFocusDate={setFocusDate}
          selectedInterval={selectedInterval}
          entryCount={activeEntries.length}
          filterFavorites={filterFavorites}
          showInsights={showInsights}
        />

        {showInsights ? (
          // Insights Board
          <Insights entries={allEntries} />
        ) : (
          // Standard Journal Board
          <div style={styles.journalFlow}>
            {/* Entry input composer */}
            {!filterFavorites && (
              <Composer
                onSave={handleSaveEntry}
                isSaving={savingEntry}
                isCloud={db.isCloudConfigured()}
              />
            )}
            
            {/* Journal Entries List */}
            <EntryList
              entries={activeEntries}
              onUpdate={handleUpdateEntry}
              onDelete={handleDeleteEntry}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        )}
      </main>

      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          onConfigChange={async () => {
            const isBypass = localStorage.getItem('blip_bypass_auth') === 'true';
            setBypassAuth(isBypass);
            await refreshEntries();
            setSettingsOpen(false);
          }}
          allEntries={allEntries}
          onImportComplete={async () => {
            await refreshEntries();
            setSettingsOpen(false);
          }}
        />
      )}
    </div>
  );
}

const styles = {
  loadingScreen: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    backgroundColor: 'var(--bg-app)',
    color: 'var(--text-main)',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-title)',
  },
  dashboardContainer: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'var(--bg-app)',
    backgroundImage: 'linear-gradient(90deg, hsla(38, 26%, 24%, 0.035) 1px, transparent 1px), linear-gradient(hsla(38, 26%, 24%, 0.03) 1px, transparent 1px)',
    backgroundSize: '34px 34px',
  },
  mainFeed: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  journalFlow: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  }
};
