import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Bamboorise – Sustainable Bamboo Homes & Eco Products',
  description:
    'Shopify-style e-commerce platform for luxury bamboo eco-villas, prefab cabins, structural beams, strand woven flooring, and handcrafted kitchenware.',
  keywords:
    'bamboo home, bamboo prefab cabin, bamboo flooring, eco housing, bamboo furniture, sustainable materials',
  openGraph: {
    title: 'Bamboorise – Sustainable Bamboo Homes & Eco Products',
    description:
      'Shopify-style e-commerce platform for luxury bamboo eco-villas, prefab cabins, structural beams, strand woven flooring, and handcrafted kitchenware.',
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
    ]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-stone-950 text-stone-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
