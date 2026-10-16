import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AdminTab, NotificationType } from '../types';

export { AdminTab, NotificationType };

interface AdminState {
  editingProductId: string | null;
  isProductModalOpen: boolean;
  notification: { message: string; type: NotificationType } | null;
}

const initialState: AdminState = {
  editingProductId: null,
  isProductModalOpen: false,
  notification: null
};

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    openProductModal: (state, action: PayloadAction<string | null>) => {
      state.editingProductId = action.payload;
      state.isProductModalOpen = true;
    },
    closeProductModal: (state) => {
      state.editingProductId = null;
      state.isProductModalOpen = false;
    },
    setNotification: (
      state,
      action: PayloadAction<{ message: string; type: NotificationType } | null>
    ) => {
      state.notification = action.payload;
    }
  }
});

export const {
  openProductModal,
  closeProductModal,
  setNotification
} = adminSlice.actions;

export default adminSlice.reducer;
