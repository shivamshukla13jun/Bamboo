'use client';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setActiveTab, toggleAdminMode, AdminTab } from '../../store/adminSlice';
import { setUser } from '../../store/authSlice';
import { useLogoutMutation } from '../../services/api';
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
  ArrowLeft,
  LogOut
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const dispatch = useDispatch();
  const activeTab = useSelector((state: RootState) => state.admin.activeTab);
  const formLogs = useSelector((state: RootState) => state.formErrors.errorLogs);
  const user = useSelector((state: RootState) => state.auth.user);
  const logoutMutation = useLogoutMutation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        dispatch(setUser(null));
        dispatch(toggleAdminMode(false));
      }
    });
  };

  const navItems: { tab: AdminTab; label: string; icon: any; badge?: number }[] = [
    { tab: 'dashboard', label: 'Overview Analytics', icon: LayoutDashboard },
    { tab: 'products', label: 'Products & Variants', icon: Package },
    { tab: 'inventory', label: 'Dedicated Inventory', icon: Layers },
    { tab: 'masters', label: 'Everything Masters', icon: Database },
    { tab: 'homes', label: 'Bamboo Home Inquiries', icon: Home },
    { tab: 'seo', label: 'SEO & Meta Tags Handle', icon: Search },
    { tab: 'storage', label: 'File Uploads', icon: HardDrive },
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
        <div className="pt-4 border-t border-stone-800 text-[11px] text-stone-400 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-stone-500">Signed in:</span>
            <span className="text-emerald-400 font-mono truncate max-w-[130px]" title={user?.email}>
              {user?.name || 'Admin'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-stone-800 hover:bg-rose-950/60 text-stone-300 hover:text-rose-300 border border-stone-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content View Container */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};
