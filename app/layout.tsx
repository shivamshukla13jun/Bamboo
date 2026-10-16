import React from 'react';

export const metadata = {
  title: 'Bamboorise - Bamboo Homes & E-Commerce Platform',
  description: 'Shopify-style e-commerce platform for sustainable bamboo homes, prefabs, furniture, flooring, and eco-products.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-stone-50 text-stone-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
