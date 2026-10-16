'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setUser } from '../../store/authSlice';
import { useLogoutMutation } from '../../services/api';
import { siteConfig } from '../../config/site';
import { LayoutGrid, ShoppingBag, Home, UserCog, ArrowLeft, LogOut, Leaf } from 'lucide-react';

interface AccountShellProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: '/account', label: 'Overview', icon: LayoutGrid, exact: true },
  { href: '/account/orders', label: 'My Orders', icon: ShoppingBag },
  { href: '/account/quotes', label: 'My Quotes', icon: Home },
  { href: '/account/profile', label: 'Profile & Security', icon: UserCog }
];

/** Sidebar shell for the customer account area (/account/*). */
export const AccountShell: React.FC<AccountShellProps> = ({ children }) => {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const logoutMutation = useLogoutMutation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        dispatch(setUser(null));
        router.push('/');
        router.refresh();
      }
    });
  };

  const isActive = (item: (typeof NAV_ITEMS)[number]) =>
    item.exact ? pathname === item.href : pathname?.startsWith(item.href);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-neutral-900 border-r border-neutral-800 p-4 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-700 flex items-center justify-center text-primary-100">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base font-black text-neutral-50 leading-tight">My Account</h1>
                <span className="text-[10px] text-primary-400 font-mono block">{siteConfig.siteName}</span>
              </div>
            </div>
            <Link
              href="/"
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
              title="Back to Store"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-primary-600 text-white shadow-md font-bold'
                      : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-neutral-800 text-[11px] text-neutral-400 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-neutral-500">Signed in:</span>
            <span className="text-primary-400 font-mono truncate max-w-[130px]" title={user?.email}>
              {user?.name || 'Customer'}
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

      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-5xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};
