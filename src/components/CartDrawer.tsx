'use client';
import React from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { toggleCartDrawer } from '../store/cartSlice';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartContents } from './CartContents';

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const dispatch = useDispatch();
  const { items, isOpen } = useSelector((state: RootState) => state.cart);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-sm flex justify-end">
      <div className="bg-neutral-900 text-neutral-100 w-full max-w-md h-full flex flex-col shadow-2xl border-l border-neutral-800 animate-slide-left">
        {/* Drawer Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-400" />
            <h2 className="text-base font-bold text-neutral-50">Your Shopping Bag ({items.length})</h2>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <Link
                href="/cart"
                onClick={() => dispatch(toggleCartDrawer(false))}
                className="text-[11px] font-bold text-primary-400 hover:text-primary-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <span>Open Cart Page</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
            <button
              onClick={() => dispatch(toggleCartDrawer(false))}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <CartContents
          layout="drawer"
          onBrowse={() => dispatch(toggleCartDrawer(false))}
          onCheckout={() => {
            dispatch(toggleCartDrawer(false));
            onOpenCheckout();
          }}
        />
      </div>
    </div>
  );
};
