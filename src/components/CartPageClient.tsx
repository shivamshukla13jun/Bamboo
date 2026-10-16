'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { CartContents } from './CartContents';
import { CheckoutModal } from './CheckoutModal';
import { Footer } from './Footer';
import { siteConfig } from '../config/site';
import { ArrowLeft, Leaf, ShoppingBag, CheckCircle2 } from 'lucide-react';

/** Standalone /cart page — two-column cart + checkout modal + success state. */
export const CartPageClient: React.FC = () => {
  const items = useSelector((state: RootState) => state.cart.items);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
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
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white px-3 py-2 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Continue Shopping</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {placedOrderId ? (
          <div className="max-w-md mx-auto text-center space-y-4 py-16">
            <div className="w-16 h-16 rounded-full bg-primary-950 border border-primary-700 text-primary-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-neutral-50">Order Placed!</h1>
            <p className="text-xs text-neutral-400">
              Order <span className="font-mono text-primary-400">{placedOrderId}</span> is confirmed.
            </p>
            <div className="flex gap-2 justify-center">
              <Link
                href="/account/orders"
                className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs"
              >
                Track in My Orders
              </Link>
              <Link
                href="/"
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-6">
              <ShoppingBag className="w-5 h-5 text-primary-400" />
              <h1 className="text-2xl font-black text-neutral-50">
                Your Shopping Bag
                {items.length > 0 && (
                  <span className="text-sm font-mono text-neutral-400 ml-2">({items.length} items)</span>
                )}
              </h1>
            </div>
            <CartContents layout="page" onCheckout={() => setIsCheckoutOpen(true)} />
          </>
        )}
      </main>

      <Footer />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(orderId) => setPlacedOrderId(orderId)}
      />
    </div>
  );
};
