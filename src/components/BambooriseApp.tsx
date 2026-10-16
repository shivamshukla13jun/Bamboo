'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useProductsQuery, useSeoQuery, useMeQuery } from '../services/api';
import { setSeoConfig } from '../store/seoSlice';
import { setNotification } from '../store/adminSlice';
import { setUser } from '../store/authSlice';
import { Header } from './Header';
import { HeroBanner } from './HeroBanner';
import { PriceRangeSelector } from './PriceRangeSelector';
import { BambooHomeCustomizer } from './BambooHomeCustomizer';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import { CartDrawer } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import { Footer } from './Footer';
import { Product } from '../types';

// Admin Components
import { AdminLayout } from './admin/AdminLayout';
import { DashboardView } from './admin/DashboardView';
import { ProductsManager } from './admin/ProductsManager';
import { InventoryManager } from './admin/InventoryManager';
import { MastersManager } from './admin/MastersManager';
import { BambooHomesManager } from './admin/BambooHomesManager';
import { SeoManager } from './admin/SeoManager';
import { StorageManager } from './admin/StorageManager';
import { OrdersManager } from './admin/OrdersManager';
import { ReduxFormConsole } from './admin/ReduxFormConsole';
import { AdminLogin } from './auth/AdminLogin';
import { AuthModal } from './auth/AuthModal';
import { CheckCircle2, Info, X } from 'lucide-react';

export const BambooriseApp: React.FC = () => {
  const dispatch = useDispatch();
  const isAdminMode = useSelector((state: RootState) => state.admin.isAdminMode);
  const activeTab = useSelector((state: RootState) => state.admin.activeTab);
  const notification = useSelector((state: RootState) => state.admin.notification);

  const { category, searchTerm, minPrice, maxPrice, sortBy } = useSelector(
    (state: RootState) => state.filter
  );

  const user = useSelector((state: RootState) => state.auth.user);

  const { data: serverSeo } = useSeoQuery();
  useEffect(() => {
    if (serverSeo) {
      dispatch(setSeoConfig(serverSeo));
    }
  }, [serverSeo, dispatch]);

  // Hydrate session from the httpOnly cookie on first load
  const { data: me } = useMeQuery();
  useEffect(() => {
    if (me !== undefined) {
      dispatch(setUser(me));
    }
  }, [me, dispatch]);

  const { data: products = [], isLoading } = useProductsQuery({
    category,
    search: searchTerm,
    minPrice,
    maxPrice,
    sort: sortBy
  });

  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-stone-950">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-stone-900 border border-stone-700 p-4 rounded-2xl shadow-2xl max-w-sm flex items-start gap-3 animate-bounce">
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs">
            <span className="font-bold text-stone-100 block">Notification</span>
            <p className="text-stone-300 mt-0.5">{notification.message}</p>
          </div>
          <button
            onClick={() => dispatch(setNotification(null))}
            className="text-stone-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isAdminMode && user?.role !== 'admin' ? (
        /* Admin Login Gate */
        <AdminLogin />
      ) : isAdminMode ? (
        /* Shopify Admin Panel Mode */
        <AdminLayout>
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'products' && <ProductsManager />}
          {activeTab === 'inventory' && <InventoryManager />}
          {activeTab === 'masters' && <MastersManager />}
          {activeTab === 'homes' && <BambooHomesManager />}
          {activeTab === 'seo' && <SeoManager />}
          {activeTab === 'storage' && <StorageManager />}
          {activeTab === 'orders' && <OrdersManager />}
          {activeTab === 'redux_console' && <ReduxFormConsole />}
        </AdminLayout>
      ) : (
        /* Shopify Customer Storefront Mode */
        <div className="flex-1 flex flex-col">
          <Header />
          <HeroBanner />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">
            {/* Price Filter & Sort Bar */}
            <PriceRangeSelector />

            {/* Custom Bamboo Home Architecture Estimator & Customizer */}
            <BambooHomeCustomizer />

            {/* Product Catalog Grid */}
            <section className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-50">
                    Bamboo Products & Architecture Catalog
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Showing {products.length} sustainable items across all selling prices
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div
                      key={n}
                      className="bg-stone-900 border border-stone-800 rounded-2xl h-80 animate-pulse p-4 space-y-3"
                    >
                      <div className="aspect-4/3 bg-stone-800 rounded-xl"></div>
                      <div className="h-4 bg-stone-800 rounded w-3/4"></div>
                      <div className="h-3 bg-stone-800 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="bg-stone-900 p-12 rounded-3xl border border-stone-800 text-center space-y-3">
                  <div className="text-3xl">🌱</div>
                  <h3 className="text-lg font-bold text-stone-200">No Bamboo Products Found</h3>
                  <p className="text-xs text-stone-400">
                    Try broadening your price range slider or search keywords.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenDetail={(p) => setSelectedProductDetail(p)}
                    />
                  ))}
                </div>
              )}
            </section>
          </main>

          <Footer />

          {/* Account Auth Modal */}
          <AuthModal />

          {/* Cart Drawer */}
          <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />

          {/* Product Detail Modal */}
          <ProductDetailModal
            product={selectedProductDetail}
            onClose={() => setSelectedProductDetail(null)}
          />

          {/* Checkout Modal */}
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            onOrderSuccess={(ordId) => setPlacedOrderId(ordId)}
          />

          {/* Order Success Confirmation Modal */}
          {placedOrderId && (
            <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-stone-900 border border-emerald-600 rounded-3xl max-w-md w-full p-8 text-center space-y-4 shadow-2xl">
                <div className="w-16 h-16 bg-emerald-600/20 text-emerald-400 border border-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl">
                  ✓
                </div>
                <h3 className="text-2xl font-black text-stone-50">Order Confirmed!</h3>
                <p className="text-xs text-stone-300">
                  Thank you for purchasing bamboo products! Your order number is{' '}
                  <strong className="text-amber-400 font-mono">{placedOrderId}</strong>.
                </p>
                <button
                  onClick={() => setPlacedOrderId(null)}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
