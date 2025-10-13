import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FriendList } from '../components/FriendList';
import { FriendRequestsPanel } from '../components/FriendRequestsPanel';
import { ChatWindow } from '../components/ChatWindow';
import type { User } from '../types';
import { AppShell } from '../components/AppShell';
import { EncryptionStatusCard } from '../components/EncryptionStatusCard';

export function DashboardPage() {
  const { user } = useAuth();
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    setSelectedFriend(null);
  }, [user?.id]);

  const handleFriendDataChanged = () => {
    setRefreshCounter((count) => count + 1);
  };

  return (
    <AppShell title="Steganography Chat">
      <div className="sidebar">
        <FriendRequestsPanel onUpdate={handleFriendDataChanged} />
        <FriendList
          activeFriend={selectedFriend}
          onSelectFriend={setSelectedFriend}
          refreshTrigger={refreshCounter}
        />
      </div>
      <div className="main-area">
        <EncryptionStatusCard />
        <ChatWindow friend={selectedFriend} />
      </div>
    </AppShell>
  );
}
