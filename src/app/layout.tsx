import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { siteConfig } from '../config/site';

export const metadata: Metadata = {
  title: siteConfig.seo.siteTitle,
  description: siteConfig.seo.siteDescription,
  keywords: siteConfig.seo.keywords,
  openGraph: {
    title: siteConfig.seo.siteTitle,
    description: siteConfig.seo.siteDescription,
    url: siteConfig.siteUrl,
    images: [siteConfig.seo.ogImageUrl]
  },
  twitter: {
    site: siteConfig.seo.twitterHandle
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-stone-950 text-stone-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
