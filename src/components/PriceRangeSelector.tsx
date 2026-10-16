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

export const PriceRangeSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { category, minPrice, maxPrice, sortBy, quickPricePreset } = useSelector(
    (state: RootState) => state.filter
  );

  return (
    <div className="bg-stone-800 border-b border-stone-700/80 p-4 sm:p-5 rounded-2xl shadow-sm my-6 text-stone-100">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-stone-100 uppercase tracking-wider">
            Filter All Selling Prices
          </h2>
        </div>

        {/* Reset Filters */}
        <button
          onClick={() => dispatch(resetFilters())}
          className="text-xs text-stone-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-center">
        {/* Price Slider */}
        <div className="md:col-span-6 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-stone-300">
            <span>Price Range:</span>
            <span className="text-emerald-400 font-bold font-mono">
              ${minPrice.toLocaleString()} – ${maxPrice.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400 font-mono">$0</span>
            <input
              type="range"
              min="0"
              max="150000"
              step="50"
              value={maxPrice}
              onChange={(e) =>
                dispatch(setPriceRange({ min: minPrice, max: Number(e.target.value) }))
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <span className="text-xs text-stone-400 font-mono">$150k</span>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="md:col-span-6 flex flex-wrap items-center justify-end gap-3">
          <label className="text-xs font-semibold text-stone-300 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-stone-400" />
            <span>Sort By:</span>
          </label>
          <select
            value={sortBy}
            onChange={(e) => dispatch(setSortBy(e.target.value as any))}
            className="bg-stone-900 text-stone-100 border border-stone-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="featured">Featured First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>
    </div>
  );
};
