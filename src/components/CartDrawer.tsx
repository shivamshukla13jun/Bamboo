'use client';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import {
  toggleCartDrawer,
  updateQuantity,
  removeFromCart,
  applyCoupon,
  clearCart
} from '../store/cartSlice';
import { formatPrice, computeDiscount, computeShipping } from '../utils/formatters';
import { siteConfig } from '../config/site';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Truck, Check } from 'lucide-react';

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const dispatch = useDispatch();
  const { items, isOpen, couponCode, discountAmount, discountType, currency, currencyRates } = useSelector(
    (state: RootState) => state.cart
  );

  const [inputCoupon, setInputCoupon] = useState(couponCode);

  if (!isOpen) return null;

  const rawSubtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountVal = computeDiscount(rawSubtotal, discountAmount, discountType);
  const shippingVal = computeShipping(rawSubtotal);
  const grandTotal = Math.max(0, rawSubtotal - discountVal + shippingVal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(applyCoupon(inputCoupon));
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex justify-end">
      <div className="bg-stone-900 text-stone-100 w-full max-w-md h-full flex flex-col shadow-2xl border-l border-stone-800 animate-slide-left">
        {/* Drawer Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-stone-50">Your Shopping Bag ({items.length})</h2>
          </div>
          <button
            onClick={() => dispatch(toggleCartDrawer(false))}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="bg-emerald-950/70 px-4 py-2 border-b border-emerald-900/60 text-xs text-emerald-300 flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
          {rawSubtotal >= 200 ? (
            <span className="font-semibold text-emerald-300">🎉 Congratulations! You unlocked Free Freight Shipping</span>
          ) : (
            <span>
              Add <strong className="font-mono text-amber-300">{formatPrice(200 - rawSubtotal, currency, currencyRates)}</strong> more for Free Delivery
            </span>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-14 h-14 rounded-full bg-stone-800 text-stone-500 flex items-center justify-center mx-auto text-2xl">
                🛍️
              </div>
              <p className="text-stone-400 text-sm font-medium">Your shopping bag is empty.</p>
              <button
                onClick={() => dispatch(toggleCartDrawer(false))}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Browse Bamboo Products
              </button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={idx}
                className="bg-stone-950 p-3 rounded-2xl border border-stone-800 flex gap-3 items-center group"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-xl bg-stone-900 border border-stone-800 shrink-0"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-xs font-bold text-stone-100 truncate">{item.product.name}</h4>
                  <span className="text-xs font-mono font-bold text-amber-400 block">
                    {formatPrice(item.product.price, currency, currencyRates)}
                  </span>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center bg-stone-900 border border-stone-800 rounded-lg">
                      <button
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              productId: item.product.id,
                              quantity: item.quantity - 1
                            })
                          )
                        }
                        className="px-2 py-0.5 text-stone-400 hover:text-white"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-mono font-bold">{item.quantity}</span>
                      <button
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              productId: item.product.id,
                              quantity: item.quantity + 1
                            })
                          )
                        }
                        className="px-2 py-0.5 text-stone-400 hover:text-white"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => dispatch(removeFromCart({ productId: item.product.id }))}
                      className="text-stone-500 hover:text-rose-400 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary & Coupon */}
        {items.length > 0 && (
          <div className="p-4 bg-stone-950 border-t border-stone-800 space-y-3">
            {/* Coupon Code Form */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={`Coupon code (e.g. ${siteConfig.commerce.couponHint})`}
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value)}
                  className="w-full bg-stone-900 text-stone-100 placeholder-stone-500 text-xs pl-8 pr-2 py-2 rounded-xl border border-stone-800 focus:outline-none focus:border-emerald-500 font-mono uppercase"
                />
                <Tag className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-2.5" />
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-emerald-400 font-bold text-xs rounded-xl border border-stone-700 transition-colors"
              >
                Apply
              </button>
            </form>

            {/* Calculations */}
            <div className="space-y-1.5 text-xs text-stone-300 pt-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono">{formatPrice(rawSubtotal, currency, currencyRates)}</span>
              </div>
              {discountVal > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
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

              <div className="flex justify-between text-sm font-black text-stone-50 pt-2 border-t border-stone-800">
                <span>Total Amount</span>
                <span className="font-mono text-amber-400">{formatPrice(grandTotal, currency, currencyRates)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => {
                dispatch(toggleCartDrawer(false));
                onOpenCheckout();
              }}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
