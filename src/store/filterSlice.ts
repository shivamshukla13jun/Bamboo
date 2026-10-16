import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductCategory, SortBy, PricePreset } from '../types';
import { siteConfig } from '../config/site';

interface FilterState {
  category: ProductCategory | 'all';
  searchTerm: string;
  minPrice: number;
  maxPrice: number;
  sortBy: SortBy;
  quickPricePreset: PricePreset;
  selectedSpecies: string;
}

const DEFAULT_MAX_PRICE = 150000;

/** Price preset ranges are configured in site.config.json -> pricePresets */
const presetRange = (key: string) =>
  siteConfig.pricePresets.find((p) => p.key === key) || { min: 0, max: DEFAULT_MAX_PRICE };

const initialState: FilterState = {
  category: 'all',
  searchTerm: '',
  minPrice: 0,
  maxPrice: DEFAULT_MAX_PRICE,
  sortBy: SortBy.Featured,
  quickPricePreset: PricePreset.All,
  selectedSpecies: 'all'
};

export const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<ProductCategory | 'all'>) => {
      state.category = action.payload;
      state.quickPricePreset = PricePreset.All;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setPriceRange: (state, action: PayloadAction<{ min: number; max: number }>) => {
      state.minPrice = action.payload.min;
      state.maxPrice = action.payload.max;
    },
    setQuickPricePreset: (state, action: PayloadAction<PricePreset>) => {
      state.quickPricePreset = action.payload;
      const range = presetRange(action.payload);
      state.minPrice = range.min;
      state.maxPrice = range.max;
    },
    setSortBy: (state, action: PayloadAction<SortBy>) => {
      state.sortBy = action.payload;
    },
    setSelectedSpecies: (state, action: PayloadAction<string>) => {
      state.selectedSpecies = action.payload;
    },
    resetFilters: (state) => {
      state.category = 'all';
      state.searchTerm = '';
      state.minPrice = 0;
      state.maxPrice = DEFAULT_MAX_PRICE;
      state.sortBy = SortBy.Featured;
      state.quickPricePreset = PricePreset.All;
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
