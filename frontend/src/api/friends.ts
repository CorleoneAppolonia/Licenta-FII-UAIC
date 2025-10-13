import { apiRequest } from './client';
import type { FriendRequests, User } from '../types';

export async function fetchFriendRequests(): Promise<FriendRequests> {
  return apiRequest<FriendRequests>('/friends/requests/');
}

export async function sendFriendRequest(username: string) {
  return apiRequest('/friends/requests/send/', {
    method: 'POST',
    json: { username },
  });
}

export async function respondToFriendRequest(requestId: number, action: 'accept' | 'decline') {
  return apiRequest(`/friends/requests/${requestId}/respond/`, {
    method: 'POST',
    json: { action },
  });
}

export async function fetchFriends(): Promise<User[]> {
  return apiRequest<User[]>('/friends/');
}

export async function removeFriend(username: string) {
  return apiRequest(`/friends/${username}/remove/`, {
    method: 'DELETE',
  });
}
