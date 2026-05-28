import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Header({
  focusDate,
  setFocusDate,
  selectedInterval,
  entryCount,
  filterFavorites,
  showInsights
}) {
  const calendar = {
    isToday: (date) => {
      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    },
    isYesterday: (date) => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return (
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()
      );
    },
    isTomorrow: (date) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return (
        date.getDate() === tomorrow.getDate() &&
        date.getMonth() === tomorrow.getMonth() &&
        date.getFullYear() === tomorrow.getFullYear()
      );
    }
  };

  // Shift focusDate forward or backward
  const shiftPeriod = (amount) => {
    const nextDate = new Date(focusDate);
    if (selectedInterval === 'day') {
      nextDate.setDate(nextDate.getDate() + amount);
    } else if (selectedInterval === 'week') {
      nextDate.setDate(nextDate.getDate() + amount * 7);
    } else if (selectedInterval === 'month') {
      nextDate.setMonth(nextDate.getMonth() + amount);
    } else if (selectedInterval === 'year') {
      nextDate.setFullYear(nextDate.getFullYear() + amount);
    }
    setFocusDate(nextDate);
  };

  const jumpToCurrent = () => {
    setFocusDate(new Date());
  };

  // Formats subtitle display range based on active interval
  const getIntervalRangeText = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    
    if (selectedInterval === 'day') {
      return focusDate.toLocaleDateString(undefined, options);
    }
    
    if (selectedInterval === 'week') {
      // Get start and end of week (assuming Monday start)
      const day = focusDate.getDay();
      const diffToMonday = focusDate.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(focusDate);
      monday.setDate(diffToMonday);
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      const formatOption = { month: 'short', day: 'numeric', year: 'numeric' };
      return `${monday.toLocaleDateString(undefined, formatOption)} – ${sunday.toLocaleDateString(undefined, formatOption)}`;
    }
    
    if (selectedInterval === 'month') {
      return focusDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    }
    
    if (selectedInterval === 'year') {
      return focusDate.toLocaleDateString(undefined, { year: 'numeric' });
    }
    
    return '';
  };

  // Compute primary title
  const getTitle = () => {
    if (showInsights) return 'Mood Insights';
    if (filterFavorites) return 'Favorites';
    
    if (selectedInterval === 'day') {
      if (calendar.isToday(focusDate)) return 'Today';
      if (calendar.isYesterday(focusDate)) return 'Yesterday';
      if (calendar.isTomorrow(focusDate)) return 'Tomorrow';
      return 'Day';
    }
    
    return selectedInterval.charAt(0).toUpperCase() + selectedInterval.slice(1);
  };

  const getShiftHelpText = () => {
    switch (selectedInterval) {
      case 'day': return 'Double-click center to jump to Today';
      case 'week': return 'Double-click center to jump to This Week';
      case 'month': return 'Double-click center to jump to This Month';
      case 'year': return 'Double-click center to jump to This Year';
      default: return '';
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.titleSection}>
        <h2 style={styles.title}>
          {getTitle()}
          {!showInsights && (
            <span style={styles.countBadge}>{entryCount}</span>
          )}
        </h2>
        {!showInsights && !filterFavorites && (
          <p style={styles.subtitle}>{getIntervalRangeText()}</p>
        )}
        {filterFavorites && (
          <p style={styles.subtitle}>Showing all marked entries</p>
        )}
        {showInsights && (
          <p style={styles.subtitle}>Your journaling stats & mood analytics</p>
        )}
      </div>

      {!showInsights && !filterFavorites && (
        <div style={styles.navControls} className="glass">
          <button 
            onClick={() => shiftPeriod(-1)} 
            style={styles.navBtn} 
            className="icon-button"
            data-tooltip={`Previous ${selectedInterval}`}
          >
            <ChevronLeft size={16} />
          </button>
          
          <div 
            style={styles.navLabel} 
            onDoubleClick={jumpToCurrent}
            title={getShiftHelpText()}
            data-tooltip="Double-click to reset"
          >
            {selectedInterval === 'day' && calendar.isToday(focusDate) ? 'Today' : selectedInterval.toUpperCase()}
          </div>

          <button 
            onClick={() => shiftPeriod(1)} 
            style={styles.navBtn} 
            className="icon-button"
            data-tooltip={`Next ${selectedInterval}`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </header>
  );
}

const styles = {
  header: {
    padding: '28px 36px 22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border-color)',
    background: 'linear-gradient(180deg, hsla(42, 55%, 93%, 0.42), transparent)',
    flexShrink: 0,
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  title: {
    fontSize: '34px',
    fontWeight: '650',
    color: 'var(--text-heading)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  countBadge: {
    fontSize: '13px',
    fontWeight: '800',
    padding: '3px 9px',
    borderRadius: '999px',
    backgroundColor: 'hsla(var(--mood-question), 0.12)',
    color: 'var(--accent-hover)',
    verticalAlign: 'middle',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  navControls: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '8px',
    padding: '3px',
    width: '164px',
  },
  navBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '7px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    border: '1px solid transparent',
    transition: 'var(--transition-normal)',
  },
  navLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: '11px',
    fontWeight: '800',
    color: 'var(--text-muted)',
    userSelect: 'none',
    cursor: 'pointer',
    letterSpacing: '0.08em',
    padding: '0 4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }
};
