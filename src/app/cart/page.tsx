import type { Metadata } from 'next';
import { CartPageClient } from '../../components/CartPageClient';
import { siteConfig } from '../../config/site';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: `Shopping Bag | ${siteConfig.siteName}`,
  robots: { index: false, follow: false }
};

export default function CartPage() {
  return <CartPageClient />;
}
