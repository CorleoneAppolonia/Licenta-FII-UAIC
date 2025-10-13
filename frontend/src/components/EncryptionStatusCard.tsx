import { useMemo, useState, type ChangeEvent } from 'react';
import { useEncryption } from '../context/EncryptionContext';
import { useAuth } from '../context/AuthContext';

export function EncryptionStatusCard() {
  const { status, loading, error, refreshing, updating, refresh, setMode } = useEncryption();
  const { user } = useAuth();
  const [pendingMode, setPendingMode] = useState<string | null>(null);
  const isAdmin = Boolean(user?.is_staff);

  const options = useMemo(() => status?.available_modes ?? [], [status]);

  const currentMode = pendingMode ?? status?.mode ?? '';

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const nextMode = event.target.value;
    setPendingMode(nextMode);
    try {
      await setMode(nextMode);
    } catch (err) {
      console.error(err);
    } finally {
      setPendingMode(null);
    }
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Encryption Controls</h3>
        <div className="panel-actions">
          <button onClick={refresh} disabled={refreshing}>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>
      {loading && !status && <p>Loading encryption status…</p>}
      {error && <p className="error-text">{error}</p>}
      {status && (
        <div className="encryption-details">
          <p>
            <strong>Current mode:</strong> {status.label}
          </p>
          <p>
            <strong>Last updated:</strong> {new Date(status.updated_at).toLocaleString()}
          </p>
          <div className="encryption-options" role="radiogroup" aria-label="Encryption mode">
            {options.map((option) => (
              <label key={option.id} className={`encryption-option${currentMode === option.id ? ' active' : ''}`}>
                <input
                  type="radio"
                  name="encryption-mode"
                  value={option.id}
                  checked={currentMode === option.id}
                  onChange={handleChange}
                  disabled={!isAdmin || updating || pendingMode !== null}
                />
                <div>
                  <span className="option-label">{option.label}</span>
                  {option.description && <p className="option-description">{option.description}</p>}
                </div>
              </label>
            ))}
          </div>
          {!isAdmin && <p className="status">Admin privileges required to modify encryption mode.</p>}
        </div>
      )}
    </section>
  );
}
