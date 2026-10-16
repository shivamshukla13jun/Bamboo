import config from '../../site.config.json';
import { CouponType } from '../types';

export interface CurrencyConfig {
  rate: number;
  symbol: string;
  label: string;
}

export interface CouponConfig {
  type: CouponType;
  value: number;
}

/** Tailwind-style color scale (50–950) for a theme slot */
export interface ThemePalette {
  [shade: string]: string;
}

export interface PricePresetConfig {
  key: string;
  label: string;
  min: number;
  max: number;
  categorySlug?: string;
  highlight?: boolean;
}

export interface PaymentMethodConfig {
  code: string;
  label: string;
}

export interface AdminNavItem {
  tab: string;
  label: string;
}

export interface ThemeConfig {
  /** Main brand/action color (was emerald) */
  primary: ThemePalette;
  /** Highlight/CTA color (was amber) */
  accent: ThemePalette;
  /** Dark background + text tones (was stone) */
  neutral: ThemePalette;
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
  theme: ThemeConfig;
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
    paymentMethods: PaymentMethodConfig[];
  };
  seo: {
    siteTitle: string;
    siteDescription: string;
    keywords: string;
    ogImageUrl: string;
    twitterHandle: string;
    siteType: string;
  };
  pricePresets: PricePresetConfig[];
  customizer: {
    badge: string;
    title: string;
    subtitle: string;
    estimatedLabel: string;
    stepLabels: {
      homeType: string;
      species: string;
      roofStyle: string;
    };
    areaLabel: string;
    areaMin: number;
    areaMax: number;
    areaStep: number;
    defaultArea: number;
    storiesLabel: string;
    storiesOptions: { value: number; label: string }[];
    defaultStories: number;
    extraStoryCost: number;
    solarLabel: string;
    solarDescription: string;
    solarAddonCost: number;
    contactTitle: string;
    submitText: string;
    pendingText: string;
    successTitle: string;
    successText: string;
    successCta: string;
  };
  adminNav: AdminNavItem[];
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
