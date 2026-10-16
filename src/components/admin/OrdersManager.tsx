'use client';
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Order } from '../../types';
import { ShoppingBag, Package, Truck, CheckCircle2, Clock, DollarSign } from 'lucide-react';

export const OrdersManager: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Order['status'] }) => {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-50">Orders & Fulfillment</h1>
          <p className="text-stone-400 text-xs mt-0.5">
            Manage customer purchases, payment methods, and delivery logistics.
          </p>
        </div>

        <div className="bg-stone-900 border border-stone-800 px-4 py-2 rounded-xl text-xs font-mono text-emerald-400 font-bold">
          Total Orders: {orders.length}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-stone-500 font-mono">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 bg-stone-900 rounded-2xl border border-stone-800 text-center text-stone-400 text-xs">
            No customer orders placed yet.
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold text-sm">
                    📦
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-stone-100">{order.customerName}</h3>
                      <span className="text-[10px] font-mono bg-stone-950 px-2 py-0.5 rounded text-amber-400 font-bold">
                        {order.id}
                      </span>
                    </div>
                    <span className="text-xs text-stone-400">{order.customerEmail} • {order.address}, {order.city}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block uppercase font-bold">Total Amount</span>
                    <span className="text-lg font-black text-amber-400 font-mono">
                      ${order.total.toLocaleString()}
                    </span>
                  </div>

                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateStatusMutation.mutate({
                        id: order.id,
                        status: e.target.value as any
                      })
                    }
                    className="bg-stone-950 text-stone-100 border border-stone-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none cursor-pointer font-bold capitalize"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Purchased Bamboo Products</span>
                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="bg-stone-950 p-2.5 rounded-xl border border-stone-800 flex items-center justify-between">
                      <span className="text-stone-200 font-medium truncate">{item.product?.name || 'Bamboo Item'}</span>
                      <span className="font-mono text-amber-300 font-bold ml-2">
                        x{item.quantity} (${(item.product?.price || 0) * item.quantity})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
