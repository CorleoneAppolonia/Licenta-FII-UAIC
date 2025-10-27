import { apiRequest } from './client';
import { fetchActiveEncryptionSetting } from './encryption';
import { decryptContent, encryptContent } from '../utils/encryption';
import type { Message } from '../types';

export async function fetchMessages(username: string): Promise<Message[]> {
  const data = await apiRequest<Message[]>(`/messages/${username}/`);
  return data.map((message) => ({
    ...message,
    content: decryptContent(message.content, message.encryption_type),
  }));
}

export async function sendMessage(username: string, content: string): Promise<Message> {
  const setting = await fetchActiveEncryptionSetting(true);
  const ciphertext = encryptContent(content, setting.mode);
  const response = await apiRequest<Message>(`/messages/${username}/`, {
    method: 'POST',
    json: { content: ciphertext },
  });
  return {
    ...response,
    content: decryptContent(response.content, response.encryption_type),
  };
}
