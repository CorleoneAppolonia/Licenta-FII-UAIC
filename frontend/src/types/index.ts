export interface User {
  id: number;
  username: string;
  is_staff: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface FriendRequest {
  id: number;
  from_user: User;
  to_user: User;
  status: string;
  created_at: string;
  responded_at: string | null;
}

export interface FriendRequests {
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
}

export interface Message {
  id: number;
  sender: User;
  content: string;
  encryption_type: EncryptionMode;
  created_at: string;
}

export type EncryptionMode =
  | 'PLAINTEXT'
  | 'WEAK_XOR'
  | 'END_TO_END'
  | 'END_TO_END_STEGO';

export interface EncryptionSetting {
  mode: EncryptionMode;
  updated_at: string;
}

export interface ProxyLogEntry {
  direction: 'client_to_server' | 'server_to_client';
  timestamp: string;
  path: string;
  method: string;
  payload: unknown;
  status_code?: number;
  headers?: Record<string, string>;
}
