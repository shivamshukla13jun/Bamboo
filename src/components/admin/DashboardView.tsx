'use client';
import React from 'react';
import { useAnalyticsQuery } from '../../services/api';
import { useRouter } from 'next/navigation';
import { ADMIN_ROUTES } from '../../lib/admin-routes';
import { formatPrice } from '../../utils/formatters';
import { AdminTab } from '../../types';

import { DollarSign, Home, Package, HardDrive, Search, ArrowUpRight } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const router = useRouter();
  const { data: analytics, isLoading } = useAnalyticsQuery();

  if (isLoading) {
    return (
      <div className="py-20 text-center text-neutral-400 text-sm font-mono animate-pulse">
        Loading Admin Analytics Data...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-50">Shopify Storefront Overview</h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">
            Real-time analytics for Bamboo Eco-Homes & Product Marketplace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(ADMIN_ROUTES[AdminTab.Seo])}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-primary-400 font-bold text-xs border border-neutral-700 flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Manage SEO Metadata</span>
          </button>
          <button
            onClick={() => router.push(ADMIN_ROUTES[AdminTab.Storage])}
            className="px-3.5 py-2 rounded-xl bg-primary-700 hover:bg-primary-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <HardDrive className="w-4 h-4" />
            <span>Manage File Uploads</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Revenue</span>
            <DollarSign className="w-4 h-4 text-primary-400" />
          </div>
          <div className="text-2xl font-black text-accent-400 font-mono">
            {formatPrice(analytics?.totalRevenue || 0)}
          </div>
          <span className="text-[11px] text-primary-400 block font-medium">↑ +18.4% this month</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Bamboo Home Quotes</span>
            <Home className="w-4 h-4 text-primary-400" />
          </div>
          <div className="text-2xl font-black text-neutral-100 font-mono">
            {analytics?.totalHomeQuotes || 0}
          </div>
          <span className="text-[11px] text-neutral-400 block">Custom Architecture Leads</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Active Products</span>
            <Package className="w-4 h-4 text-primary-400" />
          </div>
          <div className="text-2xl font-black text-neutral-100 font-mono">
            {analytics?.totalProducts || 0}
          </div>
          <span className="text-[11px] text-accent-400 block font-medium">
            {analytics?.lowStockCount || 0} items low in stock
          </span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Files Uploaded</span>
            <HardDrive className="w-4 h-4 text-primary-400" />
          </div>
          <div className="text-2xl font-black text-neutral-100 font-mono">
            {analytics?.uploadStats?.totalFiles || 0}
          </div>
          <span className="text-[11px] text-neutral-400 block">
            {((analytics?.uploadStats?.totalSizeBytes || 0) / 1048576).toFixed(1)} MB stored
          </span>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Home Quotes */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
            <h3 className="font-bold text-neutral-100 text-sm flex items-center gap-2">
              <Home className="w-4 h-4 text-primary-400" />
              <span>Recent Bamboo Home Blueprint Inquiries</span>
            </h3>
            <button
              onClick={() => router.push(ADMIN_ROUTES[AdminTab.Homes])}
              className="text-xs text-primary-400 hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {analytics?.recentQuotes?.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4">No quote requests yet.</p>
            ) : (
              analytics?.recentQuotes?.map((quote: any) => (
                <div
                  key={quote.id}
                  className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex justify-between items-center text-xs"
                >
                  <div>
                    <span className="font-bold text-neutral-100 block">{quote.clientName}</span>
                    <span className="text-neutral-400 text-[11px]">
                      {quote.floorAreaSqFt} sq.ft • {quote.speciesName}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-accent-400">{formatPrice(quote.estimatedPrice || 0)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
            <h3 className="font-bold text-neutral-100 text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-primary-400" />
              <span>Recent Customer Orders</span>
            </h3>
            <button
              onClick={() => router.push(ADMIN_ROUTES[AdminTab.Orders])}
              className="text-xs text-primary-400 hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {analytics?.recentOrders?.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4">No recent customer orders.</p>
            ) : (
              analytics?.recentOrders?.map((order: any) => (
                <div
                  key={order.id}
                  className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex justify-between items-center text-xs"
                >
                  <div>
                    <span className="font-bold text-neutral-100 block">{order.customerName} ({order.id})</span>
                    <span className="text-neutral-400 text-[11px]">{order.items?.length || 1} items</span>
                  </div>
                  <span className="font-mono font-bold text-accent-400">{formatPrice(order.total || 0)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
