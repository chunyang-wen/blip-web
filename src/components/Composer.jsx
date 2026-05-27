import React, { useState, useRef } from 'react';
import { Heart, Send, Sparkles, Star } from 'lucide-react';

export default function Composer({ onSave }) {
  const [text, setText] = useState('');
  const [mood, setMood] = useState(1); // 1 = Okay (Default)
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  const moods = [
    { value: 0, icon: '❤️', label: 'Good', colorClass: 'good', color: 'hsl(0, 100%, 68%)' },
    { value: 1, icon: '👋', label: 'Okay', colorClass: 'okay', color: 'hsl(38, 100%, 60%)' },
    { value: 2, icon: '❤️‍🩹', label: 'Tough', colorClass: 'tough', color: 'hsl(205, 100%, 62%)' },
    { value: 3, icon: '❓', label: 'Question', colorClass: 'question', color: 'hsl(265, 90%, 70%)' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    onSave({
      text: text.trim(),
      mood,
      isFavorite,
    });

    // Reset state
    setText('');
    setMood(1);
    setIsFavorite(false);
    setIsFocused(false);
    if (textareaRef.current) textareaRef.current.blur();
  };

  const handleKeyDown = (e) => {
    // Cmd+Enter or Ctrl+Enter submits
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  const activeMoodColor = moods.find(m => m.value === mood).color;

  return (
    <div style={styles.composerWrapper}>
      <form 
        onSubmit={handleSubmit} 
        style={{
          ...styles.composerForm,
          borderColor: isFocused ? activeMoodColor : 'var(--border-color)',
          boxShadow: isFocused ? `0 4px 20px hsla(${moods.find(m => m.value === mood).colorClass === 'good' ? '0, 100%, 68%' : moods.find(m => m.value === mood).colorClass === 'okay' ? '38, 100%, 60%' : moods.find(m => m.value === mood).colorClass === 'tough' ? '205, 100%, 62%' : '265, 90%, 70%'}, 0.08)` : 'var(--shadow-sm)',
        }}
        className="glass animate-fade-in"
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Keep expanded if text is present
            if (!text.trim()) setIsFocused(false);
          }}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind today? (Press ⌘↵ to save)"
          style={{
            ...styles.textarea,
            height: isFocused || text.length > 0 ? '120px' : '48px',
          }}
        />

        {/* Action Row - only shown when focused or has text */}
        {(isFocused || text.length > 0) && (
          <div style={styles.actionRow} className="animate-fade-in">
            {/* Mood picker */}
            <div style={styles.moodSection}>
              <span style={styles.actionLabel}>Mood:</span>
              <div style={styles.moodList}>
                {moods.map((m) => {
                  const isActive = mood === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMood(m.value)}
                      style={{
                        ...styles.moodBtn,
                        borderColor: isActive ? m.color : 'transparent',
                        backgroundColor: isActive ? `rgba(${m.color === 'hsl(0, 100%, 68%)' ? '255, 107, 107' : m.color === 'hsl(38, 100%, 60%)' ? '252, 196, 25' : m.color === 'hsl(205, 100%, 62%)' ? '77, 171, 247' : '177, 151, 252'}, 0.12)` : 'transparent',
                      }}
                      title={m.label}
                    >
                      <span style={styles.moodIcon}>{m.icon}</span>
                      <span style={{
                        ...styles.moodLabel,
                        color: isActive ? 'var(--text-heading)' : 'var(--text-muted)',
                        fontWeight: isActive ? '600' : '400',
                      }}>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right-aligned helpers and submit */}
            <div style={styles.rightActions}>
              <span style={styles.charCount}>{text.length} characters</span>
              
              {/* Favorite Toggle */}
              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                style={{
                  ...styles.starBtn,
                  color: isFavorite ? '#fcc419' : 'var(--text-muted)',
                }}
                data-tooltip={isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
              >
                <Star size={20} fill={isFavorite ? '#fcc419' : 'none'} />
              </button>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!text.trim()}
                style={{
                  ...styles.submitBtn,
                  background: text.trim() ? activeMoodColor : 'var(--border-color)',
                  color: text.trim() ? 'black' : 'var(--text-muted)',
                  boxShadow: text.trim() ? `0 4px 12px ${activeMoodColor}33` : 'none',
                }}
              >
                <Send size={15} />
                <span>Save</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

const styles = {
  composerWrapper: {
    padding: '24px 32px 12px 32px',
    flexShrink: 0,
  },
  composerForm: {
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    border: '1px solid var(--border-color)',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  },
  textarea: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    resize: 'none',
    color: 'var(--text-main)',
    fontSize: '15px',
    lineHeight: '1.5',
    outline: 'none',
    transition: 'height 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
    fontFamily: 'var(--font-sans)',
  },
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '14px',
    marginTop: '2px',
  },
  moodSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  actionLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  moodList: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  moodBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid transparent',
    fontSize: '13px',
    transition: 'var(--transition-normal)',
    ':hover': {
      backgroundColor: 'hsla(0, 0%, 50%, 0.08)',
      transform: 'scale(1.03)',
    }
  },
  moodIcon: {
    fontSize: '15px',
  },
  moodLabel: {
    fontSize: '13px',
  },
  rightActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginLeft: 'auto',
  },
  charCount: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  starBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
    borderRadius: '8px',
    transition: 'var(--transition-normal)',
    ':hover': {
      backgroundColor: 'hsla(0, 0%, 50%, 0.08)',
      transform: 'scale(1.08)',
    }
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: '700',
    transition: 'var(--transition-normal)',
  }
};
