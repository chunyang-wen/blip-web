import { useState } from 'react';
import { db } from '../services/db';
import { X, ShieldAlert, Copy, Check, Download, Upload, Cloud, HardDrive } from 'lucide-react';

export default function SettingsModal({ onClose, onConfigChange, allEntries, onImportComplete }) {
  const currentCredentials = db.getCredentials();
  const [useCloud, setUseCloud] = useState(db.isCloudConfigured());
  const [url, setUrl] = useState(currentCredentials.url);
  const [key, setKey] = useState(currentCredentials.key);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  const handleSaveCredentials = (e) => {
    e.preventDefault();
    if (useCloud) {
      db.setCredentials(url, key);
      localStorage.setItem('blip_bypass_auth', 'false');
    } else {
      db.setCredentials('', ''); // Clear credentials to force local
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onConfigChange();
    }, 1200);
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allEntries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `blip_journal_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e) => {
    setImportError('');
    setImportSuccess(false);
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;

    fileReader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!Array.isArray(parsed)) {
          throw new Error("Backup file must be a JSON array of entries.");
        }
        await db.importJSON(parsed);
        setImportSuccess(true);
        if (onImportComplete) onImportComplete();
      } catch (err) {
        setImportError(err.message || "Failed to parse backup JSON file.");
      }
    };
    fileReader.readAsText(file);
  };

  const copySQLCode = () => {
    navigator.clipboard.writeText(sqlSetupScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const sqlSetupScript = `-- 1. Create the journal entries table
create table if open public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  modified_at timestamptz not null default now(),
  text text not null,
  mood smallint not null default 1,
  is_favorite boolean not null default false,
  owner uuid not null references auth.users(id) on delete cascade
);

-- 2. Create index on owner for speed queries
create index journal_entries_owner_idx on public.journal_entries(owner);

-- 3. Enable Row Level Security (RLS) to secure credentials
alter table public.journal_entries enable row level security;

-- 4. Create RLS Policy: Users can only read & write their own entries
create policy "Users can manage their own journal entries"
on public.journal_entries
for all
using (
  auth.uid() = owner
)
with check (
  auth.uid() = owner
);`;

  return (
    <div style={styles.overlay} className="animate-fade-in">
      <div style={styles.modal} className="glass">
        {/* Modal Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>Settings</h3>
          <button onClick={onClose} style={styles.closeBtn} className="icon-button">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={styles.body}>
          {/* Section 1: Storage Mode Selector */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Storage Mode</h4>
            <div style={styles.modeToggleContainer}>
              <button
                type="button"
                onClick={() => setUseCloud(false)}
                style={{
                  ...styles.modeBtn,
                  borderColor: !useCloud ? 'var(--accent-color)' : 'var(--border-color)',
                  backgroundColor: !useCloud ? 'hsla(var(--mood-question), 0.08)' : 'transparent',
                }}
                className="quiet-button"
              >
                <HardDrive size={18} color={!useCloud ? 'var(--accent-color)' : 'var(--text-muted)'} />
                <div style={styles.modeMeta}>
                  <span style={{ ...styles.modeLabel, color: !useCloud ? 'var(--text-heading)' : 'var(--text-main)' }}>Local Storage</span>
                  <span style={styles.modeDesc}>Data stays inside your browser cache. Fully private.</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setUseCloud(true)}
                style={{
                  ...styles.modeBtn,
                  borderColor: useCloud ? 'var(--accent-color)' : 'var(--border-color)',
                  backgroundColor: useCloud ? 'hsla(var(--mood-question), 0.08)' : 'transparent',
                }}
                className="quiet-button"
              >
                <Cloud size={18} color={useCloud ? 'var(--accent-color)' : 'var(--text-muted)'} />
                <div style={styles.modeMeta}>
                  <span style={{ ...styles.modeLabel, color: useCloud ? 'var(--text-heading)' : 'var(--text-main)' }}>Supabase Cloud Sync</span>
                  <span style={styles.modeDesc}>Synchronize entries securely across all devices.</span>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Supabase Credentials */}
          {useCloud && (
            <div style={styles.section} className="animate-fade-in">
              <h4 style={styles.sectionTitle}>Supabase Cloud Configuration</h4>
              <form onSubmit={handleSaveCredentials} style={styles.credForm}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Supabase Project URL</label>
                  <input
                    type="url"
                    placeholder="https://yourproject.supabase.co"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    style={styles.input}
                    required={useCloud}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Supabase Anonymous API Key</label>
                  <input
                    type="text"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    style={styles.input}
                    required={useCloud}
                  />
                </div>

                <button type="submit" style={styles.saveBtn} className="primary-button">
                  {saveSuccess ? <Check size={16} /> : null}
                  <span>{saveSuccess ? 'Credentials Saved!' : 'Save & Initialize Cloud Sync'}</span>
                </button>
              </form>

              {/* RLS secure info block */}
              <div style={styles.infoBlock}>
                <ShieldAlert size={18} color="hsl(var(--mood-tough))" style={{ flexShrink: 0 }} />
                <span style={styles.infoText}>
                  <strong>Important Security Notice:</strong> Enabling Supabase connects this app directly to your remote database. To prevent credential leaks or data exposure, ensure you run the table migration script and enable <strong>Row Level Security (RLS)</strong> on Supabase.
                </span>
              </div>

              {/* SQL Migration Script Copy Box */}
              <div style={styles.sqlSection}>
                <div style={styles.sqlHeader}>
                  <span style={styles.sqlTitle}>Database Setup SQL Code</span>
                  <button onClick={copySQLCode} style={styles.copyBtn} className="quiet-button">
                    {copiedSql ? <Check size={14} color="hsl(var(--mood-tough))" /> : <Copy size={14} />}
                    <span>{copiedSql ? 'Copied!' : 'Copy SQL Script'}</span>
                  </button>
                </div>
                <pre style={styles.sqlCode}>
                  <code>{sqlSetupScript}</code>
                </pre>
              </div>
            </div>
          )}

          {!useCloud && (
            <div style={styles.section}>
              <form onSubmit={handleSaveCredentials} style={styles.credForm}>
                <button type="submit" style={styles.saveBtn} className="primary-button">
                  {saveSuccess ? <Check size={16} /> : null}
                  <span>{saveSuccess ? 'Switched to Offline!' : 'Confirm Offline Mode'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Section 3: Import/Export Backups */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Backup & Migration Tools</h4>
            <div style={styles.backupActions}>
              {/* Export JSON */}
              <button onClick={exportData} style={styles.backupBtn} className="quiet-button">
                <Download size={16} />
                <span>Export Journal Backup (JSON)</span>
              </button>

              {/* Import JSON */}
              <div style={styles.importWrapper}>
                <label htmlFor="import-file" style={styles.importLabelBtn} className="quiet-button">
                  <Upload size={16} />
                  <span>Import Journal Backup (JSON)</span>
                </label>
                <input
                  type="file"
                  id="import-file"
                  accept=".json"
                  onChange={handleImportData}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {importSuccess && (
              <div style={styles.importSuccessMsg} className="animate-fade-in">
                <Check size={16} />
                <span>Journal backup imported successfully!</span>
              </div>
            )}
            
            {importError && (
              <div style={styles.importErrorMsg} className="animate-fade-in">
                <X size={16} />
                <span>Import failed: {importError}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(16, 22, 21, 0.5)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  modal: {
    width: '560px',
    maxWidth: '90%',
    maxHeight: '85vh',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-lg)',
  },
  header: {
    padding: '20px 24px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
  },
  closeBtn: {
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
    borderRadius: '8px',
    border: '1px solid transparent',
    transition: 'var(--transition-normal)',
  },
  body: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    overflowY: 'auto',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  modeToggleContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  modeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '14px 18px',
    borderRadius: '8px',
    border: '1px solid',
    textAlign: 'left',
    transition: 'var(--transition-normal)',
  },
  modeMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  modeLabel: {
    fontSize: '14.5px',
    fontWeight: '700',
  },
  modeDesc: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  credForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
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
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-input)',
    color: 'var(--text-main)',
    outline: 'none',
    fontSize: '14px',
    transition: 'var(--transition-normal)',
  },
  saveBtn: {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: 'var(--accent-color)',
    color: 'hsl(42, 55%, 96%)',
    fontSize: '14px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 10px 24px var(--accent-glow)',
  },
  infoBlock: {
    display: 'flex',
    gap: '12px',
    padding: '14px',
    borderRadius: '8px',
    backgroundColor: 'hsla(var(--mood-tough), 0.09)',
    border: '1px solid hsla(var(--mood-tough), 0.22)',
    color: 'var(--text-main)',
  },
  infoText: {
    fontSize: '12.5px',
    lineHeight: '1.45',
  },
  sqlSection: {
    marginTop: '6px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  sqlHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    backgroundColor: 'var(--bg-input)',
    borderBottom: '1px solid var(--border-color)',
  },
  sqlTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-muted)',
  },
  copyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    fontSize: '11px',
    color: 'var(--text-main)',
    fontWeight: '600',
  },
  sqlCode: {
    padding: '14px',
    backgroundColor: 'var(--bg-input)',
    overflowX: 'auto',
    fontSize: '11px',
    maxHeight: '140px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--mono)',
    textAlign: 'left',
  },
  backupActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  backupBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    fontSize: '13.5px',
    fontWeight: '600',
    minWidth: '200px',
    transition: 'var(--transition-normal)',
  },
  importWrapper: {
    flex: 1,
    minWidth: '200px',
    display: 'flex',
  },
  importLabelBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    fontSize: '13.5px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition-normal)',
  },
  importSuccessMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'hsl(var(--mood-tough))',
    fontSize: '13px',
    fontWeight: '600',
    padding: '2px 4px',
  },
  importErrorMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--danger)',
    fontSize: '13px',
    fontWeight: '600',
    padding: '2px 4px',
  }
};
