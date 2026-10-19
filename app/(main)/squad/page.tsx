import type { Metadata } from 'next';
import { SquadBuilderPage } from '@/components/squad/SquadBuilderPage';
import { ProtectedPage } from '@/components/auth/ProtectedPage';

export const metadata: Metadata = {
  title: 'My Squad | Kenya Cup Fantasy Rugby 26/27',
  description: 'Build and manage your Kenya Cup Fantasy Rugby squad. Pick 15 players across all positions within your KES 100M budget.',
};

export default function SquadPage() {
  return <ProtectedPage><SquadBuilderPage /></ProtectedPage>;
}
