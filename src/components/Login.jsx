import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Shield, Sparkles, AlertCircle, Eye, EyeOff, Loader2, ArrowRight, Server, Database, Key, HelpCircle, FileText, Check } from 'lucide-react';

export default function Login({ onAuthSuccess, onBypassAuth }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Handle ambient glow tracking mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        await db.signup(email, password);
        setSuccessMsg('Check your email for the confirmation link!');
        setEmail('');
        setPassword('');
      } else {
        await db.login(email, password);
        onAuthSuccess();
      }
    } catch (err) {
      setError(err.message || 'An authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.authContainer}>
      {/* Background glowing blobs */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>
      <div 
        className="interactive-glow" 
        style={{ 
          left: `${mousePos.x}px`, 
          top: `${mousePos.y}px`,
        }}
      ></div>

      <div style={styles.contentWrapper}>
        {/* Left Side: Auth Card */}
        <div style={styles.authCard} className="glass animate-fade-in">
          <div style={styles.logoSection}>
            <div style={styles.logoBadge} className="pulse-logo">
              <Sparkles size={28} color="white" />
            </div>
            <h1 style={styles.title}>Blip</h1>
            <p style={styles.subtitle}>A minimal, beautiful, and secure journal</p>
          </div>

          {error && (
            <div style={styles.errorContainer} className="animate-fade-in">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={styles.successContainer} className="animate-fade-in">
              <Shield size={18} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.passwordInput}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? (
                <Loader2 size={18} style={styles.spinner} />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={styles.footer}>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccessMsg('');
              }}
              style={styles.toggleBtn}
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>

            <div style={styles.divider}>or</div>

            <button onClick={onBypassAuth} style={styles.offlineBtn}>
              Continue Offline & Local-Only
            </button>
          </div>
        </div>

        {/* Right Side: Security Visual Diagram Card */}
        <div style={styles.diagramCard} className="glass animate-fade-in">
          <div style={styles.diagHeader}>
            <Shield size={22} color="var(--accent-color)" />
            <h3 style={styles.diagTitle}>Security & Architecture</h3>
          </div>
          
          <p style={styles.diagSubtitle}>
            How Blip protects your journal entries and prevents database credential leaks.
          </p>

          <div style={styles.flowSection}>
            {/* Local Storage Flow */}
            <div style={styles.modeCard}>
              <div style={styles.modeCardHeader}>
                <span style={styles.modeBadgeLocal}>Local Mode</span>
                <span style={styles.modeDescText}>Offline Guest Journal</span>
              </div>
              <div style={styles.diagramLine}>
                <div style={styles.diagramNode}>
                  <FileText size={14} color="var(--text-main)" />
                  <span style={styles.nodeLabel}>Write Entry</span>
                </div>
                <div style={styles.connector}>─────▶</div>
                <div style={styles.diagramNode}>
                  <Database size={14} color="var(--accent-color)" />
                  <span style={styles.nodeLabel}>Browser Cache</span>
                </div>
              </div>
              <p style={styles.modeBenefits}>
                Data is stored locally in <code>localStorage</code>. It stays entirely inside your browser, locked behind your system lock, and never touches the web.
              </p>
            </div>

            {/* Cloud Sync Flow */}
            <div style={styles.modeCard}>
              <div style={styles.modeCardHeader}>
                <span style={styles.modeBadgeCloud}>Cloud Sync</span>
                <span style={styles.modeDescText}>Secure Database Isolation</span>
              </div>

              {/* Visual Steps Grid */}
              <div style={styles.stepsGrid}>
                {/* Step 1 */}
                <div style={styles.stepItem}>
                  <div style={styles.stepNum}>1</div>
                  <div style={styles.stepContent}>
                    <div style={styles.stepTitle}>
                      <Key size={13} color="#ff6b6b" />
                      <span>Password Hashing</span>
                    </div>
                    <p style={styles.stepText}>
                      Passwords are sent directly to Supabase Auth over HTTPS. They are securely encrypted using <strong>bcrypt</strong> before saving. No plain passwords touch the database.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={styles.stepItem}>
                  <div style={styles.stepNum}>2</div>
                  <div style={styles.stepContent}>
                    <div style={styles.stepTitle}>
                      <Server size={13} color="#4dabf7" />
                      <span>Signed Sessions (JWT)</span>
                    </div>
                    <p style={styles.stepText}>
                      Once verified, Supabase issues a cryptographically signed session token (JWT). The browser stores this temporarily to authorize operations.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={styles.stepItem}>
                  <div style={styles.stepNum}>3</div>
                  <div style={styles.stepContent}>
                    <div style={styles.stepTitle}>
                      <Database size={13} color="#b197fc" />
                      <span>Row-Level Security (RLS)</span>
                    </div>
                    <p style={styles.stepText}>
                      The database server inspects your secure token on every query. The policy <code>auth.uid() = owner</code> strictly locks your entries—other users cannot read them!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  authContainer: {
    width: '100vw',
    height: '100vh',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflowY: 'auto',
    zIndex: 1,
    padding: '40px 20px',
  },
  contentWrapper: {
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: '32px',
    flexWrap: 'wrap',
    maxWidth: '1000px',
    width: '100%',
    zIndex: 2,
  },
  authCard: {
    width: '420px',
    maxWidth: '100%',
    padding: '40px',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    flexShrink: 0,
  },
  diagramCard: {
    width: '500px',
    maxWidth: '100%',
    padding: '40px',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  diagHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  diagTitle: {
    fontSize: '20px',
    fontWeight: '700',
  },
  diagSubtitle: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  flowSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  modeCard: {
    padding: '16px',
    borderRadius: '14px',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  modeCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  modeBadgeLocal: {
    fontSize: '10px',
    fontWeight: '800',
    textTransform: 'uppercase',
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
    color: 'var(--text-main)',
    border: '1px solid rgba(156, 163, 175, 0.3)',
  },
  modeBadgeCloud: {
    fontSize: '10px',
    fontWeight: '800',
    textTransform: 'uppercase',
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: 'rgba(170, 59, 255, 0.12)',
    color: 'var(--accent-color)',
    border: '1px solid rgba(170, 59, 255, 0.25)',
  },
  modeDescText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  diagramLine: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    margin: '4px 0',
  },
  diagramNode: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 12px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    minWidth: '100px',
  },
  nodeLabel: {
    fontSize: '11px',
    fontWeight: '600',
  },
  connector: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    letterSpacing: '-2px',
  },
  modeBenefits: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
    textAlign: 'center',
  },
  stepsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  stepItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  stepNum: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: 'var(--border-color)',
    color: 'var(--text-heading)',
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  stepContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  stepTitle: {
    fontSize: '12.5px',
    fontWeight: '700',
    color: 'var(--text-heading)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  stepText: {
    fontSize: '11.5px',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  logoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '8px',
  },
  logoBadge: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, hsl(255, 85%, 65%) 0%, hsl(205, 100%, 62%) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px hsla(255, 85%, 65%, 0.4)',
    marginBottom: '12px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    background: 'linear-gradient(to right, #ffffff, #d8d8d8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    border: '1px solid rgba(255, 107, 107, 0.3)',
    borderRadius: '12px',
    color: '#ff6b6b',
    fontSize: '13.5px',
  },
  successContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    backgroundColor: 'rgba(77, 171, 247, 0.12)',
    border: '1px solid rgba(77, 171, 247, 0.3)',
    borderRadius: '12px',
    color: '#4dabf7',
    fontSize: '13.5px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12.5px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-input)',
    color: 'var(--text-main)',
    outline: 'none',
    transition: 'var(--transition-normal)',
    fontSize: '14.5px',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  passwordInput: {
    width: '100%',
    padding: '14px 44px 14px 16px',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-input)',
    color: 'var(--text-main)',
    outline: 'none',
    transition: 'var(--transition-normal)',
    fontSize: '14.5px',
  },
  eyeBtn: {
    position: 'absolute',
    right: '14px',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    borderRadius: '6px',
    ':hover': {
      color: 'var(--text-main)',
    }
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, hsl(255, 85%, 65%) 0%, hsl(240, 75%, 60%) 100%)',
    color: 'white',
    fontSize: '15px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 16px hsla(255, 85%, 65%, 0.3)',
    marginTop: '6px',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    marginTop: '8px',
  },
  toggleBtn: {
    color: 'var(--text-main)',
    fontSize: '13.5px',
    opacity: 0.85,
    ':hover': {
      opacity: 1,
      textDecoration: 'underline',
    }
  },
  divider: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineBtn: {
    color: 'var(--accent-color)',
    fontSize: '14px',
    fontWeight: '600',
    ':hover': {
      color: 'var(--accent-hover)',
    }
  }
};
