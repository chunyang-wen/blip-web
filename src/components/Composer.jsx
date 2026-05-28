import { useState, useRef } from 'react';
import { Loader2, Send, Star } from 'lucide-react';

export default function Composer({ onSave, isSaving = false, isCloud = false }) {
  const [text, setText] = useState('');
  const [mood, setMood] = useState(1); // 1 = Okay (Default)
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  const moods = [
    { value: 0, icon: '❤️', label: 'Good', colorClass: 'good', color: 'hsl(var(--mood-good))', shadow: 'var(--mood-good)' },
    { value: 1, icon: '👋', label: 'Okay', colorClass: 'okay', color: 'hsl(var(--mood-okay))', shadow: 'var(--mood-okay)' },
    { value: 2, icon: '❤️‍🩹', label: 'Tough', colorClass: 'tough', color: 'hsl(var(--mood-tough))', shadow: 'var(--mood-tough)' },
    { value: 3, icon: '❓', label: 'Question', colorClass: 'question', color: 'hsl(var(--mood-question))', shadow: 'var(--mood-question)' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || isSaving) return;

    const saved = await onSave({
      text: text.trim(),
      mood,
      isFavorite,
    });

    if (!saved) return;

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
  const activeMoodShadow = moods.find(m => m.value === mood).shadow;

  return (
    <div style={styles.composerWrapper}>
      <form 
        onSubmit={handleSubmit} 
        style={{
          ...styles.composerForm,
          borderColor: isFocused ? activeMoodColor : 'var(--border-color)',
          boxShadow: isFocused ? `0 0 0 3px hsla(${activeMoodShadow}, 0.12), var(--shadow-md)` : 'var(--shadow-sm)',
        }}
        className="glass animate-fade-in"
      >
        <textarea
          ref={textareaRef}
          value={text}
          disabled={isSaving}
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
                      disabled={isSaving}
                      onClick={() => setMood(m.value)}
                      style={{
                        ...styles.moodBtn,
                        borderColor: isActive ? m.color : 'transparent',
                        backgroundColor: isActive ? `hsla(${m.shadow}, 0.12)` : 'transparent',
                      }}
                      className="quiet-button"
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
              {isSaving && (
                <div style={styles.uploadStatus} role="status" aria-live="polite">
                  <Loader2 size={14} style={styles.statusSpinner} />
                  <span>{isCloud ? 'Uploading to Supabase...' : 'Saving locally...'}</span>
                </div>
              )}

              <span style={styles.charCount}>{text.length} characters</span>
              
              {/* Favorite Toggle */}
              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                disabled={isSaving}
                style={{
                  ...styles.starBtn,
                  color: isFavorite ? 'var(--brass)' : 'var(--text-muted)',
                }}
                className="icon-button"
                data-tooltip={isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
              >
                <Star size={20} fill={isFavorite ? 'var(--brass)' : 'none'} />
              </button>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!text.trim() || isSaving}
                style={{
                  ...styles.submitBtn,
                  background: text.trim() && !isSaving ? 'var(--accent-color)' : 'var(--border-color)',
                  color: text.trim() && !isSaving ? 'hsl(42, 55%, 96%)' : 'var(--text-muted)',
                  boxShadow: text.trim() && !isSaving ? '0 10px 24px var(--accent-glow)' : 'none',
                }}
                className="primary-button"
              >
                {isSaving ? <Loader2 size={15} style={styles.statusSpinner} /> : <Send size={15} />}
                <span>{isSaving ? 'Saving' : 'Save'}</span>
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
    padding: '24px 36px 12px',
    flexShrink: 0,
  },
  composerForm: {
    borderRadius: '8px',
    padding: '18px 18px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    border: '1px solid var(--border-color)',
    backgroundImage: 'linear-gradient(transparent 31px, hsla(38, 18%, 45%, 0.12) 32px)',
    backgroundSize: '100% 32px',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  },
  textarea: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    resize: 'none',
    color: 'var(--text-main)',
    fontSize: '17px',
    lineHeight: '1.65',
    outline: 'none',
    transition: 'height 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
    fontFamily: 'var(--font-journal)',
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
    fontWeight: '800',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
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
    borderRadius: '999px',
    border: '1px solid transparent',
    fontSize: '13px',
    transition: 'var(--transition-normal)',
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
  uploadStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '5px 9px',
    borderRadius: '999px',
    border: '1px solid hsla(var(--mood-tough), 0.24)',
    backgroundColor: 'hsla(var(--mood-tough), 0.09)',
    color: 'hsl(var(--mood-tough))',
    fontSize: '12px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
  },
  statusSpinner: {
    animation: 'spin 0.8s linear infinite',
    flexShrink: 0,
  },
  starBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
    borderRadius: '8px',
    border: '1px solid transparent',
    transition: 'var(--transition-normal)',
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
