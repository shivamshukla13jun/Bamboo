'use client';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import authReducer from './authSlice';
import adminReducer from './adminSlice';
import filterReducer from './filterSlice';
import seoReducer from './seoSlice';
import reduxFormErrorBridgeReducer from './reduxFormErrorBridgeSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    admin: adminReducer,
    filter: filterReducer,
    seo: seoReducer,
    formErrors: reduxFormErrorBridgeReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
