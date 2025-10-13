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
  ciphertext: string | null;
  encryption_mode: string;
  created_at: string;
}

export interface EncryptionModeOption {
  id: string;
  label: string;
  description?: string | null;
}

export interface EncryptionStatus {
  mode: string;
  label: string;
  updated_at: string;
  available_modes: EncryptionModeOption[];
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
