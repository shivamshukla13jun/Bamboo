import type { Metadata } from 'next';
import { AccountOverview } from '../../components/account/AccountOverview';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Overview' };

export default function AccountPage() {
  return <AccountOverview />;
}
