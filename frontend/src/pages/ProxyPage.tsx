import { Link } from 'react-router-dom';
import { ProxyLogViewer } from '../components/ProxyLogViewer';
import { DecryptionTool } from '../components/DecryptionTool';
import { useAuth } from '../context/AuthContext';

export function ProxyPage() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Proxy Traffic</h1>
        <div className="user-info">
          <Link className="secondary" to="/">
            Back to chat
          </Link>
          <span>Signed in as {user?.username}</span>
          <button onClick={logout}>Log out</button>
        </div>
      </header>
      <main className="proxy-page">
        <DecryptionTool />
        <ProxyLogViewer />
      </main>
    </div>
  );
}
