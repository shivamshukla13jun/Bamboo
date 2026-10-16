import config from '../../site.config.json';

export interface CurrencyConfig {
  rate: number;
  symbol: string;
  label: string;
}

export interface CouponConfig {
  type: 'percentage' | 'fixed';
  value: number;
}

export interface SiteConfig {
  siteName: string;
  tagline: string;
  logoEmoji: string;
  adminBadgeEmoji: string;
  adminTitle: string;
  adminPanelName: string;
  adminPoweredBy: string;
  brandDescription: string;
  siteUrl: string;
  contact: {
    address: string;
    phone: string;
    email: string;
  };
  topbar: {
    promoBadge: string;
    promoText: string;
    rightText: string;
  };
  searchPlaceholder: string;
  customizerLinkText: string;
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    browseLabel: string;
    trustHighlights: string[];
    featuredCard: {
      badge: string;
      title: string;
      subtitle: string;
      image: string;
      originalPrice: string;
      price: string;
      ctaText: string;
    };
  };
  footer: {
    categoriesHeading: string;
    categoryLinks: string[];
    techHeading: string;
    techItems: string[];
    guaranteeHeading: string;
    guaranteeTitle: string;
    guaranteeText: string;
    copyright: string;
    note: string;
  };
  commerce: {
    defaultCurrency: string;
    currencies: Record<string, CurrencyConfig>;
    shippingCost: number;
    freeShippingThreshold: number;
    couponHint: string;
    coupons: Record<string, CouponConfig>;
  };
  seo: {
    siteTitle: string;
    siteDescription: string;
    keywords: string;
    ogImageUrl: string;
    twitterHandle: string;
    siteType: string;
  };
  customizer: {
    successTitle: string;
    successText: string;
    successCta: string;
  };
}

/**
 * All site-wide branding, copy, commerce and SEO defaults live in
 * site.config.json — edit that file to re-skin the whole app.
 */
export const siteConfig = config as SiteConfig;

/** Convenience map: currency code -> conversion rate (for reducers/formatters) */
export const currencyRates: Record<string, number> = Object.fromEntries(
  Object.entries(siteConfig.commerce.currencies).map(([code, c]) => [code, c.rate])
);

/** Convenience map: currency code -> symbol */
export const currencySymbols: Record<string, string> = Object.fromEntries(
  Object.entries(siteConfig.commerce.currencies).map(([code, c]) => [code, c.symbol])
);

/** All supported currency codes (drives the header picker options) */
export const currencyCodes = Object.keys(siteConfig.commerce.currencies);
