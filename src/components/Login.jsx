import { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Shield, Feather, AlertCircle, Eye, EyeOff, Loader2, ArrowRight, HardDrive, Cloud, HelpCircle, ArrowLeft, CheckCircle } from 'lucide-react';

export default function Login({ onAuthSuccess, onBypassAuth }) {
  const initialCredentials = db.getCredentials();

  // Onboarding Steps: 'choose' | 'setup' | 'auth'
  const [step, setStep] = useState(initialCredentials.url && initialCredentials.key ? 'auth' : 'choose');
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Database Config State
  const [supabaseUrl, setSupabaseUrl] = useState(initialCredentials.url);
  const [supabaseKey, setSupabaseKey] = useState(initialCredentials.key);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Status States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // UI Helpers
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showHelp, setShowHelp] = useState(false);

  // Handle ambient glow tracking mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleConnectDatabase = (e) => {
    e.preventDefault();
    setError('');
    
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setError('Please fill in both the Supabase URL and Anon API Key.');
      return;
    }

    if (!supabaseUrl.trim().startsWith('https://')) {
      setError('Invalid URL. Supabase Project URLs must start with https://');
      return;
    }

    // Save configuration in db service
    db.setCredentials(supabaseUrl.trim(), supabaseKey.trim());
    
    // Smoothly transition to the Auth step
    setStep('auth');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        await db.signup(email, password);
        setSuccessMsg('Verification email sent! Check your inbox to activate your account.');
        setEmail('');
        setPassword('');
      } else {
        await db.login(email, password);
        onAuthSuccess();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineBypass = () => {
    // Clear any saved keys to ensure a pure offline local session
    db.setCredentials('', '');
    onBypassAuth();
  };

  // Get project name from URL for confirmation
  const getProjectName = () => {
    try {
      return new URL(supabaseUrl).hostname.split('.')[0];
    } catch {
      return 'Supabase';
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

      <div style={styles.contentWrapper} className="animate-fade-in">
        
        {/* STEP 1: CHOOSE JOURNAL TYPE */}
        {step === 'choose' && (
          <div style={styles.chooseCard} className="glass">
            <div style={styles.logoSection}>
              <div style={styles.logoBadge} className="pulse-logo">
                <Feather size={30} />
              </div>
              <h1 style={styles.title}>Welcome to Blip</h1>
              <p style={styles.subtitle}>Choose how you would like to store your daily thoughts</p>
            </div>

            <div style={styles.optionsContainer}>
              {/* Option A: Offline */}
              <button onClick={handleOfflineBypass} style={styles.optionBtn} className="glass-interactive">
                <div style={{ ...styles.optionIconBadge, backgroundColor: 'hsla(196, 18%, 28%, 0.1)', color: 'var(--text-main)' }}>
                  <HardDrive size={24} />
                </div>
                <div style={styles.optionMeta}>
                  <span style={styles.optionTitle}>Offline Journal (Local Cache)</span>
                  <span style={styles.optionDesc}>
                    Keep thoughts 100% private. Data is stored entirely inside your browser cache. Zero configuration required.
                  </span>
                </div>
                <ArrowRight size={16} style={styles.optionArrow} />
              </button>

              {/* Option B: Cloud Sync */}
              <button onClick={() => setStep('setup')} style={styles.optionBtn} className="glass-interactive">
                <div style={{ ...styles.optionIconBadge, backgroundColor: 'hsla(var(--mood-question), 0.12)', color: 'var(--accent-color)' }}>
                  <Cloud size={24} />
                </div>
                <div style={styles.optionMeta}>
                  <span style={styles.optionTitle}>Cloud Sync Journal (Supabase)</span>
                  <span style={styles.optionDesc}>
                    Synchronize your entries across all devices securely. Requires a free personal Supabase database setup.
                  </span>
                </div>
                <ArrowRight size={16} style={styles.optionArrow} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DATABASE CONFIGURATION */}
        {step === 'setup' && (
          <div style={styles.formCard} className="glass">
            <div style={styles.backHeader}>
              <button onClick={() => setStep('choose')} style={styles.backBtn} className="quiet-button">
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <span style={styles.stepIndicator}>Step 2 of 3</span>
            </div>

            <div style={styles.formHeader}>
              <h2 style={styles.sectionTitleHeader}>Connect your Database</h2>
              <p style={styles.formSubtitle}>Paste your public Supabase API credentials to initialize cloud synchronization.</p>
            </div>

            {error && (
              <div style={styles.errorContainer} className="animate-fade-in">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleConnectDatabase} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Supabase Project URL</label>
                <input
                  type="url"
                  placeholder="https://yourproject.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Supabase public 'anon' API Key</label>
                <input
                  type="text"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <button type="submit" style={styles.submitBtn} className="primary-button">
                <span>Connect Database & Continue</span>
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Interactive Help Accordion */}
            <div style={styles.helpAccordion}>
              <button 
                type="button" 
                onClick={() => setShowHelp(!showHelp)} 
                style={styles.helpAccordionToggle}
                className="quiet-button"
              >
                <HelpCircle size={16} color="var(--accent-color)" />
                <span>How do I get these credentials?</span>
              </button>
              
              {showHelp && (
                <div style={styles.helpAccordionContent} className="animate-fade-in">
                  <ol style={styles.helpList}>
                    <li>Create a free account and project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" style={styles.helpLink}>supabase.com</a>.</li>
                    <li>Inside your Supabase dashboard, click the **Gear Icon (Project Settings)** on the bottom left.</li>
                    <li>Select **API** under the settings category list.</li>
                    <li>Copy the **Project URL** and the **anon public key** and paste them into the form above.</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: ACCOUNT ACCESS */}
        {step === 'auth' && (
          <div style={styles.formCard} className="glass">
            <div style={styles.backHeader}>
              <button 
                onClick={() => {
                  setError('');
                  setSuccessMsg('');
                  setStep('setup');
                }} 
                style={styles.backBtn}
                className="quiet-button"
              >
                <ArrowLeft size={16} />
                <span>Edit Database Keys</span>
              </button>
              <span style={styles.stepIndicator}>Step 3 of 3</span>
            </div>

            <div style={styles.formHeader}>
              <div style={styles.connectionConfirmBadge}>
                <CheckCircle size={14} color="hsl(var(--mood-tough))" />
                <span>Connected to {getProjectName()}</span>
              </div>
              <h2 style={styles.sectionTitleHeader}>{isSignUp ? 'Create your Journal Account' : 'Sign In to your Journal'}</h2>
              <p style={styles.formSubtitle}>
                {isSignUp 
                  ? 'Register an account inside your private database to isolate your records.' 
                  : 'Enter your credentials to securely retrieve your journal entries.'}
              </p>
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

            <form onSubmit={handleAuthSubmit} style={styles.form}>
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
                    className="icon-button"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={styles.submitBtn} className="primary-button">
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
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccessMsg('');
                }}
                style={styles.toggleBtn}
                className="quiet-button"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
              
              <div style={styles.divider} className="divider-line">or</div>

              <button 
                type="button"
                onClick={() => {
                  // Switch back to choose step
                  setError('');
                  setSuccessMsg('');
                  setStep('choose');
                }} 
                style={styles.offlineBtn}
                className="quiet-button"
              >
                Work Offline Instead
              </button>
            </div>
          </div>
        )}

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
    backgroundImage: 'linear-gradient(90deg, hsla(38, 26%, 24%, 0.035) 1px, transparent 1px), linear-gradient(hsla(38, 26%, 24%, 0.03) 1px, transparent 1px)',
    backgroundSize: '34px 34px',
  },
  contentWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '820px',
    width: '100%',
    zIndex: 2,
  },
  chooseCard: {
    width: '100%',
    padding: '44px 40px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '36px',
  },
  formCard: {
    width: '460px',
    maxWidth: '100%',
    padding: '36px 32px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  logoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px',
  },
  logoBadge: {
    width: '64px',
    height: '64px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, var(--brass), var(--accent-color))',
    color: 'hsl(196, 31%, 9%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 12px 30px hsla(42, 62%, 48%, 0.24)',
    marginBottom: '8px',
  },
  title: {
    fontSize: '40px',
    fontWeight: '650',
    fontFamily: 'var(--font-title)',
    letterSpacing: '0',
    color: 'var(--text-heading)',
  },
  subtitle: {
    fontSize: '15px',
    color: 'var(--text-muted)',
    maxWidth: '420px',
    lineHeight: '1.45',
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  optionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px 24px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    textAlign: 'left',
    cursor: 'pointer',
    width: '100%',
  },
  optionIconBadge: {
    width: '52px',
    height: '52px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  optionMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  optionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-heading)',
  },
  optionDesc: {
    fontSize: '12.5px',
    color: 'var(--text-muted)',
    lineHeight: '1.45',
  },
  optionArrow: {
    color: 'var(--text-muted)',
    opacity: 0.5,
    marginLeft: '8px',
  },
  backHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '14px',
    marginBottom: '4px',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--text-muted)',
    fontSize: '13px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '6px',
    border: '1px solid transparent',
  },
  stepIndicator: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  formHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  sectionTitleHeader: {
    fontSize: '22px',
    fontWeight: '800',
  },
  formSubtitle: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  connectionConfirmBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px',
    borderRadius: '6px',
    backgroundColor: 'hsla(var(--mood-tough), 0.09)',
    border: '1px solid hsla(var(--mood-tough), 0.24)',
    color: 'hsl(var(--mood-tough))',
    fontSize: '11.5px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    width: 'fit-content',
    marginBottom: '4px',
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
    borderRadius: '8px',
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
    borderRadius: '8px',
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
    border: '1px solid transparent',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '8px',
    background: 'var(--accent-color)',
    color: 'hsl(42, 55%, 96%)',
    fontSize: '15px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 10px 24px var(--accent-glow)',
    marginTop: '6px',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  helpAccordion: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '14px',
    marginTop: '4px',
  },
  helpAccordionToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: 'var(--text-main)',
    fontWeight: '600',
    width: '100%',
    textAlign: 'left',
  },
  helpAccordionContent: {
    marginTop: '10px',
    padding: '12px',
    backgroundColor: 'var(--bg-input)',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
  },
  helpList: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    paddingLeft: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  helpLink: {
    color: 'var(--accent-color)',
    textDecoration: 'underline',
    fontWeight: '600',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    border: '1px solid rgba(255, 107, 107, 0.3)',
    borderRadius: '8px',
    color: 'var(--danger)',
    fontSize: '13.2px',
    lineHeight: '1.4',
  },
  successContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    backgroundColor: 'rgba(77, 171, 247, 0.12)',
    border: '1px solid rgba(77, 171, 247, 0.3)',
    borderRadius: '8px',
    color: 'hsl(var(--mood-tough))',
    fontSize: '13.2px',
    lineHeight: '1.4',
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
    border: '1px solid transparent',
    padding: '4px 8px',
    borderRadius: '6px',
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
    color: 'var(--text-muted)',
    fontSize: '13.5px',
    fontWeight: '600',
    border: '1px solid transparent',
    padding: '4px 8px',
    borderRadius: '6px',
  }
};
