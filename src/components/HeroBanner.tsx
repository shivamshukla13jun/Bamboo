'use client';
import React from 'react';
import { useDispatch } from 'react-redux';
import { setCategory, setQuickPricePreset } from '../store/filterSlice';
import { Home, Leaf, CheckCircle2 } from 'lucide-react';
import { siteConfig } from '../config/site';

export const HeroBanner: React.FC = () => {
  const dispatch = useDispatch();
  const { hero } = siteConfig;

  return (
    <section className="relative bg-neutral-900 border-b border-neutral-800 text-neutral-100 overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-accent-600 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16 relative z-10 grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Copy & CTAs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-950/80 border border-primary-700/60 text-primary-300 text-xs font-semibold">
            <Leaf className="w-3.5 h-3.5 text-primary-400" />
            <span>{hero.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-neutral-50 tracking-tight leading-tight">
            {hero.title}
          </h1>

          <p className="text-neutral-300 text-base sm:text-lg leading-relaxed max-w-2xl">
            {hero.subtitle}
          </p>

          {/* Quick Price Buttons */}
          <div className="pt-2">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block mb-3">
              {hero.browseLabel}
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              <button
                onClick={() => dispatch(setQuickPricePreset('under_25'))}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-primary-900/60 hover:text-primary-300 text-neutral-200 border border-neutral-700 transition-all"
              >
                Under $25 (Kitchenware)
              </button>
              <button
                onClick={() => dispatch(setQuickPricePreset('25_200'))}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-primary-900/60 hover:text-primary-300 text-neutral-200 border border-neutral-700 transition-all"
              >
                $25 - $200 (Decor & Panels)
              </button>
              <button
                onClick={() => dispatch(setQuickPricePreset('200_2000'))}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-primary-900/60 hover:text-primary-300 text-neutral-200 border border-neutral-700 transition-all"
              >
                $200 - $2,000 (Beams & Flooring)
              </button>
              <button
                onClick={() => {
                  dispatch(setCategory('homes'));
                  dispatch(setQuickPricePreset('2000_25000'));
                }}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-primary-900/60 hover:text-primary-300 text-neutral-200 border border-neutral-700 transition-all"
              >
                $2k - $25k (Prefab Cabins)
              </button>
              <button
                onClick={() => {
                  dispatch(setCategory('homes'));
                  dispatch(setQuickPricePreset('25000_plus'));
                }}
                className="px-3 py-1.5 rounded-lg bg-primary-700 hover:bg-primary-600 text-white font-bold transition-all shadow"
              >
                $25k+ (Custom Bamboo Homes)
              </button>
            </div>
          </div>

          {/* Trust Highlights */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-neutral-800/80 text-xs text-neutral-300">
            {hero.trustHighlights.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Feature Card Visual */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-2xl overflow-hidden border border-neutral-700 shadow-2xl bg-neutral-800 group">
            <img
              src={hero.featuredCard.image}
              alt={hero.featuredCard.title}
              className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent"></div>

            <div className="absolute bottom-0 left-0 right-0 p-5 text-neutral-100">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] uppercase font-bold text-primary-400 tracking-wider bg-primary-950/80 px-2 py-0.5 rounded border border-primary-700/60">
                    {hero.featuredCard.badge}
                  </span>
                  <h3 className="text-xl font-bold mt-1 text-white">{hero.featuredCard.title}</h3>
                  <p className="text-xs text-neutral-300 mt-0.5">{hero.featuredCard.subtitle}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-neutral-400 block line-through">
                    {hero.featuredCard.originalPrice}
                  </span>
                  <span className="text-xl font-black text-accent-400">{hero.featuredCard.price}</span>
                </div>
              </div>

              <a
                href="#home-builder"
                className="mt-4 w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow"
              >
                <Home className="w-4 h-4" />
                <span>{hero.featuredCard.ctaText}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
