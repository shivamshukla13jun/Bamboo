import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { siteConfig } from '../config/site';

/** Server-rendered theme vars so first paint already matches site.config.json */
function themeVarsStyle(): string {
  const slots: Record<string, string> = { primary: 'tp', accent: 'ta', neutral: 'tn' };
  const decls: string[] = [];
  for (const [slot, prefix] of Object.entries(slots)) {
    const palette = siteConfig.theme[slot as keyof typeof siteConfig.theme];
    if (!palette) continue;
    for (const [shade, hex] of Object.entries(palette)) {
      decls.push(`--${prefix}-${shade}:${hex};`);
    }
  }
  return `:root{${decls.join('')}}`;
}

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
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeVarsStyle() }} />
      </head>
      <body className="bg-neutral-950 text-neutral-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
