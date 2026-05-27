import React, { useState } from 'react';
import { Heart, Star, Trash2, Edit2, Check, X, Calendar, MessageSquare } from 'lucide-react';

export default function EntryList({ entries, onUpdate, onDelete, onToggleFavorite }) {
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editMood, setEditMood] = useState(1);

  const moods = {
    0: { icon: '❤️', label: 'Good', border: 'hsl(0, 100%, 68%)', bg: 'rgba(255, 107, 107, 0.04)' },
    1: { icon: '👋', label: 'Okay', border: 'hsl(38, 100%, 60%)', bg: 'rgba(252, 196, 25, 0.04)' },
    2: { icon: '❤️‍🩹', label: 'Tough', border: 'hsl(205, 100%, 62%)', bg: 'rgba(77, 171, 247, 0.04)' },
    3: { icon: '❓', label: 'Question', border: 'hsl(265, 90%, 70%)', bg: 'rgba(177, 151, 252, 0.04)' },
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
      {entries.map((entry) => {
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
            className="glass animate-fade-in"
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
                        >
                          <span>{m.icon}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  style={styles.editTextarea}
                  required
                />

                <div style={styles.editActions}>
                  <button onClick={handleCancelEdit} style={styles.cancelBtn}>
                    <X size={14} />
                    <span>Cancel</span>
                  </button>
                  <button onClick={() => handleSaveEdit(entry.id)} style={styles.saveBtn} disabled={!editText.trim()}>
                    <Check size={14} />
                    <span>Save Changes</span>
                  </button>
                </div>
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
                        borderColor: `${moodInfo.border}22`
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
                        color: entry.isFavorite ? '#fcc419' : 'var(--text-muted)',
                      }}
                      data-tooltip={entry.isFavorite ? 'Unfavorite' : 'Favorite'}
                    >
                      <Star size={16} fill={entry.isFavorite ? '#fcc419' : 'none'} />
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => handleStartEdit(entry)}
                      style={styles.cardActionBtn}
                      data-tooltip="Edit entry"
                    >
                      <Edit2 size={15} />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => onDelete(entry.id)}
                      style={styles.cardActionBtnDelete}
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
    </div>
  );
}

const styles = {
  listContainer: {
    padding: '12px 32px 32px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
    flex: 1,
  },
  card: {
    borderRadius: '14px',
    borderLeftWidth: '5px',
    borderLeftStyle: 'solid',
    transition: 'var(--transition-normal)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: 'var(--shadow-md)',
      borderColor: 'var(--border-color-hover)',
    }
  },
  cardContent: {
    padding: '18px 20px',
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
    borderRadius: '6px',
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
    letterSpacing: '0.03em',
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
    ':hover': {
      backgroundColor: 'hsla(0, 0%, 50%, 0.1)',
      color: 'var(--text-main)',
      borderColor: 'var(--border-color)',
    }
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
    ':hover': {
      backgroundColor: 'rgba(255, 107, 107, 0.1)',
      color: '#ff6b6b',
      borderColor: 'rgba(255, 107, 107, 0.2)',
    }
  },
  cardBody: {
    cursor: 'pointer',
    padding: '2px 0',
  },
  entryText: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: 'var(--text-main)',
    whiteSpace: 'pre-wrap',
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
    background: 'linear-gradient(135deg, hsla(255, 85%, 65%, 0.08) 0%, hsla(205, 100%, 62%, 0.08) 100%)',
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
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  editHeader: {
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
    ':hover': {
      backgroundColor: 'hsla(0, 0%, 50%, 0.08)',
      transform: 'scale(1.05)',
    }
  },
  editTextarea: {
    width: '100%',
    minHeight: '100px',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-app)',
    color: 'var(--text-main)',
    fontSize: '14.5px',
    lineHeight: '1.5',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'var(--font-sans)',
  },
  editActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
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
    ':hover': {
      backgroundColor: 'hsla(0, 0%, 50%, 0.08)',
    }
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '6px',
    backgroundColor: 'var(--accent-color)',
    color: 'white',
    fontSize: '13px',
    fontWeight: '600',
    boxShadow: '0 2px 8px hsla(255, 85%, 65%, 0.2)',
    ':hover': {
      backgroundColor: 'var(--accent-hover)',
    }
  }
};
