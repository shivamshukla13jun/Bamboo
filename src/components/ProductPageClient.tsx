'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { toggleCartDrawer } from '../store/cartSlice';
import { Product } from '../types';
import { siteConfig } from '../config/site';
import { ProductDetailBody } from './ProductDetailBody';
import { CartDrawer } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import { Footer } from './Footer';
import { ArrowLeft, ShoppingBag, Leaf } from 'lucide-react';

/**
 * Standalone /products/[slug] page — SSR'd content (name, specs, prices)
 * lands in the initial HTML for crawlers; cart stays fully interactive.
 */
export const ProductPageClient: React.FC<{ product: Product }> = ({ product }) => {
  const dispatch = useDispatch();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-primary-500 selection:text-neutral-950">
      {/* Minimal header — logo, back to store, cart */}
      <header className="sticky top-0 z-40 bg-neutral-950/85 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-8 h-8 rounded-lg bg-primary-700 flex items-center justify-center text-primary-100">
              <Leaf className="w-4 h-4" />
            </span>
            <span className="font-black text-neutral-50 group-hover:text-primary-300 transition-colors">
              {siteConfig.siteName}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white px-3 py-2 rounded-xl hover:bg-neutral-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Store</span>
            </Link>
            <button
              onClick={() => dispatch(toggleCartDrawer(true))}
              className="flex items-center gap-1.5 text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Bag</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <nav className="text-[11px] text-neutral-500 mb-5 flex items-center gap-1.5">
          <Link href="/" className="hover:text-primary-400">Home</Link>
          <span>/</span>
          <span className="text-neutral-400">{product.categoryName || 'Products'}</span>
          <span>/</span>
          <span className="text-neutral-300 truncate max-w-[240px]">{product.name}</span>
        </nav>

        <ProductDetailBody product={product} />
      </main>

      <Footer />
      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
};
