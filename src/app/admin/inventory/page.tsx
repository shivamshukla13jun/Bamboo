import type { Metadata } from 'next';
import { InventoryManager } from '../../../components/admin/InventoryManager';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Inventory' };

export default function AdminInventoryPage() {
  return <InventoryManager />;
}
