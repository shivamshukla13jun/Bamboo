import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SeoConfig } from '../types';

const siteOrigin =
  typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'https://bamboorise.ai.studio';

const initialState: SeoConfig = {
  siteTitle: 'Bamboorise – Sustainable Bamboo Homes & Eco Products',
  siteDescription: 'Shopify-style e-commerce platform for luxury bamboo eco-villas, prefab cabins, structural beams, strand woven flooring, and handcrafted kitchenware.',
  keywords: 'bamboo home, bamboo prefab cabin, bamboo flooring, eco housing, bamboo furniture, sustainable materials',
  ogImageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
  twitterHandle: '@bamboorise',
  canonicalUrl: siteOrigin,
  jsonLdSchema: JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Store',
    'name': 'Bamboorise',
    'description': 'Shopify-style bamboo homes & products e-commerce platform',
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
