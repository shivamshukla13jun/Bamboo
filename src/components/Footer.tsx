import React from 'react';
import { Leaf, ShieldCheck, HardDrive, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-950 border-t border-stone-800 text-stone-400 text-xs py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white text-base font-bold">
              🌱
            </div>
            <span className="text-lg font-black text-stone-100 tracking-tight">Bamboorise</span>
          </div>
          <p className="text-stone-400 leading-relaxed text-xs">
            Shopify-style sustainable bamboo homes & products e-commerce platform. Selling bamboo architecture, structural culms, flooring, and eco goods across all price ranges.
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <h4 className="text-stone-200 font-bold uppercase tracking-wider text-[11px]">Eco Categories</h4>
          <ul className="space-y-1.5 text-stone-400">
            <li><a href="#" className="hover:text-emerald-400 transition-colors">Custom Bamboo Eco-Villas</a></li>
            <li><a href="#" className="hover:text-emerald-400 transition-colors">Modular Prefab Cabins</a></li>
            <li><a href="#" className="hover:text-emerald-400 transition-colors">Strand Woven Flooring</a></li>
            <li><a href="#" className="hover:text-emerald-400 transition-colors">Heavy Structural Beams</a></li>
            <li><a href="#" className="hover:text-emerald-400 transition-colors">Handcrafted Kitchenware</a></li>
          </ul>
        </div>

        {/* Technology Architecture */}
        <div className="space-y-2">
          <h4 className="text-stone-200 font-bold uppercase tracking-wider text-[11px]">Tech Architecture</h4>
          <ul className="space-y-1.5 text-stone-400">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>State: Redux Toolkit + RHF Error Bridge</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Data Fetching: TanStack Query</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Database: MongoDB Mongoose Engine</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Storage: AWS | Cloudinary | MinIO</span>
            </li>
          </ul>
        </div>

        {/* Guarantees */}
        <div className="space-y-2">
          <h4 className="text-stone-200 font-bold uppercase tracking-wider text-[11px]">Quality Guarantee</h4>
          <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>50-Year Structural Lifespan</span>
            </div>
            <p className="text-[11px] text-stone-400">
              All bamboo posts undergo pressure-vacuum Borax/Boron salt treatment preventing 100% of insect infestation.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-stone-800/80 flex flex-wrap justify-between items-center gap-4">
        <span>© 2026 Bamboorise Eco Homes Inc. All rights reserved.</span>
        <span className="text-emerald-400 font-mono">SEO Admin Handle Enabled • Single App Node TS</span>
      </div>
    </footer>
  );
};
