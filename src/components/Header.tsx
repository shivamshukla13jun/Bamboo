'use client';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { toggleCartDrawer, setCurrency } from '../store/cartSlice';
import { toggleAdminMode, setActiveTab } from '../store/adminSlice';
import { setSearchTerm, setCategory } from '../store/filterSlice';
import { ShoppingBag, Search, ShieldCheck, Home, Layers, ArrowRight, User, LogOut } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { CategoryMaster } from '../types';
import { openAuthModal, setUser } from '../store/authSlice';
import { useLogoutMutation } from '../services/api';
import { siteConfig, currencyCodes } from '../config/site';

export const Header: React.FC = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const currency = useSelector((state: RootState) => state.cart.currency);
  const isAdminMode = useSelector((state: RootState) => state.cart ? state.admin.isAdminMode : false);
  const currentCategory = useSelector((state: RootState) => state.filter.category);
  const searchTerm = useSelector((state: RootState) => state.filter.searchTerm);
  const formLogs = useSelector((state: RootState) => state.formErrors.errorLogs);
  const user = useSelector((state: RootState) => state.auth.user);
  const logoutMutation = useLogoutMutation();

  const [localSearch, setLocalSearch] = useState(searchTerm);

  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setSearchTerm(localSearch));
  };

  // Category pills are driven by the Categories Master (no hardcoded options)
  const { data: masters } = useQuery({
    queryKey: ['masters'],
    queryFn: async () => {
      const res = await fetch('/api/masters');
      if (!res.ok) throw new Error('Failed to fetch masters');
      return res.json();
    }
  });

  const masterCategories: CategoryMaster[] = masters?.categories || [];
  const categories: { key: string; label: string; icon?: string }[] = [
    { key: 'all', label: 'All Products' },
    ...masterCategories.map((c) => ({ key: c.slug || c.id, label: c.name, icon: c.icon }))
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 shadow-md">
      {/* Top Announcement Bar */}
      <div className="bg-emerald-800 text-emerald-100 text-xs py-1.5 px-4 flex flex-wrap justify-between items-center border-b border-emerald-700/50">
        <div className="flex items-center gap-2 font-medium mx-auto sm:mx-0">
          <span className="bg-emerald-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">{siteConfig.topbar.promoBadge}</span>
          <span>{siteConfig.topbar.promoText}</span>
        </div>

        <div className="flex items-center gap-4 text-xs mx-auto sm:mx-0 mt-1 sm:mt-0">
          <span className="text-stone-300 hidden md:inline">{siteConfig.topbar.rightText}</span>

          {/* Currency Picker */}
          <div className="flex items-center gap-1 bg-stone-800 px-2 py-0.5 rounded border border-stone-700">
            <span className="text-stone-400 text-[10px]">Currency:</span>
            <select
              value={currency}
              onChange={(e) => dispatch(setCurrency(e.target.value as any))}
              className="bg-transparent text-stone-100 font-bold focus:outline-none cursor-pointer text-xs"
            >
              {currencyCodes.map((code) => (
                <option key={code} value={code} className="bg-stone-900">
                  {siteConfig.commerce.currencies[code].label}
                </option>
              ))}
            </select>
          </div>

          {/* Admin Switcher Button */}
          <button
            onClick={() => dispatch(toggleAdminMode())}
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              isAdminMode
                ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 ring-2 ring-amber-300'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {isAdminMode ? 'Back to Storefront' : `${siteConfig.adminTitle} Panel`}
          </button>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              dispatch(toggleAdminMode(false));
              dispatch(setCategory('all'));
            }}
            className="flex items-center gap-2 group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-emerald-200 font-extrabold text-xl shadow-lg group-hover:bg-emerald-600 transition-colors">
              {siteConfig.logoEmoji}
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-stone-50 group-hover:text-emerald-400 transition-colors">
                {siteConfig.siteName}
              </span>
              <span className="text-[10px] block text-emerald-400 font-medium tracking-wide uppercase">
                {siteConfig.tagline}
              </span>
            </div>
          </button>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md min-w-[240px]">
          <div className="relative">
            <input
              type="text"
              placeholder={siteConfig.searchPlaceholder}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-stone-800 text-stone-100 placeholder-stone-400 text-sm pl-10 pr-24 py-2 rounded-lg border border-stone-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-md transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Quick link to Home Customizer */}
          <a
            href="#bamboo-home-builder"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold border border-emerald-700/60 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{siteConfig.customizerLinkText}</span>
            <ArrowRight className="w-3 h-3" />
          </a>

          {/* Redux Form Error Indicator */}
          {formLogs.length > 0 && (
            <button
              onClick={() => {
                dispatch(toggleAdminMode(true));
                dispatch(setActiveTab('redux_console'));
              }}
              className="bg-rose-900/60 hover:bg-rose-900 text-rose-300 border border-rose-700/60 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-mono"
              title="Click to view Redux Form Error Logs"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>Redux Errors ({formLogs.length})</span>
            </button>
          )}

          {/* Account / Auth Controls */}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-xs font-semibold text-stone-200">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="max-w-[110px] truncate">{user.name}</span>
              </span>
              <button
                onClick={() =>
                  logoutMutation.mutate(undefined, { onSuccess: () => dispatch(setUser(null)) })
                }
                className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-rose-400 border border-stone-700 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => dispatch(openAuthModal(true))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold transition-colors"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Sign In / Register</span>
              <span className="sm:hidden">Account</span>
            </button>
          )}

          {/* Cart Drawer Trigger */}
          <button
            onClick={() => dispatch(toggleCartDrawer(true))}
            className="relative p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 transition-colors flex items-center gap-2"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold hidden sm:inline">Bag</span>
            {totalItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-stone-950 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow">
                {totalItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category Pills Navigation */}
      {!isAdminMode && (
        <div className="bg-stone-950 border-t border-stone-800 py-2 px-4 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs">
            {categories.map((cat) => {
              const isActive = currentCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => dispatch(setCategory(cat.key))}
                  className={`px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/40'
                      : 'bg-stone-900 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
                  }`}
                >
                  {cat.icon ? (
                    <span className="text-sm leading-none">{cat.icon}</span>
                  ) : (
                    <Layers className="w-3.5 h-3.5" />
                  )}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
