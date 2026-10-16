'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { AdminTab } from '../../types';
import { ADMIN_ROUTES, tabForPath } from '../../lib/admin-routes';
import { siteConfig } from '../../config/site';
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
  const pathname = usePathname();
  const router = useRouter();
  const formLogs = useSelector((state: RootState) => state.formErrors.errorLogs);
  const user = useSelector((state: RootState) => state.auth.user);
  const logoutMutation = useLogoutMutation();

  const activeTab = tabForPath(pathname || '');

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        dispatch(setUser(null));
        router.push('/');
        router.refresh();
      }
    });
  };

  const navIcons: Record<AdminTab, any> = {
    [AdminTab.Dashboard]: LayoutDashboard,
    [AdminTab.Products]: Package,
    [AdminTab.Inventory]: Layers,
    [AdminTab.Masters]: Database,
    [AdminTab.Homes]: Home,
    [AdminTab.Seo]: Search,
    [AdminTab.Storage]: HardDrive,
    [AdminTab.Orders]: ShoppingBag,
    [AdminTab.ReduxConsole]: Code2
  };

  const navItems: { tab: AdminTab; label: string; icon: any; badge?: number }[] =
    siteConfig.adminNav
      .filter((item) => item.tab in navIcons)
      .map((item) => ({
        tab: item.tab as AdminTab,
        label: item.label,
        icon: navIcons[item.tab as AdminTab],
        badge: item.tab === AdminTab.ReduxConsole ? formLogs.length : undefined
      }));

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-neutral-900 border-r border-neutral-800 p-4 flex flex-col justify-between shrink-0">
        <div>
          {/* Admin Header Branding */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent-500 text-neutral-950 font-black flex items-center justify-center text-sm shadow">
                {siteConfig.adminBadgeEmoji}
              </div>
              <div>
                <h1 className="text-base font-black text-neutral-50 leading-tight">{siteConfig.adminTitle}</h1>
                <span className="text-[10px] text-primary-400 font-mono block">{siteConfig.adminPanelName}</span>
              </div>
            </div>

            <Link
              href="/"
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
              title="Return to Customer Storefront"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.tab;
              return (
                <Link
                  key={item.tab}
                  href={ADMIN_ROUTES[item.tab]}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-accent-500 text-neutral-950 shadow-md font-bold'
                      : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
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
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info box */}
        <div className="pt-4 border-t border-neutral-800 text-[11px] text-neutral-400 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-neutral-500">Signed in:</span>
            <span className="text-primary-400 font-mono truncate max-w-[130px]" title={user?.email}>
              {user?.name || 'Admin'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-rose-950/60 text-neutral-300 hover:text-rose-300 border border-neutral-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
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
