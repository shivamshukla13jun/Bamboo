'use client';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addToCart } from '../store/cartSlice';
import { Product } from '../types';
import { formatPrice } from '../utils/formatters';
import { ShoppingBag, Star, Eye, Home } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetail }) => {
  const dispatch = useDispatch();
  const currency = useSelector((state: RootState) => state.cart.currency);
  const currencyRates = useSelector((state: RootState) => state.cart.currencyRates);

  const isHome = product.isCustomHome || product.categorySlug === 'homes';
  const defaultVariant = product.variants?.find((v) => v.isDefault) || product.variants?.[0];
  const displayImage = defaultVariant?.image || product.images[0];

  return (
    <div className="bg-neutral-800 border border-neutral-700/80 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-primary-600/80 transition-all duration-300 shadow-sm hover:shadow-xl">
      <div>
        {/* Image Container */}
        <div className="relative aspect-4/3 bg-neutral-900 overflow-hidden cursor-pointer" onClick={() => onOpenDetail(product)}>
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
            <span className="bg-neutral-950/80 backdrop-blur-md text-primary-400 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border border-primary-800/60">
              {product.categoryName || 'Bamboo'}
            </span>
            {product.isFeatured && (
              <span className="bg-accent-500 text-neutral-950 text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
                Featured
              </span>
            )}
          </div>

          {/* Quick View Button on Hover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(product);
            }}
            className="absolute bottom-3 right-3 p-2 rounded-xl bg-neutral-900/90 hover:bg-primary-600 text-neutral-200 hover:text-white border border-neutral-700 transition-all opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0"
            title="Quick View Details & SEO Specs"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-2.5">
          {/* Bamboo Species / Cert */}
          {product.speciesName && (
            <span className="text-[11px] font-medium text-primary-400 block truncate">
              🌿 {product.speciesName}
            </span>
          )}

          <h3
            onClick={() => onOpenDetail(product)}
            className="text-sm font-bold text-neutral-100 group-hover:text-primary-300 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {product.name}
          </h3>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <div className="flex items-center text-accent-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="ml-1 font-bold text-neutral-200">{product.rating}</span>
            </div>
            <span>•</span>
            <span>({product.reviewsCount} reviews)</span>
          </div>

          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Footer Price & Action */}
      <div className="p-4 pt-0 space-y-3">
        <div className="flex items-baseline justify-between border-t border-neutral-700/60 pt-3">
          <div>
            <span className="text-xs text-neutral-400 block">Price</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-accent-400 font-mono">
                {formatPrice(product.price, currency, currencyRates)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-neutral-500 line-through">
                  {formatPrice(product.originalPrice, currency, currencyRates)}
                </span>
              )}
            </div>
          </div>

          <span className="text-[10px] text-neutral-400 font-medium bg-neutral-900 px-2 py-1 rounded border border-neutral-700">
            Stock: {product.stock}
          </span>
        </div>

        {/* Action Button */}
        {isHome ? (
          <a
            href="#home-builder"
            className="w-full py-2 rounded-xl bg-accent-500 hover:bg-accent-400 text-neutral-950 font-black text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Customize Home Blueprint</span>
          </a>
        ) : (
          <button
            onClick={() => dispatch(addToCart({ product, quantity: 1 }))}
            className="w-full py-2 rounded-xl bg-primary-700 hover:bg-primary-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Bag</span>
          </button>
        )}
      </div>
    </div>
  );
};
