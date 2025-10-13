import { useEffect, useState } from 'react';
import { fetchFriends, removeFriend } from '../api/friends';
import type { User } from '../types';

interface Props {
  activeFriend: User | null;
  onSelectFriend: (friend: User) => void;
  refreshTrigger: number;
}

export function FriendList({ activeFriend, onSelectFriend, refreshTrigger }: Props) {
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFriends = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFriends();
      setFriends(data);
      if (data.length > 0 && (!activeFriend || !data.some((f) => f.id === activeFriend.id))) {
        onSelectFriend(data[0]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load friends.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const handleRemove = async (friend: User) => {
    setLoading(true);
    try {
      await removeFriend(friend.username);
      await loadFriends();
    } catch (err) {
      console.error(err);
      setError('Failed to remove friend.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="panel friend-list">
        <h3>Friends</h3>
        <p>Loading…</p>
      </section>
    );
  }

  return (
    <section className="panel friend-list">
      <h3>Friends</h3>
      {error && <p className="error-text">{error}</p>}
      {friends.length === 0 ? (
        <p>You have no friends yet. Send a request to get started.</p>
      ) : (
        <ul>
          {friends.map((friend) => (
            <li key={friend.id} className={activeFriend?.id === friend.id ? 'active' : ''}>
              <button className="link" onClick={() => onSelectFriend(friend)}>
                {friend.username}
              </button>
              <button className="danger" onClick={() => handleRemove(friend)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
