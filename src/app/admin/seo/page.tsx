import type { Metadata } from 'next';
import { SeoManager } from '../../../components/admin/SeoManager';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'SEO' };

export default function AdminSeoPage() {
  return <SeoManager />;
}
