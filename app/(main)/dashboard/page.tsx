import type { Metadata } from 'next';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { ProtectedPage } from '@/components/auth/ProtectedPage';

export const metadata: Metadata = {
  title: 'Dashboard | Kenya Cup Fantasy Rugby 26/27',
  description: 'Your Kenya Cup Fantasy Rugby dashboard — gameweek points, deadlines, fixtures, and top performers.',
};

export default function Dashboard() {
  return <ProtectedPage><DashboardPage /></ProtectedPage>;
}
