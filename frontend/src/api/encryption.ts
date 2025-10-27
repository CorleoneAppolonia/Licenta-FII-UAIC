import { apiRequest } from './client';
import type { EncryptionMode, EncryptionSetting } from '../types';

const CACHE_TTL_MS = 10_000;

let cachedSetting: EncryptionSetting | null = null;
let cachedAt = 0;

export async function fetchAdminEncryptionSetting(): Promise<EncryptionSetting> {
  return apiRequest<EncryptionSetting>('/admin/encryption-mode/');
}

export async function updateEncryptionSetting(mode: EncryptionMode): Promise<{ mode: EncryptionMode; updated: boolean }> {
  const response = await apiRequest<{ mode: EncryptionMode; updated: boolean }>('/admin/encryption-mode/', {
    method: 'POST',
    json: { mode },
  });
  clearEncryptionCache();
  return response;
}

export async function fetchActiveEncryptionSetting(forceRefresh = false): Promise<EncryptionSetting> {
  const withinCacheWindow = Date.now() - cachedAt < CACHE_TTL_MS;
  if (!forceRefresh && cachedSetting && withinCacheWindow) {
    return cachedSetting;
  }
  const result = await apiRequest<EncryptionSetting>('/encryption/mode/');
  cachedSetting = result;
  cachedAt = Date.now();
  return result;
}

export function clearEncryptionCache() {
  cachedSetting = null;
  cachedAt = 0;
}
