import { AdminDashboard } from '@/components/admin/AdminDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Portal | Kenya Cup Fantasy Rugby',
  description: 'Protected admin portal for Kenya Cup Fantasy Rugby Season 26/27.',
  robots: 'noindex, nofollow',
};

export default function AdminPage() {
  return <AdminDashboard />;
}
