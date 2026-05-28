import { useState, useEffect, useRef } from 'react';
import { Star, Trash2, Edit2, Check, X, MessageSquare } from 'lucide-react';

export default function EntryList({ entries, onUpdate, onDelete, onToggleFavorite }) {
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editMood, setEditMood] = useState(1);

  // Pagination & Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState(15);
  const observerRef = useRef(null);

  // Reset pagination when entries change (e.g. interval, date, favorites)
  useEffect(() => {
    const resetTimer = window.setTimeout(() => setVisibleCount(15), 0);
    return () => window.clearTimeout(resetTimer);
  }, [entries]);

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    if (visibleCount >= entries.length) return;

    const observer = new IntersectionObserver((observerEntries) => {
      const target = observerEntries[0];
      if (target.isIntersecting) {
        setVisibleCount(prev => Math.min(prev + 15, entries.length));
      }
    }, {
      root: null,
      rootMargin: '180px', // Trigger slightly early for a seamless scroll
      threshold: 0.1
    });

    const currentSentinel = observerRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [entries.length, visibleCount]);

  const moods = {
    0: { icon: '❤️', label: 'Good', border: 'hsl(var(--mood-good))', bg: 'hsla(var(--mood-good), 0.08)' },
    1: { icon: '👋', label: 'Okay', border: 'hsl(var(--mood-okay))', bg: 'hsla(var(--mood-okay), 0.09)' },
    2: { icon: '❤️‍🩹', label: 'Tough', border: 'hsl(var(--mood-tough))', bg: 'hsla(var(--mood-tough), 0.09)' },
    3: { icon: '❓', label: 'Question', border: 'hsl(var(--mood-question))', bg: 'hsla(var(--mood-question), 0.09)' },
  };

  const handleStartEdit = (entry) => {
    setEditingId(entry.id);
    setEditText(entry.text);
    setEditMood(entry.mood);
  };

  const handleSaveEdit = (id) => {
    if (!editText.trim()) return;
    onUpdate(id, {
      text: editText.trim(),
      mood: editMood,
    });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const formatEntryTime = (date) => {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatEntryDate = (date) => {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (entries.length === 0) {
    return (
      <div style={styles.emptyState} className="animate-fade-in">
        <div style={styles.emptyIllustration}>
          <MessageSquare size={48} color="var(--accent-color)" style={{ opacity: 0.6 }} />
        </div>
        <h3 style={styles.emptyTitle}>Silence is beautiful</h3>
        <p style={styles.emptySubtitle}>
          There are no journal entries recorded for this time range. Capture your first thought above!
        </p>
      </div>
    );
  }

  return (
    <div style={styles.listContainer}>
      {entries.slice(0, visibleCount).map((entry) => {
        const isEditing = editingId === entry.id;
        const moodInfo = moods[entry.mood] || moods[1];

        return (
          <article
            key={entry.id}
            style={{
              ...styles.card,
              borderLeftColor: moodInfo.border,
              backgroundColor: isEditing ? 'var(--bg-input)' : 'var(--bg-card)',
            }}
            className="glass animate-fade-in entry-card"
          >
            {isEditing ? (
              // Editing Card View
              <div style={styles.editLayout}>
                <div style={styles.editHeader}>
                  <span style={styles.editTitle}>Edit Entry</span>
                  {/* Mood Selector inside card */}
                  <div style={styles.editMoodList}>
                    {Object.keys(moods).map((moodVal) => {
                      const mVal = parseInt(moodVal);
                      const m = moods[mVal];
                      const isMoodActive = editMood === mVal;
                      return (
                        <button
                          key={moodVal}
                          type="button"
                          onClick={() => setEditMood(mVal)}
                          style={{
                            ...styles.miniMoodBtn,
                            borderColor: isMoodActive ? m.border : 'transparent',
                            backgroundColor: isMoodActive ? m.bg : 'transparent',
                          }}
                          className="quiet-button"
                        >
                          <span>{m.icon}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={styles.editActions}>
                  <span style={styles.editHint}>Use Cancel to exit editing without saving.</span>
                  <button onClick={handleCancelEdit} style={styles.cancelBtn} className="quiet-button">
                    <X size={14} />
                    <span>Cancel</span>
                  </button>
                  <button onClick={() => handleSaveEdit(entry.id)} style={styles.saveBtn} className="primary-button" disabled={!editText.trim()}>
                    <Check size={14} />
                    <span>Save Changes</span>
                  </button>
                </div>

                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  style={styles.editTextarea}
                  required
                  autoFocus
                />
              </div>
            ) : (
              // Standard Card View
              <div style={styles.cardContent}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardMeta}>
                    <div 
                      style={{
                        ...styles.moodIndicator,
                        color: moodInfo.border,
                        backgroundColor: moodInfo.bg,
                        borderColor: moodInfo.border
                      }}
                    >
                      <span style={styles.moodIcon}>{moodInfo.icon}</span>
                      <span style={styles.moodLabel}>{moodInfo.label}</span>
                    </div>
                    <span style={styles.timeLabel}>
                      {formatEntryDate(entry.createdAt)} at {formatEntryTime(entry.createdAt)}
                    </span>
                  </div>

                  <div style={styles.cardActions} className="card-actions-hover">
                    {/* Favorite toggler */}
                    <button
                      onClick={() => onToggleFavorite(entry.id)}
                      style={{
                        ...styles.cardActionBtn,
                        color: entry.isFavorite ? 'var(--brass)' : 'var(--text-muted)',
                      }}
                      className="card-action"
                      data-tooltip={entry.isFavorite ? 'Unfavorite' : 'Favorite'}
                    >
                      <Star size={16} fill={entry.isFavorite ? 'var(--brass)' : 'none'} />
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => handleStartEdit(entry)}
                      style={styles.cardActionBtn}
                      className="card-action"
                      data-tooltip="Edit entry"
                    >
                      <Edit2 size={15} />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => onDelete(entry.id)}
                      style={styles.cardActionBtnDelete}
                      className="danger-button"
                      data-tooltip="Delete entry"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div 
                  style={styles.cardBody} 
                  onDoubleClick={() => handleStartEdit(entry)}
                  title="Double-click to edit inline"
                >
                  <p style={styles.entryText}>{entry.text}</p>
                </div>
              </div>
            )}
          </article>
        );
      })}

      {/* Infinite Scroll Sentinel / Loading Spinner */}
      {visibleCount < entries.length && (
        <div ref={observerRef} style={styles.loadingMore} className="glass">
          <div style={styles.loadingSpinner} />
          <span style={styles.loadingMoreText}>Recalling more thoughts...</span>
        </div>
      )}
    </div>
  );
}

const styles = {
  listContainer: {
    padding: '12px 36px 36px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    overflowY: 'auto',
    flex: 1,
  },
  card: {
    borderRadius: '8px',
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
    transition: 'var(--transition-normal)',
    overflow: 'visible',
  },
  cardContent: {
    padding: '18px 20px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  moodIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px',
    borderRadius: '999px',
    fontSize: '12.5px',
    fontWeight: '700',
    border: '1px solid',
  },
  moodIcon: {
    fontSize: '13px',
  },
  moodLabel: {
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  timeLabel: {
    fontSize: '12.5px',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  cardActionBtn: {
    width: '30px',
    height: '30px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    border: '1px solid transparent',
    transition: 'var(--transition-normal)',
  },
  cardActionBtnDelete: {
    width: '30px',
    height: '30px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    border: '1px solid transparent',
    transition: 'var(--transition-normal)',
  },
  cardBody: {
    cursor: 'pointer',
    padding: '2px 0 4px',
    overflow: 'visible',
  },
  entryText: {
    fontSize: '17px',
    lineHeight: '1.64',
    color: 'var(--text-main)',
    whiteSpace: 'pre-wrap',
    fontFamily: 'var(--font-journal)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '60px 40px',
    flex: 1,
    gap: '16px',
  },
  emptyIllustration: {
    width: '80px',
    height: '80px',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, hsla(var(--mood-question), 0.1), hsla(var(--mood-okay), 0.12))',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-heading)',
  },
  emptySubtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    maxWidth: '360px',
    lineHeight: '1.5',
  },
  editLayout: {
    padding: '18px 20px 20px',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridTemplateAreas: '"title" "actions" "editor"',
    gap: '14px',
    alignItems: 'center',
  },
  editHeader: {
    gridArea: 'title',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editTitle: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  editMoodList: {
    display: 'flex',
    gap: '6px',
  },
  miniMoodBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    border: '1px solid transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    transition: 'var(--transition-normal)',
  },
  editTextarea: {
    gridArea: 'editor',
    width: '100%',
    minHeight: '180px',
    maxHeight: '52vh',
    padding: '14px 16px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-main)',
    fontSize: '17px',
    lineHeight: '1.64',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'var(--font-journal)',
  },
  editActions: {
    gridArea: 'actions',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    backgroundColor: 'hsla(var(--mood-question), 0.07)',
    border: '1px solid var(--border-color)',
  },
  editHint: {
    marginRight: 'auto',
    color: 'var(--text-muted)',
    fontSize: '12.5px',
    fontWeight: '600',
  },
  cancelBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 12px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    color: 'var(--text-muted)',
    fontSize: '13px',
    fontWeight: '600',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '6px',
    backgroundColor: 'var(--accent-color)',
    color: 'hsl(42, 55%, 96%)',
    fontSize: '13px',
    fontWeight: '600',
    boxShadow: '0 8px 20px var(--accent-glow)',
  },
  loadingMore: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '20px',
    borderRadius: '16px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    marginTop: '8px',
    boxShadow: 'var(--shadow-sm)',
    animation: 'pulse 2s infinite ease-in-out',
    transition: 'var(--transition-normal)',
  },
  loadingSpinner: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: '2px solid var(--border-color)',
    borderTopColor: 'var(--accent-color)',
    animation: 'spin 0.8s linear infinite',
  },
  loadingMoreText: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-title)',
    letterSpacing: '0.02em',
  }
};
