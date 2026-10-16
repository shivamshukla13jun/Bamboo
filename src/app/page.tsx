import type { Metadata } from 'next';
import { StorefrontApp } from '../components/StorefrontApp';
import { ensureSeeded } from '../lib/seed';
import { Setting } from '../lib/models';
import { getEnrichedProducts } from '../lib/products';
import { DEFAULT_SEO_CONFIG } from '../lib/seed-data';
import { siteConfig } from '../config/site';
import { SeoConfig, Product, SortBy } from '../types';

// Always render fresh SEO + catalog server-side so crawlers get live content.
export const dynamic = 'force-dynamic';

async function loadSeo(): Promise<SeoConfig> {
  const doc = await Setting.findOne({ key: 'seo' }).lean();
  return { ...DEFAULT_SEO_CONFIG, ...((doc as any)?.value || {}) } as SeoConfig;
}

/** Meta tags resolved on the server BEFORE the page loads — driven by the SEO
 *  settings stored in MongoDB (admin SEO manager) with site.config.json defaults. */
export async function generateMetadata(): Promise<Metadata> {
  await ensureSeeded();
  const seo = await loadSeo();

  return {
    title: seo.siteTitle,
    description: seo.siteDescription,
    keywords: seo.keywords.split(',').map((k) => k.trim()).filter(Boolean),
    alternates: { canonical: seo.canonicalUrl || siteConfig.siteUrl },
    openGraph: {
      type: 'website',
      siteName: siteConfig.siteName,
      title: seo.siteTitle,
      description: seo.siteDescription,
      url: seo.canonicalUrl || siteConfig.siteUrl,
      images: seo.ogImageUrl ? [{ url: seo.ogImageUrl }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      site: seo.twitterHandle,
      title: seo.siteTitle,
      description: seo.siteDescription,
      images: seo.ogImageUrl ? [seo.ogImageUrl] : undefined
    },
    robots: { index: true, follow: true }
  };
}

/** Safely serialize the admin-managed JSON-LD schema */
function safeJsonLd(raw: string | undefined): string {
  const fallback = {
    '@context': 'https://schema.org',
    '@type': siteConfig.seo.siteType,
    name: siteConfig.siteName,
    description: siteConfig.brandDescription,
    url: siteConfig.siteUrl
  };
  try {
    return JSON.stringify(raw ? JSON.parse(raw) : fallback);
  } catch {
    return JSON.stringify(fallback);
  }
}

export default async function HomePage() {
  await ensureSeeded();
  const [seo, products] = await Promise.all([
    loadSeo(),
    getEnrichedProducts({})
  ]);

  // Match the default storefront query: featured first
  const initialProducts = (products as Product[]).sort(
    (a, b) => Number(b.isFeatured || false) - Number(a.isFeatured || false)
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(seo.jsonLdSchema) }}
      />
      <StorefrontApp initialProducts={initialProducts} initialSeo={seo} />
    </>
  );
}
