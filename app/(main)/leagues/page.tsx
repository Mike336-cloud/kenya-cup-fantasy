import type { Metadata } from 'next';
import { LeaguesPage } from '@/components/leagues/LeaguesPage';
import { ProtectedPage } from '@/components/auth/ProtectedPage';

export const metadata: Metadata = {
  title: 'Leagues | Kenya Cup Fantasy Rugby 26/27',
  description: 'Join or create mini-leagues. Compete with friends and track your standings in Kenya Cup Fantasy Rugby Season 26/27.',
};

export default function Leagues() {
  return <ProtectedPage><LeaguesPage /></ProtectedPage>;
}
