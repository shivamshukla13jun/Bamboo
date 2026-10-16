'use client';
import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { siteConfig } from '../config/site';

export const Footer: React.FC = () => {
  const { footer } = siteConfig;

  return (
    <footer className="bg-stone-950 border-t border-stone-800 text-stone-400 text-xs py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white text-base font-bold">
              {siteConfig.logoEmoji}
            </div>
            <span className="text-lg font-black text-stone-100 tracking-tight">
              {siteConfig.siteName}
            </span>
          </div>
          <p className="text-stone-400 leading-relaxed text-xs">{siteConfig.brandDescription}</p>
          <p className="text-stone-500 text-[11px] leading-relaxed">
            {siteConfig.contact.address}
            <br />
            {siteConfig.contact.phone} • {siteConfig.contact.email}
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <h4 className="text-stone-200 font-bold uppercase tracking-wider text-[11px]">
            {footer.categoriesHeading}
          </h4>
          <ul className="space-y-1.5 text-stone-400">
            {footer.categoryLinks.map((link) => (
              <li key={link}>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Technology Architecture */}
        <div className="space-y-2">
          <h4 className="text-stone-200 font-bold uppercase tracking-wider text-[11px]">
            {footer.techHeading}
          </h4>
          <ul className="space-y-1.5 text-stone-400">
            {footer.techItems.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Guarantees */}
        <div className="space-y-2">
          <h4 className="text-stone-200 font-bold uppercase tracking-wider text-[11px]">
            {footer.guaranteeHeading}
          </h4>
          <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>{footer.guaranteeTitle}</span>
            </div>
            <p className="text-[11px] text-stone-400">{footer.guaranteeText}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-stone-800/80 flex flex-wrap justify-between items-center gap-4">
        <span>{footer.copyright}</span>
        <span className="text-emerald-400 font-mono">{footer.note}</span>
      </div>
    </footer>
  );
};
