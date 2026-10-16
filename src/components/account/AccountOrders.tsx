'use client';
import React from 'react';
import { useAccountSummaryQuery } from '../../services/api';
import { formatPrice } from '../../utils/formatters';
import { ShoppingBag } from 'lucide-react';
import { OrderStatus } from '../../types';

const STATUS_STYLES: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'text-accent-400 bg-accent-950/60 border-accent-800',
  [OrderStatus.Processing]: 'text-blue-400 bg-blue-950/60 border-blue-800',
  [OrderStatus.Shipped]: 'text-violet-400 bg-violet-950/60 border-violet-800',
  [OrderStatus.Delivered]: 'text-primary-400 bg-primary-950/60 border-primary-800'
};

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const AccountOrders: React.FC = () => {
  const { data, isLoading } = useAccountSummaryQuery();
  const orders = data?.orders || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-neutral-50">My Orders</h1>
        <p className="text-neutral-400 text-xs mt-1">{orders.length} order(s) placed with this account.</p>
      </div>

      {isLoading ? (
        <p className="text-xs text-neutral-500 font-mono">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-10 text-center text-neutral-400 text-xs">
          No orders yet — your purchases will appear here.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <div>
                  <span className="text-xs text-neutral-400 block">Order #{order.id}</span>
                  <span className="text-[11px] text-neutral-500">Placed {fmtDate(order.createdAt)} · {order.paymentMethod?.replace(/_/g, ' ')}</span>
                </div>
                <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border ${STATUS_STYLES[order.status] || 'text-neutral-400 bg-neutral-950 border-neutral-800'}`}>
                  {order.status}
                </span>
              </div>

              <div className="space-y-2">
                {order.items?.map((item, i) => {
                  const img = item.variant?.image || item.product?.images?.[0];
                  const price = item.variant?.price ?? item.product?.price ?? 0;
                  return (
                    <div key={i} className="flex items-center gap-3 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-xs">
                      {img && <img src={img} alt="" className="w-10 h-10 rounded-lg object-cover border border-neutral-800 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-neutral-100 block truncate">{item.product?.name}</span>
                        {item.variant && (
                          <span className="text-primary-400 text-[10px] block">{item.variant.name} · {item.variant.sku}</span>
                        )}
                      </div>
                      <span className="text-neutral-400">×{item.quantity}</span>
                      <span className="font-mono font-bold text-neutral-200">{formatPrice(price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap justify-end gap-4 text-xs border-t border-neutral-800 pt-3">
                <span className="text-neutral-400">Subtotal: <span className="font-mono text-neutral-200">{formatPrice(order.subtotal)}</span></span>
                {order.discount > 0 && <span className="text-neutral-400">Discount: <span className="font-mono text-primary-400">−{formatPrice(order.discount)}</span></span>}
                {order.shipping > 0 && <span className="text-neutral-400">Shipping: <span className="font-mono text-neutral-200">{formatPrice(order.shipping)}</span></span>}
                <span className="font-bold text-neutral-100">Total: <span className="font-mono text-accent-400">{formatPrice(order.total)}</span></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
