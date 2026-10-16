import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductPageClient } from '../../../components/ProductPageClient';
import { ensureSeeded } from '../../../lib/seed';
import { getEnrichedProduct } from '../../../lib/products';
import { resolvePageSeo, canonicalFor } from '../../../lib/seo';
import { siteConfig } from '../../../config/site';
import { Product } from '../../../types';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ slug: string }> };

async function loadProduct(slug: string): Promise<Product | null> {
  await ensureSeeded();
  return (await getEnrichedProduct(slug)) as Product | null;
}

/** Per-product metadata — resolved server-side before the page loads */
export async function generateMetadata({ params }: Ctx): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return { title: `Product Not Found | ${siteConfig.siteName}` };

  // Per-page SEO record (admin SEO manager) overrides product-level fields
  const pageSeo = await resolvePageSeo(`/products/${product.slug}`, {
    title: product.seoTitle || `${product.name} | ${siteConfig.siteName}`,
    description: product.seoDescription || product.description,
    keywords: product.seoKeywords,
    ogImageUrl: product.images?.[0]
  });
  const canonical = canonicalFor(`/products/${product.slug}`);

  return {
    title: pageSeo.title,
    description: pageSeo.description,
    keywords: pageSeo.keywords,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      siteName: siteConfig.siteName,
      title: pageSeo.title,
      description: pageSeo.description,
      url: canonical,
      images: pageSeo.ogImageUrl ? [{ url: pageSeo.ogImageUrl }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      site: siteConfig.seo.twitterHandle,
      title: pageSeo.title,
      description: pageSeo.description,
      images: pageSeo.ogImageUrl ? [pageSeo.ogImageUrl] : undefined
    }
  };
}

/** schema.org/Product structured data — enables Google rich results */
function productJsonLd(p: Product) {
  const offers = (p.variants?.length ? p.variants : [undefined]).map((v: any) => ({
    '@type': 'Offer',
    url: `${siteConfig.siteUrl}/products/${p.slug}`,
    priceCurrency: siteConfig.commerce.defaultCurrency,
    price: v?.price ?? p.price,
    sku: v?.sku,
    name: v?.name,
    availability:
      (v?.stock ?? p.stock) > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock'
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.seoDescription || p.description,
    image: p.images,
    sku: p.id,
    brand: { '@type': 'Brand', name: siteConfig.siteName },
    category: p.categoryName,
    offers: offers.length > 1 ? { '@type': 'AggregateOffer', lowPrice: Math.min(...offers.map((o) => o.price)), highPrice: Math.max(...offers.map((o) => o.price)), offerCount: offers.length, offers } : offers[0],
    ...(p.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: p.rating,
            reviewCount: p.reviewsCount || 1
          }
        }
      : {})
  };
}

export default async function ProductPage({ params }: Ctx) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
      />
      <ProductPageClient product={product} />
    </>
  );
}
