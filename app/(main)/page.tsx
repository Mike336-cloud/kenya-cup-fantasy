import type { Metadata } from 'next';
import { LandingPage } from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'Kenya Cup Fantasy Rugby | Season 26/27',
  description: 'Build your dream XV from 12 Kenya Cup clubs. Pick, captain and trade your way to the top of the leaderboard.',
};

export default function Home() {
  return <LandingPage />;
}
