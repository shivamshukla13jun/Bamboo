import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from '../../lib/auth';
import { siteConfig } from '../../config/site';
import { AccountShell } from '../../components/account/AccountShell';
import { AccountGate } from '../../components/account/AccountGate';

// Private customer pages — never indexed.
export const metadata: Metadata = {
  title: {
    default: 'My Account',
    template: `%s — ${siteConfig.siteName}`
  },
  robots: { index: false, follow: false }
};

export default async function AccountRootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    return <AccountGate />;
  }

  return <AccountShell>{children}</AccountShell>;
}
