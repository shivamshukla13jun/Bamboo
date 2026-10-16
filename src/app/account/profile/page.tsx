import type { Metadata } from 'next';
import { AccountProfile } from '../../../components/account/AccountProfile';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Profile & Security' };

export default function AccountProfilePage() {
  return <AccountProfile />;
}
