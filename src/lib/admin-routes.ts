import { AdminTab } from '../types';

/** AdminTab → route path (used by the sidebar nav and dashboard shortcuts) */
export const ADMIN_ROUTES: Record<AdminTab, string> = {
  [AdminTab.Dashboard]: '/admin',
  [AdminTab.Products]: '/admin/products',
  [AdminTab.Inventory]: '/admin/inventory',
  [AdminTab.Masters]: '/admin/masters',
  [AdminTab.Homes]: '/admin/quotes',
  [AdminTab.Seo]: '/admin/seo',
  [AdminTab.Storage]: '/admin/storage',
  [AdminTab.Orders]: '/admin/orders',
  [AdminTab.ReduxConsole]: '/admin/redux-console'
};

/** Route path → AdminTab (sidebar active-state detection) */
export function tabForPath(pathname: string): AdminTab {
  const entry = (Object.entries(ADMIN_ROUTES) as [AdminTab, string][])
    .sort((a, b) => b[1].length - a[1].length)
    .find(([, route]) => pathname === route || pathname.startsWith(`${route}/`));
  return entry ? entry[0] : AdminTab.Dashboard;
}
