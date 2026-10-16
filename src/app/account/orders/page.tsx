import type { Metadata } from 'next';
import { AccountOrders } from '../../../components/account/AccountOrders';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'My Orders' };

export default function AccountOrdersPage() {
  return <AccountOrders />;
}
