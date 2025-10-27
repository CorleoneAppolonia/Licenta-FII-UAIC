import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FriendList } from '../components/FriendList';
import { FriendRequestsPanel } from '../components/FriendRequestsPanel';
import { ChatWindow } from '../components/ChatWindow';
import type { User } from '../types';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    setSelectedFriend(null);
  }, [user?.id]);

  const handleFriendDataChanged = () => {
    setRefreshCounter((count) => count + 1);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Steganography Chat</h1>
        <div className="user-info">
          {user?.is_staff && (
            <Link className="secondary" to="/admin">
              Admin controls
            </Link>
          )}
          <Link className="secondary" to="/proxy">
            View proxy traffic
          </Link>
          <span>Signed in as {user?.username}</span>
          <button onClick={logout}>Log out</button>
        </div>
      </header>
      <main className="dashboard-content">
        <div className="sidebar">
          <FriendRequestsPanel onUpdate={handleFriendDataChanged} />
          <FriendList
            activeFriend={selectedFriend}
            onSelectFriend={setSelectedFriend}
            refreshTrigger={refreshCounter}
          />
        </div>
        <div className="main-area">
          <ChatWindow friend={selectedFriend} />
        </div>
      </main>
    </div>
  );
}
