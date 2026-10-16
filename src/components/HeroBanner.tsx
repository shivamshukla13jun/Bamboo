'use client';
import React from 'react';
import { useDispatch } from 'react-redux';
import { setCategory, setQuickPricePreset } from '../store/filterSlice';
import { ShieldCheck, Home, Leaf, Layers, Sparkles, CheckCircle2 } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const dispatch = useDispatch();

  return (
    <section className="relative bg-stone-900 border-b border-stone-800 text-stone-100 overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-amber-600 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16 relative z-10 grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Copy & CTAs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sustainable Architecture & Eco Living Marketplace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-stone-50 tracking-tight leading-tight">
            Building Eco-Homes & Living with <span className="text-emerald-400">Pure Bamboo</span>.
          </h1>

          <p className="text-stone-300 text-base sm:text-lg leading-relaxed max-w-2xl">
            From <span className="text-emerald-300 font-bold">$18 eco kitchenware</span> to <span className="text-amber-300 font-bold">$115,000 custom structural bamboo villas</span>. Explore certified bamboo timber, strand-woven flooring, prefab cabins, and eco-architecture.
          </p>

          {/* Quick Price Buttons */}
          <div className="pt-2">
            <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold block mb-3">
              Browse All Price Points:
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              <button
                onClick={() => dispatch(setQuickPricePreset('under_25'))}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-emerald-900/60 hover:text-emerald-300 text-stone-200 border border-stone-700 transition-all"
              >
                Under $25 (Kitchenware)
              </button>
              <button
                onClick={() => dispatch(setQuickPricePreset('25_200'))}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-emerald-900/60 hover:text-emerald-300 text-stone-200 border border-stone-700 transition-all"
              >
                $25 - $200 (Decor & Panels)
              </button>
              <button
                onClick={() => dispatch(setQuickPricePreset('200_2000'))}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-emerald-900/60 hover:text-emerald-300 text-stone-200 border border-stone-700 transition-all"
              >
                $200 - $2,000 (Beams & Flooring)
              </button>
              <button
                onClick={() => {
                  dispatch(setCategory('homes'));
                  dispatch(setQuickPricePreset('2000_25000'));
                }}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-emerald-900/60 hover:text-emerald-300 text-stone-200 border border-stone-700 transition-all"
              >
                $2k - $25k (Prefab Cabins)
              </button>
              <button
                onClick={() => {
                  dispatch(setCategory('homes'));
                  dispatch(setQuickPricePreset('25000_plus'));
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition-all shadow"
              >
                $25k+ (Custom Bamboo Homes)
              </button>
            </div>
          </div>

          {/* Trust Highlights */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-stone-800/80 text-xs text-stone-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>50-Year Pest & Boron Treated</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>3x Harder Than Red Oak</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Carbon-Negative Living</span>
            </div>
          </div>
        </div>

        {/* Right Feature Card Visual */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-2xl overflow-hidden border border-stone-700 shadow-2xl bg-stone-800 group">
            <img
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80"
              alt="Luxury Bamboo Villa"
              className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent"></div>

            <div className="absolute bottom-0 left-0 right-0 p-5 text-stone-100">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/60">
                    Featured Architecture
                  </span>
                  <h3 className="text-xl font-bold mt-1 text-white">Aura Eco-Villa Bamboo Home</h3>
                  <p className="text-xs text-stone-300 mt-0.5">2,400 sq ft • Structural Petung Culms</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-400 block line-through">$130,000</span>
                  <span className="text-xl font-black text-amber-400">$115,000</span>
                </div>
              </div>

              <a
                href="#bamboo-home-builder"
                className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow"
              >
                <Home className="w-4 h-4" />
                <span>Configure Custom Bamboo House</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
