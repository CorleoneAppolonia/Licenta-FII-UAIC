import { Navigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { EncryptionStatusCard } from '../components/EncryptionStatusCard';
import { useAuth } from '../context/AuthContext';

export function AdminPage() {
  const { user } = useAuth();

  if (!user?.is_staff) {
    return <Navigate to="/" replace />;
  }

  return (
    <AppShell title="Admin Controls" contentClassName="single-column">
      <EncryptionStatusCard />
    </AppShell>
  );
}
