import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string;
  discountAmount: number;
  shippingCost: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'AUD';
  currencyRates: Record<string, number>;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
  couponCode: '',
  discountAmount: 0,
  shippingCost: 0,
  currency: 'USD',
  currencyRates: {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.78,
    AUD: 1.52
  }
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
      if (code === 'BAMBOO10') {
        state.discountAmount = 10; // 10%
      } else if (code === 'ECOHOME500') {
        state.discountAmount = 500; // $500 flat discount for homes
      } else {
        state.discountAmount = 0;
      }
    },
    setCurrency: (state, action: PayloadAction<'USD' | 'EUR' | 'GBP' | 'AUD'>) => {
      state.currency = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
      state.couponCode = '';
      state.discountAmount = 0;
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
