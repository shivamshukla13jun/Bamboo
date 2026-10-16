import type { Metadata } from 'next';
import { DashboardView } from '../../components/admin/DashboardView';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Dashboard' };

export default function AdminDashboardPage() {
  return <DashboardView />;
}
