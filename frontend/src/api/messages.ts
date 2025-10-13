import { apiRequest } from './client';
import type { Message } from '../types';

export async function fetchMessages(username: string): Promise<Message[]> {
  return apiRequest<Message[]>(`/messages/${username}/`);
}

export async function sendMessage(username: string, content: string): Promise<Message> {
  return apiRequest<Message>(`/messages/${username}/`, {
    method: 'POST',
    json: { content },
  });
}
