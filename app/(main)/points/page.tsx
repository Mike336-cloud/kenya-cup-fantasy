import type { Metadata } from 'next';
import { PointsPage } from '@/components/points/PointsPage';
import { ProtectedPage } from '@/components/auth/ProtectedPage';

export const metadata: Metadata = {
  title: 'Gameweek Points | Kenya Cup Fantasy Rugby 26/27',
  description: 'View your fantasy rugby points breakdown for each gameweek in Kenya Cup Season 26/27.',
};

export default function Points() {
  return <ProtectedPage><PointsPage /></ProtectedPage>;
}
