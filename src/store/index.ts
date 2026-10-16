'use client';
import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import cartReducer, { CartState } from './cartSlice';
import authReducer, { AuthState } from './authSlice';
import adminReducer from './adminSlice';
import filterReducer from './filterSlice';
import seoReducer from './seoSlice';
import reduxFormErrorBridgeReducer from './reduxFormErrorBridgeSlice';

// Persist cart contents + coupon so the bag survives reloads;
// drawer open-state stays ephemeral.
const cartPersistConfig = {
  key: 'cart',
  storage,
  whitelist: ['items', 'couponCode']
};

// Persist the signed-in user for instant UI; session is still
// re-validated via /api/auth/me on load. Modal flags stay transient.
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user']
};

export const store = configureStore({
  reducer: {
    cart: persistReducer<CartState>(cartPersistConfig, cartReducer),
    auth: persistReducer<AuthState>(authPersistConfig, authReducer),
    admin: adminReducer,
    filter: filterReducer,
    seo: seoReducer,
    formErrors: reduxFormErrorBridgeReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
