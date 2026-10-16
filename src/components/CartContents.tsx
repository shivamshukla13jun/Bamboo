'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { updateQuantity, removeFromCart, applyCoupon } from '../store/cartSlice';
import { formatPrice, computeDiscount, computeShipping } from '../utils/formatters';
import { siteConfig } from '../config/site';
import { Trash2, ShoppingBag, ArrowRight, Tag, Truck } from 'lucide-react';

interface CartContentsProps {
  /** Called when the user proceeds to checkout */
  onCheckout: () => void;
  /**
   * 'drawer'  — single column inside the slide-over (default)
   * 'page'    — two-column layout for the /cart route
   */
  layout?: 'drawer' | 'page';
  /** Optional custom empty-state action; defaults to a store link */
  onBrowse?: () => void;
}

/** Shared cart body — item list, coupon, totals, checkout CTA. */
export const CartContents: React.FC<CartContentsProps> = ({
  onCheckout,
  layout = 'drawer',
  onBrowse
}) => {
  const dispatch = useDispatch();
  const { items, couponCode, discountAmount, discountType, currency, currencyRates } = useSelector(
    (state: RootState) => state.cart
  );

  const [inputCoupon, setInputCoupon] = useState(couponCode);

  const rawSubtotal = items.reduce(
    (sum, item) => sum + (item.variant?.price ?? item.product.price) * item.quantity,
    0
  );
  const discountVal = computeDiscount(rawSubtotal, discountAmount, discountType);
  const shippingVal = computeShipping(rawSubtotal);
  const grandTotal = Math.max(0, rawSubtotal - discountVal + shippingVal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(applyCoupon(inputCoupon));
  };

  const emptyState = (
    <div className="text-center py-16 space-y-3">
      <div className="w-14 h-14 rounded-full bg-neutral-800 text-neutral-500 flex items-center justify-center mx-auto">
        <ShoppingBag className="w-6 h-6" />
      </div>
      <p className="text-neutral-400 text-sm font-medium">Your shopping bag is empty.</p>
      {onBrowse ? (
        <button
          onClick={onBrowse}
          className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs"
        >
          Browse Products
        </button>
      ) : (
        <Link
          href="/"
          className="inline-block px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs"
        >
          Browse Products
        </Link>
      )}
    </div>
  );

  const itemList = (
    <div className={`${layout === 'drawer' ? 'flex-1 overflow-y-auto p-4' : ''} space-y-4`}>
      {items.map((item, idx) => {
        const variant =
          item.variant || item.product.variants?.find((v) => v.id === item.selectedOption);
        const linePrice = variant?.price ?? item.product.price;
        const lineImage = variant?.image || item.product.images[0];
        return (
          <div
            key={idx}
            className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 flex gap-3 items-center group"
          >
            <img
              src={lineImage}
              alt={item.product.name}
              className="w-16 h-16 object-cover rounded-xl bg-neutral-900 border border-neutral-800 shrink-0"
            />

            <div className="flex-1 min-w-0 space-y-1">
              <h4 className="text-xs font-bold text-neutral-100 truncate">{item.product.name}</h4>
              {variant && (
                <span className="text-[10px] text-primary-400 font-semibold block truncate">
                  {variant.name} · {variant.sku}
                </span>
              )}
              <span className="text-xs font-mono font-bold text-accent-400 block">
                {formatPrice(linePrice, currency, currencyRates)}
              </span>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg">
                  <button
                    onClick={() =>
                      dispatch(
                        updateQuantity({
                          productId: item.product.id,
                          quantity: item.quantity - 1,
                          selectedOption: item.selectedOption
                        })
                      )
                    }
                    className="px-2 py-0.5 text-neutral-400 hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-2 text-xs font-mono font-bold">{item.quantity}</span>
                  <button
                    onClick={() =>
                      dispatch(
                        updateQuantity({
                          productId: item.product.id,
                          quantity: item.quantity + 1,
                          selectedOption: item.selectedOption
                        })
                      )
                    }
                    className="px-2 py-0.5 text-neutral-400 hover:text-white"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() =>
                    dispatch(
                      removeFromCart({
                        productId: item.product.id,
                        selectedOption: item.selectedOption
                      })
                    )
                  }
                  className="text-neutral-500 hover:text-rose-400 p-1"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-neutral-200 shrink-0">
              {formatPrice(linePrice * item.quantity, currency, currencyRates)}
            </span>
          </div>
        );
      })}
    </div>
  );

  const summary = (
    <div className={`p-4 bg-neutral-950 border-neutral-800 space-y-3 ${
      layout === 'drawer' ? 'border-t' : 'border rounded-2xl h-fit'
    }`}>
      {/* Coupon Code Form */}
      <form onSubmit={handleApplyCoupon} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={`Coupon code (e.g. ${siteConfig.commerce.couponHint})`}
            value={inputCoupon}
            onChange={(e) => setInputCoupon(e.target.value)}
            className="w-full bg-neutral-900 text-neutral-100 placeholder-neutral-500 text-xs pl-8 pr-2 py-2 rounded-xl border border-neutral-800 focus:outline-none focus:border-primary-500 font-mono uppercase"
          />
          <Tag className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
        </div>
        <button
          type="submit"
          className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-primary-400 font-bold text-xs rounded-xl border border-neutral-700 transition-colors"
        >
          Apply
        </button>
      </form>

      {/* Calculations */}
      <div className="space-y-1.5 text-xs text-neutral-300 pt-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-mono">{formatPrice(rawSubtotal, currency, currencyRates)}</span>
        </div>
        {discountVal > 0 && (
          <div className="flex justify-between text-primary-400 font-semibold">
            <span>Discount ({couponCode})</span>
            <span className="font-mono">-{formatPrice(discountVal, currency, currencyRates)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Freight Shipping</span>
          <span className="font-mono">
            {shippingVal === 0 ? 'FREE' : formatPrice(shippingVal, currency, currencyRates)}
          </span>
        </div>

        <div className="flex justify-between text-sm font-black text-neutral-50 pt-2 border-t border-neutral-800">
          <span>Total Amount</span>
          <span className="font-mono text-accent-400">{formatPrice(grandTotal, currency, currencyRates)}</span>
        </div>
      </div>

      {/* Checkout CTA */}
      <button
        onClick={onCheckout}
        className="w-full py-3.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
      >
        <span>Proceed to Checkout</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );

  if (items.length === 0) {
    return layout === 'drawer' ? (
      <div className="flex-1 overflow-y-auto p-4">{emptyState}</div>
    ) : (
      emptyState
    );
  }

  if (layout === 'page') {
    return (
      <div className="grid md:grid-cols-[1fr_320px] gap-6 items-start">
        {itemList}
        {summary}
      </div>
    );
  }

  return (
    <>
      {/* Free Shipping Meter */}
      <div className="bg-primary-950/70 px-4 py-2 border-b border-primary-900/60 text-xs text-primary-300 flex items-center gap-2">
        <Truck className="w-4 h-4 text-primary-400 shrink-0" />
        {rawSubtotal >= siteConfig.commerce.freeShippingThreshold ? (
          <span className="font-semibold text-primary-300">🎉 You unlocked Free Shipping</span>
        ) : (
          <span>
            Add{' '}
            <strong className="font-mono text-accent-300">
              {formatPrice(siteConfig.commerce.freeShippingThreshold - rawSubtotal, currency, currencyRates)}
            </strong>{' '}
            more for Free Delivery
          </span>
        )}
      </div>
      {itemList}
      {summary}
    </>
  );
};
