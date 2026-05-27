import React from 'react';
import { Sparkles, Calendar, Heart, Award, Flame, Smile, BarChart2 } from 'lucide-react';

export default function Insights({ entries }) {
  
  // Calculate analytics
  const totalCount = entries.length;
  const favoriteCount = entries.filter(e => e.isFavorite).length;

  // Calculate Streak (consecutive days of writing)
  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    
    // Extract unique dates sorted descending
    const dates = entries
      .map(e => new Date(e.createdAt).toDateString())
      .filter((value, index, self) => self.indexOf(value) === index)
      .map(d => new Date(d));
    
    let streak = 0;
    let current = new Date();
    current.setHours(0,0,0,0);
    
    // Check if the user wrote today or yesterday to continue streak
    let lastRecordedIndex = -1;
    const todayStr = current.toDateString();
    
    const yesterday = new Date(current);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const datesStrings = dates.map(d => d.toDateString());
    
    if (datesStrings.includes(todayStr)) {
      lastRecordedIndex = datesStrings.indexOf(todayStr);
    } else if (datesStrings.includes(yesterdayStr)) {
      lastRecordedIndex = datesStrings.indexOf(yesterdayStr);
    } else {
      return 0; // Streak broken
    }

    streak = 1;
    let expectedDate = new Date(dates[lastRecordedIndex]);
    
    for (let i = lastRecordedIndex + 1; i < dates.length; i++) {
      expectedDate.setDate(expectedDate.getDate() - 1);
      if (dates[i].toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break; // Gap found
      }
    }

    return streak;
  };

  const streak = calculateStreak();

  // Mood frequency breakdown
  const moodCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };
  entries.forEach(e => {
    if (moodCounts[e.mood] !== undefined) {
      moodCounts[e.mood]++;
    }
  });

  const moodsInfo = {
    0: { icon: '❤️', label: 'Good', color: 'hsl(0, 100%, 68%)', bg: 'rgba(255, 107, 107, 0.2)' },
    1: { icon: '👋', label: 'Okay', color: 'hsl(38, 100%, 60%)', bg: 'rgba(252, 196, 25, 0.2)' },
    2: { icon: '❤️‍🩹', label: 'Tough', color: 'hsl(205, 100%, 62%)', bg: 'rgba(77, 171, 247, 0.2)' },
    3: { icon: '❓', label: 'Question', color: 'hsl(265, 90%, 70%)', bg: 'rgba(177, 151, 252, 0.2)' },
  };

  // Get percentage
  const getPercentage = (count) => {
    if (totalCount === 0) return 0;
    return Math.round((count / totalCount) * 100);
  };

  // Generate 7-day activity grid for the past week
  const getPastWeekGrid = () => {
    const grid = [];
    const daysName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      // Find entries written on this day
      const dayEntries = entries.filter(e => new Date(e.createdAt).toDateString() === dateStr);
      
      let primaryMood = null;
      if (dayEntries.length > 0) {
        // Frequency check for primary mood on that day
        const counts = {};
        dayEntries.forEach(e => { counts[e.mood] = (counts[e.mood] || 0) + 1; });
        let maxCount = -1;
        Object.keys(counts).forEach(m => {
          if (counts[m] > maxCount) {
            maxCount = counts[m];
            primaryMood = parseInt(m);
          }
        });
      }

      grid.push({
        name: daysName[date.getDay()],
        dayNum: date.getDate(),
        hasEntries: dayEntries.length > 0,
        mood: primaryMood,
        isToday: date.toDateString() === new Date().toDateString()
      });
    }
    return grid;
  };

  const weekGrid = getPastWeekGrid();

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Streaks and Summary Stats Row */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard} className="glass">
          <div style={{ ...styles.statIconBadge, backgroundColor: 'rgba(255, 107, 107, 0.12)', color: '#ff6b6b' }}>
            <Flame size={20} fill={streak > 0 ? '#ff6b6b' : 'none'} />
          </div>
          <div style={styles.statMeta}>
            <span style={styles.statVal}>{streak} {streak === 1 ? 'day' : 'days'}</span>
            <span style={styles.statLabel}>Current Streak</span>
          </div>
        </div>

        <div style={styles.statCard} className="glass">
          <div style={{ ...styles.statIconBadge, backgroundColor: 'rgba(255, 255, 255, 0.08)', color: 'white' }}>
            <Award size={20} />
          </div>
          <div style={styles.statMeta}>
            <span style={styles.statVal}>{totalCount}</span>
            <span style={styles.statLabel}>Total Entries</span>
          </div>
        </div>

        <div style={styles.statCard} className="glass">
          <div style={{ ...styles.statIconBadge, backgroundColor: 'rgba(252, 196, 25, 0.12)', color: '#fcc419' }}>
            <Heart size={20} fill={favoriteCount > 0 ? '#fcc419' : 'none'} />
          </div>
          <div style={styles.statMeta}>
            <span style={styles.statVal}>{favoriteCount}</span>
            <span style={styles.statLabel}>Favorites Saved</span>
          </div>
        </div>
      </div>

      <div style={styles.analyticsSection}>
        {/* Mood Distribution */}
        <div style={{ ...styles.analyticCard, flex: 1.2 }} className="glass">
          <h3 style={styles.cardTitle}>
            <BarChart2 size={18} color="var(--accent-color)" />
            <span>Mood Distribution</span>
          </h3>

          {totalCount === 0 ? (
            <div style={styles.emptyStats}>
              <p>No statistics yet. Log a mood to see trends!</p>
            </div>
          ) : (
            <div style={styles.moodBreakdown}>
              {/* Segmented bar graph */}
              <div style={styles.segmentedBar}>
                {Object.keys(moodCounts).map(mValStr => {
                  const mVal = parseInt(mValStr);
                  const count = moodCounts[mVal];
                  const percent = getPercentage(count);
                  if (percent === 0) return null;
                  
                  return (
                    <div 
                      key={mValStr}
                      style={{
                        width: `${percent}%`,
                        backgroundColor: moodsInfo[mVal].color,
                        height: '100%',
                        transition: 'var(--transition-normal)',
                      }}
                      title={`${moodsInfo[mVal].label}: ${percent}%`}
                    />
                  );
                })}
              </div>

              {/* Legend List */}
              <div style={styles.legendList}>
                {Object.keys(moodsInfo).map(mValStr => {
                  const mVal = parseInt(mValStr);
                  const count = moodCounts[mVal];
                  const percent = getPercentage(count);
                  const info = moodsInfo[mVal];
                  
                  return (
                    <div key={mValStr} style={styles.legendItem}>
                      <span style={styles.legendIcon}>{info.icon}</span>
                      <div style={styles.legendMeta}>
                        <span style={styles.legendLabel}>{info.label}</span>
                        <span style={styles.legendCount}>{count} {count === 1 ? 'entry' : 'entries'}</span>
                      </div>
                      <span style={{ ...styles.legendPercent, color: info.color }}>{percent}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Weekly Mood Grid */}
        <div style={{ ...styles.analyticCard, flex: 1 }} className="glass">
          <h3 style={styles.cardTitle}>
            <Calendar size={18} color="var(--accent-color)" />
            <span>Weekly Flow</span>
          </h3>

          <p style={styles.flowDesc}>Your primary mood mappings over the past 7 days:</p>

          <div style={styles.flowGrid}>
            {weekGrid.map((day, idx) => {
              const info = day.mood !== null ? moodsInfo[day.mood] : null;
              
              return (
                <div 
                  key={idx} 
                  style={{
                    ...styles.flowDay,
                    borderColor: day.isToday ? 'var(--accent-color)' : 'var(--border-color)',
                    backgroundColor: day.isToday ? 'rgba(170, 59, 255, 0.04)' : 'transparent',
                  }}
                >
                  <span style={styles.flowDayName}>{day.name}</span>
                  <div 
                    style={{
                      ...styles.flowDot,
                      backgroundColor: info ? info.color : 'var(--border-color)',
                      boxShadow: info ? `0 0 10px ${info.color}66` : 'none',
                    }}
                    title={info ? `Primary mood: ${info.label}` : 'No entries'}
                  >
                    {info ? info.icon : ''}
                  </div>
                  <span style={styles.flowDayNum}>{day.dayNum}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    overflowY: 'auto',
    flex: 1,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '18px',
  },
  statCard: {
    padding: '20px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    border: '1px solid var(--border-color)',
  },
  statIconBadge: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statVal: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--text-heading)',
    fontFamily: 'var(--font-title)',
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  analyticsSection: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  analyticCard: {
    padding: '24px',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    minWidth: '300px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  emptyStats: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '180px',
    color: 'var(--text-muted)',
    fontSize: '14px',
  },
  moodBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  segmentedBar: {
    width: '100%',
    height: '16px',
    borderRadius: '99px',
    overflow: 'hidden',
    display: 'flex',
    backgroundColor: 'var(--border-color)',
  },
  legendList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-input)',
  },
  legendIcon: {
    fontSize: '18px',
  },
  legendMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  legendLabel: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: 'var(--text-heading)',
  },
  legendCount: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  legendPercent: {
    marginLeft: 'auto',
    fontSize: '16px',
    fontWeight: '800',
    fontFamily: 'var(--font-title)',
  },
  flowDesc: {
    fontSize: '13.5px',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  flowGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '10px',
    marginTop: '8px',
  },
  flowDay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 4px',
    borderRadius: '10px',
    border: '1px solid',
  },
  flowDayName: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  flowDot: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    transition: 'var(--transition-bouncy)',
  },
  flowDayNum: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-main)',
  }
};
