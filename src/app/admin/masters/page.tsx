import type { Metadata } from 'next';
import { MastersManager } from '../../../components/admin/MastersManager';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Masters' };

export default function AdminMastersPage() {
  return <MastersManager />;
}
