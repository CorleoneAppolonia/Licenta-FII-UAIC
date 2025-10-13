import { useEffect, useState } from 'react';
import { fetchFriendRequests, respondToFriendRequest, sendFriendRequest } from '../api/friends';
import type { FriendRequest, FriendRequests } from '../types';

interface Props {
  onUpdate: () => void;
}

export function FriendRequestsPanel({ onUpdate }: Props) {
  const [friendRequests, setFriendRequests] = useState<FriendRequests>({ incoming: [], outgoing: [] });
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFriendRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFriendRequests();
      setFriendRequests(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load friend requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFriendRequests();
  }, []);

  const handleSendRequest = async () => {
    if (!username.trim()) {
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await sendFriendRequest(username.trim());
      setUsername('');
      await loadFriendRequests();
      onUpdate();
    } catch (err) {
      console.error(err);
      setError('Unable to send friend request.');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (request: FriendRequest, action: 'accept' | 'decline') => {
    setLoading(true);
    try {
      await respondToFriendRequest(request.id, action);
      await loadFriendRequests();
      onUpdate();
    } catch (err) {
      console.error(err);
      setError('Failed to update friend request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel">
      <h3>Friend Requests</h3>
      <div className="friend-request-form">
        <input
          type="text"
          placeholder="Search username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <button onClick={handleSendRequest}>Send Request</button>
      </div>
      {error && <p className="error-text">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="friend-requests">
          <div>
            <h4>Incoming</h4>
            {friendRequests.incoming.length === 0 && <p>No incoming requests.</p>}
            <ul>
              {friendRequests.incoming.map((request) => (
                <li key={request.id}>
                  <span>{request.from_user.username}</span>
                  <div className="actions">
                    <button onClick={() => handleRespond(request, 'accept')}>Accept</button>
                    <button onClick={() => handleRespond(request, 'decline')}>Decline</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Outgoing</h4>
            {friendRequests.outgoing.length === 0 && <p>No outgoing requests.</p>}
            <ul>
              {friendRequests.outgoing.map((request) => (
                <li key={request.id}>
                  <span>{request.to_user.username}</span>
                  <span className="status">Pending</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
