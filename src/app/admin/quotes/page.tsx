import type { Metadata } from 'next';
import { HomeQuotesManager } from '../../../components/admin/HomeQuotesManager';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Quotes' };

export default function AdminQuotesPage() {
  return <HomeQuotesManager />;
}
