import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SeoConfig } from '../types';
import { siteConfig } from '../config/site';

const siteOrigin =
  typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : siteConfig.siteUrl;

const initialState: SeoConfig = {
  siteTitle: siteConfig.seo.siteTitle,
  siteDescription: siteConfig.seo.siteDescription,
  keywords: siteConfig.seo.keywords,
  ogImageUrl: siteConfig.seo.ogImageUrl,
  twitterHandle: siteConfig.seo.twitterHandle,
  canonicalUrl: siteOrigin,
  jsonLdSchema: JSON.stringify({
    '@context': 'https://schema.org',
    '@type': siteConfig.seo.siteType,
    'name': siteConfig.siteName,
    'description': siteConfig.brandDescription,
    'url': siteOrigin
  }, null, 2)
};

export const seoSlice = createSlice({
  name: 'seo',
  initialState,
  reducers: {
    setSeoConfig: (state, action: PayloadAction<Partial<SeoConfig>>) => {
      Object.assign(state, action.payload);
      
      // Dynamic DOM Head Updates for SEO
      if (typeof document !== 'undefined') {
        if (action.payload.siteTitle) {
          document.title = action.payload.siteTitle;
          const ogTitle = document.querySelector('meta[property="og:title"]');
          if (ogTitle) ogTitle.setAttribute('content', action.payload.siteTitle);
        }
        if (action.payload.siteDescription) {
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) metaDesc.setAttribute('content', action.payload.siteDescription);
          const ogDesc = document.querySelector('meta[property="og:description"]');
          if (ogDesc) ogDesc.setAttribute('content', action.payload.siteDescription);
        }
        if (action.payload.ogImageUrl) {
          let ogImg = document.querySelector('meta[property="og:image"]');
          if (!ogImg) {
            ogImg = document.createElement('meta');
            ogImg.setAttribute('property', 'og:image');
            document.head.appendChild(ogImg);
          }
          ogImg.setAttribute('content', action.payload.ogImageUrl);
        }
      }
    }
  }
});

export const { setSeoConfig } = seoSlice.actions;

export default seoSlice.reducer;
