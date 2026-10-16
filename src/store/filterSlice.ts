import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductCategory } from '../types';

interface FilterState {
  category: ProductCategory | 'all';
  searchTerm: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'featured' | 'price_asc' | 'price_desc' | 'rating';
  quickPricePreset: 'all' | 'under_25' | '25_200' | '200_2000' | '2000_25000' | '25000_plus';
  selectedSpecies: string;
}

const initialState: FilterState = {
  category: 'all',
  searchTerm: '',
  minPrice: 0,
  maxPrice: 150000,
  sortBy: 'featured',
  quickPricePreset: 'all',
  selectedSpecies: 'all'
};

export const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<ProductCategory | 'all'>) => {
      state.category = action.payload;
      state.quickPricePreset = 'all';
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setPriceRange: (state, action: PayloadAction<{ min: number; max: number }>) => {
      state.minPrice = action.payload.min;
      state.maxPrice = action.payload.max;
    },
    setQuickPricePreset: (state, action: PayloadAction<FilterState['quickPricePreset']>) => {
      state.quickPricePreset = action.payload;
      switch (action.payload) {
        case 'under_25':
          state.minPrice = 0;
          state.maxPrice = 25;
          break;
        case '25_200':
          state.minPrice = 25;
          state.maxPrice = 200;
          break;
        case '200_2000':
          state.minPrice = 200;
          state.maxPrice = 2000;
          break;
        case '2000_25000':
          state.minPrice = 2000;
          state.maxPrice = 25000;
          break;
        case '25000_plus':
          state.minPrice = 25000;
          state.maxPrice = 150000;
          break;
        case 'all':
        default:
          state.minPrice = 0;
          state.maxPrice = 150000;
          break;
      }
    },
    setSortBy: (state, action: PayloadAction<FilterState['sortBy']>) => {
      state.sortBy = action.payload;
    },
    setSelectedSpecies: (state, action: PayloadAction<string>) => {
      state.selectedSpecies = action.payload;
    },
    resetFilters: (state) => {
      state.category = 'all';
      state.searchTerm = '';
      state.minPrice = 0;
      state.maxPrice = 150000;
      state.sortBy = 'featured';
      state.quickPricePreset = 'all';
      state.selectedSpecies = 'all';
    }
  }
});

export const {
  setCategory,
  setSearchTerm,
  setPriceRange,
  setQuickPricePreset,
  setSortBy,
  setSelectedSpecies,
  resetFilters
} = filterSlice.actions;

export default filterSlice.reducer;
