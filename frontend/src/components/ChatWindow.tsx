import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchMessages, sendMessage } from '../api/messages';
import type { Message, User } from '../types';

interface Props {
  friend: User | null;
}

export function ChatWindow({ friend }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!friend) {
      setMessages([]);
      return;
    }

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMessages(friend.username);
        setMessages(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load messages.');
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    };

    run();
  }, [friend, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const handleSend = async () => {
    if (!friend || !messageText.trim()) {
      return;
    }
    try {
      const newMessage = await sendMessage(friend.username, messageText.trim());
      setMessages((prev) => [...prev, newMessage]);
      setMessageText('');
      setError(null);
      scrollToBottom();
    } catch (err) {
      console.error(err);
      setError('Failed to send message.');
    }
  };

  return (
    <section className="panel chat-window">
      <h3>Conversation</h3>
      {!friend ? (
        <p>Select a friend to start chatting.</p>
      ) : (
        <>
          <div className="messages" aria-live="polite">
            {loading && <p>Loading conversation…</p>}
            {messages.map((message) => (
              <div key={message.id} className="message">
                <div className="message-meta">
                  <span className="sender">{message.sender.username}</span>
                  <time>{new Date(message.created_at).toLocaleTimeString()}</time>
                </div>
                <p>{message.content}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="message-input">
            <textarea
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              placeholder="Type your message"
              rows={3}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </>
      )}
    </section>
  );
}
