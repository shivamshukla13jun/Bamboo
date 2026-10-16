import type { MetadataRoute } from 'next';
import { ensureSeeded } from '../lib/seed';
import { Product } from '../lib/models';
import { siteConfig } from '../config/site';

export const dynamic = 'force-dynamic';

/** Dynamic sitemap — home + every product page, regenerated per request */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.siteUrl.replace(/\/$/, '');

  try {
    await ensureSeeded();
    const products = await Product.find({}, 'id slug updatedAt createdAt').lean();
    return [
      { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
      ...products.map((p: any) => ({
        url: `${base}/products/${p.slug || p.id}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8
      }))
    ];
  } catch {
    return [{ url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 }];
  }
}
