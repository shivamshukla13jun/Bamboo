import type { Metadata } from 'next';
import { StorageManager } from '../../../components/admin/StorageManager';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'File Uploads' };

export default function AdminStoragePage() {
  return <StorageManager />;
}
