import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthUser } from '../types';

interface AuthState {
  user: AuthUser | null;
  isAuthModalOpen: boolean;
  sessionChecked: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthModalOpen: false,
  sessionChecked: false
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.sessionChecked = true;
    },
    setSessionChecked: (state, action: PayloadAction<boolean>) => {
      state.sessionChecked = action.payload;
    },
    openAuthModal: (state, action: PayloadAction<boolean | undefined>) => {
      state.isAuthModalOpen = action.payload !== undefined ? action.payload : true;
    }
  }
});

export const { setUser, setSessionChecked, openAuthModal } = authSlice.actions;

export default authSlice.reducer;
