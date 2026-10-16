'use client';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setActiveTab, toggleAdminMode, AdminTab } from '../../store/adminSlice';
import {
  LayoutDashboard,
  Package,
  Layers,
  Database,
  Home,
  Search,
  HardDrive,
  ShoppingBag,
  Code2,
  ArrowLeft
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const dispatch = useDispatch();
  const activeTab = useSelector((state: RootState) => state.admin.activeTab);
  const formLogs = useSelector((state: RootState) => state.formErrors.errorLogs);

  const navItems: { tab: AdminTab; label: string; icon: any; badge?: number }[] = [
    { tab: 'dashboard', label: 'Overview Analytics', icon: LayoutDashboard },
    { tab: 'products', label: 'Products & Variants', icon: Package },
    { tab: 'inventory', label: 'Dedicated Inventory', icon: Layers },
    { tab: 'masters', label: 'Everything Masters', icon: Database },
    { tab: 'homes', label: 'Bamboo Home Inquiries', icon: Home },
    { tab: 'seo', label: 'SEO & Meta Tags Handle', icon: Search },
    { tab: 'storage', label: 'Cloudinary Storage Switcher', icon: HardDrive },
    { tab: 'orders', label: 'Orders & Deliveries', icon: ShoppingBag },
    { tab: 'redux_console', label: 'Redux + Form Errors', icon: Code2, badge: formLogs.length }
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-stone-900 border-r border-stone-800 p-4 flex flex-col justify-between shrink-0">
        <div>
          {/* Admin Header Branding */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 font-black flex items-center justify-center text-sm shadow">
                ⚡
              </div>
              <div>
                <h1 className="text-base font-black text-stone-50 leading-tight">Shopify Admin</h1>
                <span className="text-[10px] text-emerald-400 font-mono block">Bamboorise Admin Panel</span>
              </div>
            </div>

            <button
              onClick={() => dispatch(toggleAdminMode(false))}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
              title="Return to Customer Storefront"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => dispatch(setActiveTab(item.tab))}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                      : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-rose-600 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info box */}
        <div className="pt-4 border-t border-stone-800 text-[11px] text-stone-400 space-y-1">
          <div className="flex justify-between">
            <span>Server:</span>
            <span className="text-emerald-400 font-mono">Node TS Express</span>
          </div>
          <div className="flex justify-between">
            <span>Database:</span>
            <span className="text-emerald-400 font-mono">MongoDB</span>
          </div>
          <div className="flex justify-between">
            <span>Storage:</span>
            <span className="text-amber-400 font-mono uppercase">Switchable</span>
          </div>
        </div>
      </aside>

      {/* Main Content View Container */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};
