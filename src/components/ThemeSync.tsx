'use client';
import { useEffect } from 'react';
import { siteConfig } from '../config/site';

const SLOT_VARS: Record<string, string> = {
  primary: 'tp',
  accent: 'ta',
  neutral: 'tn'
};

/**
 * Applies site.config.json theme palettes to the CSS variables that back the
 * primary-/accent-/neutral- Tailwind utilities. Change the hex values in
 * site.config.json to re-skin the entire app without touching code.
 */
export const ThemeSync: React.FC = () => {
  useEffect(() => {
    const root = document.documentElement;
    for (const [slot, prefix] of Object.entries(SLOT_VARS)) {
      const palette = siteConfig.theme[slot as keyof typeof siteConfig.theme] as
        | Record<string, string>
        | undefined;
      if (!palette) continue;
      for (const [shade, hex] of Object.entries(palette)) {
        root.style.setProperty(`--${prefix}-${shade}`, hex);
      }
    }
  }, []);

  return null;
};
