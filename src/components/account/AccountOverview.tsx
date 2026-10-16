'use client';
import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useAccountSummaryQuery } from '../../services/api';
import { formatPrice } from '../../utils/formatters';
import { ShoppingBag, Home, Wallet, ArrowUpRight, Package } from 'lucide-react';

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const AccountOverview: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data, isLoading } = useAccountSummaryQuery();

  const orders = data?.orders || [];
  const quotes = data?.quotes || [];
  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const recent = [
    ...orders.map((o) => ({ kind: 'Order' as const, id: o.id, at: o.createdAt, label: `${o.items?.length || 0} item(s)`, value: o.total })),
    ...quotes.map((q) => ({ kind: 'Quote' as const, id: q.id || '', at: q.createdAt || '', label: `${q.floorAreaSqFt} sq.ft ${q.homeTypeName || ''}`, value: q.estimatedPrice }))
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-50">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-neutral-400 text-xs mt-1">
          Your orders, quote projects, and account settings in one place.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/account/orders" className="bg-neutral-900 border border-neutral-800 hover:border-primary-700/60 p-5 rounded-2xl space-y-2 transition-colors block">
          <div className="flex justify-between items-center text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Orders</span>
            <ShoppingBag className="w-4 h-4 text-primary-400" />
          </div>
          <div className="text-2xl font-black text-neutral-100 font-mono">{orders.length}</div>
          <span className="text-[11px] text-primary-400 block font-medium">View order history →</span>
        </Link>
        <Link href="/account/quotes" className="bg-neutral-900 border border-neutral-800 hover:border-primary-700/60 p-5 rounded-2xl space-y-2 transition-colors block">
          <div className="flex justify-between items-center text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Quote Projects</span>
            <Home className="w-4 h-4 text-primary-400" />
          </div>
          <div className="text-2xl font-black text-neutral-100 font-mono">{quotes.length}</div>
          <span className="text-[11px] text-primary-400 block font-medium">Track status →</span>
        </Link>
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Spent</span>
            <Wallet className="w-4 h-4 text-accent-400" />
          </div>
          <div className="text-2xl font-black text-accent-400 font-mono">{formatPrice(totalSpent)}</div>
          <span className="text-[11px] text-neutral-400 block">Lifetime order value</span>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-neutral-100 text-sm flex items-center gap-2 border-b border-neutral-800 pb-3">
          <Package className="w-4 h-4 text-primary-400" />
          <span>Recent Activity</span>
        </h3>
        {isLoading ? (
          <p className="text-xs text-neutral-500 font-mono py-4">Loading activity...</p>
        ) : recent.length === 0 ? (
          <p className="text-xs text-neutral-500 py-4">
            Nothing yet — browse the store or configure a custom build to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {recent.map((r) => (
              <div key={`${r.kind}-${r.id}`} className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex justify-between items-center text-xs">
                <div>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${r.kind === 'Order' ? 'text-primary-400 bg-primary-950' : 'text-accent-400 bg-accent-950'}`}>
                    {r.kind}
                  </span>
                  <span className="font-bold text-neutral-100 block mt-1">{r.id}</span>
                  <span className="text-neutral-400 text-[11px]">{r.label} · {fmtDate(r.at)}</span>
                </div>
                <span className="font-mono font-bold text-accent-400">{formatPrice(r.value || 0)}</span>
              </div>
            ))}
            <Link href="/account/orders" className="text-xs text-primary-400 hover:underline flex items-center gap-0.5 pt-1">
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
