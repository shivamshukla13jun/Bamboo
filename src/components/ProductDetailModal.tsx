'use client';
import React from 'react';
import { Product } from '../types';
import { siteConfig } from '../config/site';
import { X, ExternalLink } from 'lucide-react';
import { ProductDetailBody } from './ProductDetailBody';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-700 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto text-neutral-100 shadow-2xl relative p-6 sm:p-8">
        {/* Close Button + shareable product link */}
        <a
          href={`/products/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Open product page"
          className="absolute top-4 right-14 p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white z-10 transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white z-10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <ProductDetailBody product={product} />
      </div>
    </div>
  );
};
