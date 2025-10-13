import { AppShell } from '../components/AppShell';
import { ProxyLogViewer } from '../components/ProxyLogViewer';
import { EncryptionStatusCard } from '../components/EncryptionStatusCard';

export function ProxyPage() {
  return (
    <AppShell title="Proxy Monitor" contentClassName="single-column">
      <EncryptionStatusCard />
      <ProxyLogViewer />
    </AppShell>
  );
}
