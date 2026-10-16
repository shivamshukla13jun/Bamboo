import type { Metadata } from 'next';
import { AccountQuotes } from '../../../components/account/AccountQuotes';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'My Quotes' };

export default function AccountQuotesPage() {
  return <AccountQuotes />;
}
