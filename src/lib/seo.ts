import { Setting, PageSeo, clean } from './models';
import { DEFAULT_SEO_CONFIG } from './seed-data';
import { PageSeo as PageSeoType, SeoConfig } from '../types';
import { siteConfig } from '../config/site';

/** Global site-wide SEO config (settings.seo + config fallbacks) */
export async function getGlobalSeo(): Promise<SeoConfig> {
  const doc = await Setting.findOne({ key: 'seo' }).lean();
  return { ...DEFAULT_SEO_CONFIG, ...((doc as any)?.value || {}) } as SeoConfig;
}

/** Per-page SEO record if the admin has customized this route */
export async function getPageSeo(path: string): Promise<PageSeoType | null> {
  const doc = await PageSeo.findOne({ path }).lean();
  return doc ? clean<PageSeoType>(doc) : null;
}

export interface ResolvedSeo {
  title: string;
  description: string;
  keywords: string[];
  ogImageUrl?: string;
}

/**
 * Resolve the effective SEO for a route:
 *   per-page record (admin SEO manager) -> per-page fallback -> global settings -> config.
 */
export async function resolvePageSeo(
  path: string,
  fallback?: Partial<ResolvedSeo>
): Promise<ResolvedSeo> {
  const [page, global] = await Promise.all([getPageSeo(path), getGlobalSeo()]);

  return {
    title: page?.title || fallback?.title || global.siteTitle,
    description: page?.description || fallback?.description || global.siteDescription,
    keywords:
      page?.keywords?.length
        ? page.keywords
        : fallback?.keywords?.length
          ? fallback.keywords
          : global.keywords.split(',').map((k) => k.trim()).filter(Boolean),
    ogImageUrl: page?.ogImageUrl || fallback?.ogImageUrl || global.ogImageUrl
  };
}

/** Canonical URL helper — always siteUrl + path */
export function canonicalFor(path: string): string {
  const base = siteConfig.siteUrl.replace(/\/$/, '');
  return path === '/' ? base : `${base}${path}`;
}
