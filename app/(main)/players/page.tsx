import type { Metadata } from 'next';
import { PlayersPage } from '@/components/players/PlayersPage';
import { ProtectedPage } from '@/components/auth/ProtectedPage';

export const metadata: Metadata = {
  title: 'Players | Kenya Cup Fantasy Rugby 26/27',
  description: 'Browse all Kenya Cup players by position, club, tier and price. Compare stats and add them to your fantasy squad.',
};

export default function Players() {
  return <ProtectedPage><PlayersPage /></ProtectedPage>;
}
