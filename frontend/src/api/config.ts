import { apiRequest } from './client';
import type { EncryptionStatus } from '../types';

export async function fetchEncryptionStatus(): Promise<EncryptionStatus> {
  return apiRequest<EncryptionStatus>('/config/encryption/');
}

export async function updateEncryptionMode(mode: string): Promise<EncryptionStatus> {
  return apiRequest<EncryptionStatus>('/config/encryption/', {
    method: 'PUT',
    json: { mode },
  });
}
