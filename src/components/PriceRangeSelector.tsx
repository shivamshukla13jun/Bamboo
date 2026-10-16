'use client';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import {
  setQuickPricePreset,
  setPriceRange,
  setSortBy,
  setCategory,
  resetFilters
} from '../store/filterSlice';
import { SlidersHorizontal, RotateCcw, DollarSign, Tag } from 'lucide-react';
import { SortBy } from '../types';
import { siteConfig } from '../config/site';
import { formatPrice } from '../utils/formatters';

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: SortBy.Featured, label: 'Featured First' },
  { value: SortBy.PriceAsc, label: 'Price: Low to High' },
  { value: SortBy.PriceDesc, label: 'Price: High to Low' },
  { value: SortBy.Rating, label: 'Highest Rated' }
];

const SLIDER_MAX = Math.max(...siteConfig.pricePresets.map((p) => p.max));

export const PriceRangeSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { category, minPrice, maxPrice, sortBy, quickPricePreset } = useSelector(
    (state: RootState) => state.filter
  );
  const { currency, currencyRates } = useSelector((state: RootState) => state.cart);

  return (
    <div className="bg-neutral-800 border-b border-neutral-700/80 p-4 sm:p-5 rounded-2xl shadow-sm my-6 text-neutral-100">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary-400" />
          <h2 className="text-sm font-bold text-neutral-100 uppercase tracking-wider">
            Filter All Selling Prices
          </h2>
        </div>

        {/* Reset Filters */}
        <button
          onClick={() => dispatch(resetFilters())}
          className="text-xs text-neutral-400 hover:text-primary-400 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-center">
        {/* Price Slider */}
        <div className="md:col-span-6 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-neutral-300">
            <span>Price Range:</span>
            <span className="text-primary-400 font-bold font-mono">
              {formatPrice(minPrice, currency, currencyRates)} – {formatPrice(maxPrice, currency, currencyRates)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400 font-mono">
              {formatPrice(0, currency, currencyRates)}
            </span>
            <input
              type="range"
              min="0"
              max={SLIDER_MAX}
              step="50"
              value={maxPrice}
              onChange={(e) =>
                dispatch(setPriceRange({ min: minPrice, max: Number(e.target.value) }))
              }
              className="w-full accent-primary-500 cursor-pointer"
            />
            <span className="text-xs text-neutral-400 font-mono">
              {formatPrice(SLIDER_MAX, currency, currencyRates)}
            </span>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="md:col-span-6 flex flex-wrap items-center justify-end gap-3">
          <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-neutral-400" />
            <span>Sort By:</span>
          </label>
          <select
            value={sortBy}
            onChange={(e) => dispatch(setSortBy(e.target.value as SortBy))}
            className="bg-neutral-900 text-neutral-100 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary-500 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
