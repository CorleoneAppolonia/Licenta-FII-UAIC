import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BACKEND_BASE } from '../api/client';
import { fetchEncryptionStatus, updateEncryptionMode } from '../api/config';
import type { EncryptionStatus } from '../types';
import { useAuth } from './AuthContext';

interface EncryptionContextValue {
  status: EncryptionStatus | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  updating: boolean;
  refresh: () => Promise<void>;
  setMode: (mode: string) => Promise<void>;
}

const EncryptionContext = createContext<EncryptionContextValue | undefined>(undefined);

const STREAM_URL = `${BACKEND_BASE}/api/config/encryption/stream/`;

export function EncryptionProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const [status, setStatus] = useState<EncryptionStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const retryTimeout = useRef<number | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const teardownStream = useCallback(() => {
    if (retryTimeout.current) {
      window.clearTimeout(retryTimeout.current);
      retryTimeout.current = null;
    }
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
  }, []);

  const readStream = useCallback(async () => {
    if (!token) {
      return;
    }

    teardownStream();
    const controller = new AbortController();
    abortController.current = controller;

    try {
      const response = await fetch(STREAM_URL, {
        headers: {
          Authorization: `Token ${token}`,
        },
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error('Stream connection failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, { stream: true });

        let separatorIndex: number;
        while ((separatorIndex = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, separatorIndex);
          buffer = buffer.slice(separatorIndex + 2);

          const lines = rawEvent.split('\n');
          const dataLines: string[] = [];

          for (const line of lines) {
            if (line.startsWith('data:')) {
              dataLines.push(line.slice(5).trim());
            }
          }

          if (dataLines.length === 0) {
            continue;
          }

          const payload = dataLines.join('\n');
          try {
            const parsed = JSON.parse(payload) as EncryptionStatus;
            setStatus(parsed);
            setError(null);
          } catch (err) {
            console.error('Failed to parse SSE payload', err);
          }
        }
      }
    } catch (err) {
      if (controller.signal.aborted) {
        return;
      }

      console.error('Encryption stream error', err);
      setError('Lost connection to encryption updates. Retrying…');
      retryTimeout.current = window.setTimeout(readStream, 4000);
    }
  }, [teardownStream, token]);

  const refresh = useCallback(async () => {
    if (!token) {
      return;
    }
    setRefreshing(true);
    try {
      const result = await fetchEncryptionStatus();
      setStatus(result);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load encryption status.');
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token || !user) {
      setStatus(null);
      setError(null);
      teardownStream();
      return;
    }

    let active = true;
    setLoading(true);
    fetchEncryptionStatus()
      .then((result) => {
        if (!active) {
          return;
        }
        setStatus(result);
        setError(null);
        readStream();
      })
      .catch((err) => {
        console.error(err);
        if (!active) {
          return;
        }
        setError('Failed to load encryption status.');
      })
      .finally(() => {
        if (!active) {
          return;
        }
        setLoading(false);
      });

    return () => {
      active = false;
      teardownStream();
    };
  }, [readStream, teardownStream, token, user]);

  const setMode = useCallback(
    async (mode: string) => {
      if (!token) {
        return;
      }
      setUpdating(true);
      try {
        const result = await updateEncryptionMode(mode);
        setStatus(result);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to update encryption mode.');
        throw err;
      } finally {
        setUpdating(false);
      }
    },
    [token],
  );

  const value = useMemo(
    () => ({ status, loading, error, refreshing, updating, refresh, setMode }),
    [error, loading, refresh, refreshing, setMode, status, updating],
  );

  return <EncryptionContext.Provider value={value}>{children}</EncryptionContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEncryption() {
  const context = useContext(EncryptionContext);
  if (!context) {
    throw new Error('useEncryption must be used within an EncryptionProvider');
  }
  return context;
}
