import React from 'react';
import { useAnalyticsQuery } from '../../services/api';
import { useDispatch } from 'react-redux';
import { setActiveTab } from '../../store/adminSlice';
import { DollarSign, Home, Package, HardDrive, Search, ArrowUpRight, ShieldCheck } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const dispatch = useDispatch();
  const { data: analytics, isLoading } = useAnalyticsQuery();

  if (isLoading) {
    return (
      <div className="py-20 text-center text-stone-400 text-sm font-mono animate-pulse">
        Loading Admin Analytics Data...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-50">Shopify Storefront Overview</h1>
          <p className="text-stone-400 text-xs sm:text-sm mt-1">
            Real-time analytics for Bamboo Eco-Homes & Product Marketplace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(setActiveTab('seo'))}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-emerald-400 font-bold text-xs border border-stone-700 flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Manage SEO Metadata</span>
          </button>
          <button
            onClick={() => dispatch(setActiveTab('storage'))}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <HardDrive className="w-4 h-4" />
            <span>Switch Storage Provider</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-stone-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            ${(analytics?.totalRevenue || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-400 block font-medium">↑ +18.4% this month</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-stone-400 text-xs font-bold uppercase tracking-wider">
            <span>Bamboo Home Quotes</span>
            <Home className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-stone-100 font-mono">
            {analytics?.totalHomeQuotes || 0}
          </div>
          <span className="text-[11px] text-stone-400 block">Custom Architecture Leads</span>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-stone-400 text-xs font-bold uppercase tracking-wider">
            <span>Active Products</span>
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-stone-100 font-mono">
            {analytics?.totalProducts || 0}
          </div>
          <span className="text-[11px] text-amber-400 block font-medium">
            {analytics?.lowStockCount || 0} items low in stock
          </span>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-stone-400 text-xs font-bold uppercase tracking-wider">
            <span>File Storage Engine</span>
            <HardDrive className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-300 font-mono uppercase">
            {analytics?.activeProvider || 'Mock'}
          </div>
          <span className="text-[11px] text-stone-400 block">AWS / Cloudinary / MinIO Ready</span>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Home Quotes */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-stone-800 pb-3">
            <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-400" />
              <span>Recent Bamboo Home Blueprint Inquiries</span>
            </h3>
            <button
              onClick={() => dispatch(setActiveTab('homes'))}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {analytics?.recentQuotes?.length === 0 ? (
              <p className="text-xs text-stone-500 py-4">No quote requests yet.</p>
            ) : (
              analytics?.recentQuotes?.map((quote: any) => (
                <div
                  key={quote.id}
                  className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex justify-between items-center text-xs"
                >
                  <div>
                    <span className="font-bold text-stone-100 block">{quote.clientName}</span>
                    <span className="text-stone-400 text-[11px]">
                      {quote.floorAreaSqFt} sq.ft • {quote.bambooSpecies}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">${quote.estimatedPrice?.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-stone-800 pb-3">
            <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Recent Customer Orders</span>
            </h3>
            <button
              onClick={() => dispatch(setActiveTab('orders'))}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {analytics?.recentOrders?.length === 0 ? (
              <p className="text-xs text-stone-500 py-4">No recent customer orders.</p>
            ) : (
              analytics?.recentOrders?.map((order: any) => (
                <div
                  key={order.id}
                  className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex justify-between items-center text-xs"
                >
                  <div>
                    <span className="font-bold text-stone-100 block">{order.customerName} ({order.id})</span>
                    <span className="text-stone-400 text-[11px]">{order.items?.length || 1} items</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">${order.total?.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
