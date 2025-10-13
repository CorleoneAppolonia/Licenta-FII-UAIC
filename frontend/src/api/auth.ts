import { apiRequest, setAuthToken } from './client';
import type { AuthResponse, User } from '../types';

export async function register(username: string, password: string): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/auth/register/', {
    method: 'POST',
    json: { username, password },
  });
  setAuthToken(response.token);
  return response;
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/auth/login/', {
    method: 'POST',
    json: { username, password },
  });
  setAuthToken(response.token);
  return response;
}

export async function fetchCurrentUser(): Promise<User> {
  return apiRequest<User>('/auth/me/');
}
