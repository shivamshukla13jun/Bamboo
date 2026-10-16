import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Product } from '../types';
import { siteConfig, currencyRates } from '../config/site';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string;
  discountAmount: number;
  discountType: 'percentage' | 'fixed' | null;
  shippingCost: number;
  currency: string;
  currencyRates: Record<string, number>;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
  couponCode: '',
  discountAmount: 0,
  discountType: null,
  shippingCost: 0,
  currency: siteConfig.commerce.defaultCurrency,
  currencyRates
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; quantity?: number; selectedOption?: string }>) => {
      const { product, quantity = 1, selectedOption } = action.payload;
      const existing = state.items.find(
        item => item.product.id === product.id && item.selectedOption === selectedOption
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ product, quantity, selectedOption });
      }
      state.isOpen = true;
    },
    removeFromCart: (state, action: PayloadAction<{ productId: string; selectedOption?: string }>) => {
      state.items = state.items.filter(
        item => !(item.product.id === action.payload.productId && item.selectedOption === action.payload.selectedOption)
      );
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number; selectedOption?: string }>) => {
      const item = state.items.find(
        i => i.product.id === action.payload.productId && i.selectedOption === action.payload.selectedOption
      );
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(i => i !== item);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
    },
    toggleCartDrawer: (state, action: PayloadAction<boolean | undefined>) => {
      state.isOpen = action.payload !== undefined ? action.payload : !state.isOpen;
    },
    applyCoupon: (state, action: PayloadAction<string>) => {
      const code = action.payload.trim().toUpperCase();
      state.couponCode = code;
      const coupon = siteConfig.commerce.coupons[code];
      if (coupon) {
        state.discountAmount = coupon.value;
        state.discountType = coupon.type;
      } else {
        state.discountAmount = 0;
        state.discountType = null;
      }
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
      state.couponCode = '';
      state.discountAmount = 0;
      state.discountType = null;
    }
  }
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  toggleCartDrawer,
  applyCoupon,
  setCurrency,
  clearCart
} = cartSlice.actions;

export default cartSlice.reducer;
