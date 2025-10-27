import type { ProxyLogEntry } from '../types';

const API_BASE = import.meta.env.VITE_PROXY_URL ?? 'http://localhost:5000';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

interface RequestOptions extends RequestInit {
  json?: unknown;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { json, headers, ...rest } = options;
  const fetchHeaders = new Headers(headers ?? {});
  fetchHeaders.set('Content-Type', 'application/json');

  if (authToken) {
    fetchHeaders.set('Authorization', `Token ${authToken}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: fetchHeaders,
    body: json !== undefined ? JSON.stringify(json) : options.body,
  });

  let data: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    throw new ApiError('Request failed', response.status, data);
  }

  return data as T;
}

export async function fetchProxyLogs(): Promise<ProxyLogEntry[]> {
  return apiRequest<ProxyLogEntry[]>('/logs/');
}

export async function clearProxyLogs(): Promise<void> {
  await apiRequest('/logs/', { method: 'DELETE' });
}
