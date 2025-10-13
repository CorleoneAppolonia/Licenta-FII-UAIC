import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEncryption } from '../context/EncryptionContext';

interface AppShellProps {
  title: string;
  children: React.ReactNode;
  contentClassName?: string;
}

export function AppShell({ title, children, contentClassName }: AppShellProps) {
  const { user, logout } = useAuth();
  const { status } = useEncryption();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>{title}</h1>
          {status && (
            <span className="encryption-chip" title={`Last updated ${new Date(status.updated_at).toLocaleString()}`}>
              Encryption: {status.label}
            </span>
          )}
        </div>
        <nav className="main-nav" aria-label="Primary">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/proxy">Proxy Monitor</NavLink>
          {user?.is_staff && <NavLink to="/admin">Admin Controls</NavLink>}
        </nav>
        <div className="user-info">
          <span>
            Signed in as {user?.username}
            {user?.is_staff ? ' (admin)' : ''}
          </span>
          <button onClick={logout}>Log out</button>
        </div>
      </header>
      <main className={contentClassName ?? 'dashboard-content'}>{children}</main>
    </div>
  );
}
