'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { clearCart } from '../store/cartSlice';
import { useFormReduxSync } from '../hooks/useFormReduxSync';
import { useCreateOrderMutation } from '../services/api';
import { formatPrice } from '../utils/formatters';
import { X, CreditCard, ShieldCheck, CheckCircle2, Truck, ArrowRight, ShieldAlert } from 'lucide-react';

interface CheckoutInputs {
  customerName: string;
  customerEmail: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: 'credit_card' | 'stripe_mock' | 'crypto' | 'bamboo_installments';
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const dispatch = useDispatch();
  const createOrderMutation = useCreateOrderMutation();

  const { items, discountAmount, couponCode, currency, currencyRates } = useSelector(
    (state: RootState) => state.cart
  );

  const { register, handleSubmit, formState } = useForm<CheckoutInputs>({
    mode: 'onChange',
    defaultValues: {
      customerName: '',
      customerEmail: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'United States',
      paymentMethod: 'credit_card'
    }
  });

  // Sync React Hook Form errors with Redux store
  useFormReduxSync('checkout-form', formState);

  const rawSubtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountVal = discountAmount > 0 ? (discountAmount < 100 ? (rawSubtotal * discountAmount) / 100 : discountAmount) : 0;
  const shippingVal = rawSubtotal > 200 || rawSubtotal === 0 ? 0 : 45;
  const grandTotal = Math.max(0, rawSubtotal - discountVal + shippingVal);

  const onSubmit = (data: CheckoutInputs) => {
    const orderPayload = {
      ...data,
      items,
      subtotal: rawSubtotal,
      shipping: shippingVal,
      discount: discountVal,
      total: grandTotal
    };

    createOrderMutation.mutate(orderPayload, {
      onSuccess: (createdOrder) => {
        dispatch(clearCart());
        onClose();
        onOrderSuccess(createdOrder.id);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-2xl w-full text-stone-100 shadow-2xl relative p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl font-bold text-stone-50">Shopify Secure Checkout</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Shipping Address */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
              1. Customer Shipping Details
            </h3>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone-300 mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register('customerName', { required: 'Name is required' })}
                  className={`w-full bg-stone-950 text-stone-100 border rounded-xl px-3 py-2 text-xs focus:outline-none ${
                    formState.errors.customerName ? 'border-rose-500' : 'border-stone-700'
                  }`}
                />
                {formState.errors.customerName && (
                  <span className="text-[11px] text-rose-400 block mt-0.5 font-medium">
                    {formState.errors.customerName.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  {...register('customerEmail', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email'
                    }
                  })}
                  className={`w-full bg-stone-950 text-stone-100 border rounded-xl px-3 py-2 text-xs focus:outline-none ${
                    formState.errors.customerEmail ? 'border-rose-500' : 'border-stone-700'
                  }`}
                />
                {formState.errors.customerEmail && (
                  <span className="text-[11px] text-rose-400 block mt-0.5 font-medium">
                    {formState.errors.customerEmail.message}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1">
                Street Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="123 Bamboo Forest Way"
                {...register('address', { required: 'Address is required' })}
                className={`w-full bg-stone-950 text-stone-100 border rounded-xl px-3 py-2 text-xs focus:outline-none ${
                  formState.errors.address ? 'border-rose-500' : 'border-stone-700'
                }`}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-stone-300 mb-1">City</label>
                <input
                  type="text"
                  placeholder="Seattle"
                  {...register('city', { required: 'City is required' })}
                  className="w-full bg-stone-950 text-stone-100 border border-stone-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-300 mb-1">Postal Code</label>
                <input
                  type="text"
                  placeholder="98101"
                  {...register('postalCode', { required: 'Postal Code required' })}
                  className="w-full bg-stone-950 text-stone-100 border border-stone-700 rounded-xl px-3 py-2 text-xs focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-300 mb-1">Country</label>
                <input
                  type="text"
                  {...register('country')}
                  className="w-full bg-stone-950 text-stone-100 border border-stone-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
              2. Payment Method
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3 bg-stone-950 rounded-xl border border-stone-800 cursor-pointer hover:border-emerald-600">
                <input
                  type="radio"
                  value="credit_card"
                  {...register('paymentMethod')}
                  className="accent-emerald-500"
                />
                <span className="text-xs text-stone-200 font-medium">Credit Card / Debit Card</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-stone-950 rounded-xl border border-stone-800 cursor-pointer hover:border-emerald-600">
                <input
                  type="radio"
                  value="bamboo_installments"
                  {...register('paymentMethod')}
                  className="accent-emerald-500"
                />
                <span className="text-xs text-stone-200 font-medium">Bamboo Home Installments (0% APY)</span>
              </label>
            </div>
          </div>

          {/* Validation Errors Alert */}
          {!formState.isValid && formState.isSubmitted && (
            <div className="bg-rose-950/60 border border-rose-800 text-rose-200 p-3 rounded-xl text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Please fill required shipping fields. Error logged to Redux.</span>
            </div>
          )}

          {/* Summary Footer */}
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 flex justify-between items-center">
            <div>
              <span className="text-xs text-stone-400 block">Total Payable</span>
              <span className="text-2xl font-black text-amber-400 font-mono">
                {formatPrice(grandTotal, currency, currencyRates)}
              </span>
            </div>

            <button
              type="submit"
              disabled={createOrderMutation.isPending}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow"
            >
              <span>{createOrderMutation.isPending ? 'Processing...' : 'Place Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
