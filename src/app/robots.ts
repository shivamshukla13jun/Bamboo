import type { MetadataRoute } from 'next';
import { siteConfig } from '../config/site';

/** robots.txt — allow all pages, keep API out of the index */
export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.siteUrl.replace(/\/$/, '');
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: `${base}/sitemap.xml`
  };
}
