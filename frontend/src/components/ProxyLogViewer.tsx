import { useEffect, useState } from 'react';
import { clearProxyLogs, fetchProxyLogs } from '../api/client';
import type { ProxyLogEntry } from '../types';

export function ProxyLogViewer() {
  const [entries, setEntries] = useState<ProxyLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProxyLogs();
      setEntries(data.slice().reverse());
    } catch (err) {
      console.error(err);
      setError('Failed to fetch proxy logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    const interval = window.setInterval(loadLogs, 5000);
    return () => window.clearInterval(interval);
  }, []);

  const handleClear = async () => {
    try {
      await clearProxyLogs();
      await loadLogs();
    } catch (err) {
      console.error(err);
      setError('Failed to clear proxy logs.');
    }
  };

  return (
    <section className="panel proxy-log">
      <div className="panel-header">
        <h3>Proxy Traffic</h3>
        <div className="panel-actions">
          <button onClick={loadLogs}>Refresh</button>
          <button onClick={handleClear}>Clear</button>
        </div>
      </div>
      {loading && <p>Loading logs…</p>}
      {error && <p className="error-text">{error}</p>}
      <div className="log-entries">
        {entries.length === 0 ? (
          <p>No captured traffic yet.</p>
        ) : (
          <ul>
            {entries.map((entry, index) => (
              <li key={`${entry.timestamp}-${index}`}>
                <div className="log-meta">
                  <span className={`direction ${entry.direction}`}>{entry.direction}</span>
                  <time>{new Date(entry.timestamp).toLocaleString()}</time>
                  <span>{entry.method} {entry.path}</span>
                  {entry.status_code && <span>Status: {entry.status_code}</span>}
                </div>
                <pre>{JSON.stringify(entry.payload, null, 2)}</pre>
                {entry.headers && (
                  <details>
                    <summary>Headers</summary>
                    <pre>{JSON.stringify(entry.headers, null, 2)}</pre>
                  </details>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
