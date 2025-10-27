import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { clearEncryptionCache, fetchAdminEncryptionSetting, updateEncryptionSetting } from '../api/encryption';
import { useAuth } from '../context/AuthContext';
import type { EncryptionMode, EncryptionSetting } from '../types';

const AVAILABLE_MODES: Array<{ value: EncryptionMode; label: string; enabled: boolean }> = [
  { value: 'PLAINTEXT', label: 'Plaintext', enabled: true },
  { value: 'WEAK_XOR', label: 'Weak XOR', enabled: true },
  { value: 'END_TO_END', label: 'End-to-End Encrypted', enabled: false },
  { value: 'END_TO_END_STEGO', label: 'End-to-End Encrypted + Steganography', enabled: false },
];

export function AdminPage() {
  const { user, logout } = useAuth();
  const [setting, setSetting] = useState<EncryptionSetting | null>(null);
  const [currentChoice, setCurrentChoice] = useState<EncryptionMode>('PLAINTEXT');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.is_staff) {
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
  const result = await fetchAdminEncryptionSetting();
        setSetting(result);
        setCurrentChoice(result.mode);
      } catch (err) {
        console.error(err);
        setError('Failed to load encryption setting.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  if (!user?.is_staff) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
  const response = await updateEncryptionSetting(currentChoice);
  clearEncryptionCache();
      setSuccess(response.updated ? 'Encryption mode updated.' : 'Encryption mode already set.');
  const updatedSetting = await fetchAdminEncryptionSetting();
      setSetting(updatedSetting);
    } catch (err) {
      console.error(err);
      setError('Failed to update encryption mode.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Administration</h1>
        <div className="user-info">
          <Link className="secondary" to="/">
            Back to chat
          </Link>
          <span>Signed in as {user.username}</span>
          <button onClick={logout}>Log out</button>
        </div>
      </header>
      <main className="admin-page">
        <section className="panel">
          <h2>Encryption Mode</h2>
          <p className="muted">
            Choose how messages are transformed before being stored. Only the first two modes are available right now; the
            remaining modes are placeholders for the upcoming encryption roll-out.
          </p>
          {loading ? (
            <p>Loading current setting…</p>
          ) : (
            <form onSubmit={handleSubmit} className="admin-form">
              <label>
                Active mode
                <select
                  value={currentChoice}
                  onChange={(event) => setCurrentChoice(event.target.value as EncryptionMode)}
                  disabled={saving}
                >
                  {AVAILABLE_MODES.map((mode) => (
                    <option key={mode.value} value={mode.value} disabled={!mode.enabled}>
                      {mode.label}
                      {!mode.enabled ? ' (coming soon)' : ''}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-actions">
                <button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save mode'}
                </button>
              </div>
            </form>
          )}
          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}
          {setting && (
            <p className="muted">
              Last updated: {new Date(setting.updated_at).toLocaleString()} — currently <strong>{setting.mode}</strong>.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
