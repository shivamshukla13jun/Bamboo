import type { Metadata } from 'next';
import { StorefrontApp } from '../components/StorefrontApp';
import { ensureSeeded } from '../lib/seed';
import { getEnrichedProducts } from '../lib/products';
import { getGlobalSeo, resolvePageSeo, canonicalFor } from '../lib/seo';
import { siteConfig } from '../config/site';
import { SeoConfig, Product } from '../types';

// Always render fresh SEO + catalog server-side so crawlers get live content.
export const dynamic = 'force-dynamic';

async function loadSeo(): Promise<SeoConfig> {
  return getGlobalSeo();
}

/** Meta tags resolved on the server BEFORE the page loads — per-page SEO
 *  record (admin SEO manager) > global settings > site.config.json. */
export async function generateMetadata(): Promise<Metadata> {
  await ensureSeeded();
  const [seo, pageSeo] = await Promise.all([getGlobalSeo(), resolvePageSeo('/')]);
  const canonical = canonicalFor('/');

  return {
    title: pageSeo.title,
    description: pageSeo.description,
    keywords: pageSeo.keywords,
    alternates: { canonical: seo.canonicalUrl || canonical },
    openGraph: {
      type: 'website',
      siteName: siteConfig.siteName,
      title: pageSeo.title,
      description: pageSeo.description,
      url: seo.canonicalUrl || canonical,
      images: pageSeo.ogImageUrl ? [{ url: pageSeo.ogImageUrl }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      site: seo.twitterHandle,
      title: pageSeo.title,
      description: pageSeo.description,
      images: pageSeo.ogImageUrl ? [pageSeo.ogImageUrl] : undefined
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
