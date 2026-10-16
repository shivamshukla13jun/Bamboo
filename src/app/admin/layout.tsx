import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from '../../lib/auth';
import { UserRole } from '../../types';
import { siteConfig } from '../../config/site';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminLogin } from '../../components/auth/AdminLogin';

// Admin pages are never indexed — SEO only applies to public routes.
export const metadata: Metadata = {
  title: {
    default: 'Admin',
    template: `%s — ${siteConfig.siteName} Admin`
  },
  robots: { index: false, follow: false }
};

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySessionToken(token) : null;

  if (!session || session.role !== UserRole.Admin) {
    return <AdminLogin />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
