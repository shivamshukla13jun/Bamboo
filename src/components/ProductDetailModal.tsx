'use client';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addToCart } from '../store/cartSlice';
import { Product } from '../types';
import { formatPrice } from '../utils/formatters';
import { siteConfig } from '../config/site';
import { X, Star, ShoppingBag, Leaf, Check, Search } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const dispatch = useDispatch();
  const currency = useSelector((state: RootState) => state.cart.currency);
  const currencyRates = useSelector((state: RootState) => state.cart.currencyRates);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity }));
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-700 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto text-neutral-100 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white z-10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-6 sm:p-8">
          {/* Left Column: Image Gallery */}
          <div className="space-y-3">
            <div className="aspect-4/3 rounded-2xl bg-neutral-950 overflow-hidden border border-neutral-800">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx ? 'border-primary-500 ring-2 ring-primary-500/30' : 'border-neutral-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Admin SEO Snippet Preview Card */}
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2 mt-4">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <Search className="w-3.5 h-3.5 text-primary-400" />
                <span>Google Search Engine Preview</span>
              </div>
              <div className="font-sans text-xs space-y-0.5">
                <div className="text-blue-400 text-sm font-medium hover:underline cursor-pointer truncate">
                  {product.seoTitle || product.name}
                </div>
                <div className="text-primary-500 text-[11px] truncate">
                  {siteConfig.siteUrl}/products/{product.slug}
                </div>
                <div className="text-neutral-400 text-[11px] line-clamp-2 leading-relaxed">
                  {product.seoDescription || product.description}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Specs & Actions */}
          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold uppercase text-primary-400 tracking-wider bg-primary-950 px-2.5 py-1 rounded-full border border-primary-800">
                {product.categoryName || 'Bamboo'}
              </span>

              <h2 className="text-2xl font-black text-neutral-50 mt-3 leading-snug">
                {product.name}
              </h2>

              <div className="flex items-center gap-3 mt-2 text-xs text-neutral-300">
                <div className="flex items-center text-accent-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-1 font-bold text-neutral-100">{product.rating}</span>
                </div>
                <span>•</span>
                <span>{product.reviewsCount} Verified Eco Reviews</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex justify-between items-center">
              <div>
                <span className="text-xs text-neutral-400 block">Selling Price</span>
                <span className="text-2xl font-black text-accent-400 font-mono">
                  {formatPrice(product.price, currency, currencyRates)}
                </span>
              </div>
              <span className="text-xs text-primary-400 font-bold bg-primary-950/80 px-3 py-1 rounded-full border border-primary-800">
                In Stock: {product.stock} units
              </span>
            </div>

            {/* Bamboo Technical Specifications */}
            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-primary-400" />
                <span>Material & Eco Specifications</span>
              </h3>

              <div className="grid grid-cols-2 gap-2 text-neutral-300">
                {product.speciesName && (
                  <div className="bg-neutral-800 p-2.5 rounded-xl border border-neutral-700">
                    <span className="text-neutral-400 text-[10px] block">Species:</span>
                    <span className="font-bold text-primary-300">{product.speciesName}</span>
                  </div>
                )}
                {product.treatmentName && (
                  <div className="bg-neutral-800 p-2.5 rounded-xl border border-neutral-700">
                    <span className="text-neutral-400 text-[10px] block">Preservation:</span>
                    <span className="font-bold text-neutral-200">{product.treatmentName}</span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="bg-neutral-800 p-2.5 rounded-xl border border-neutral-700">
                    <span className="text-neutral-400 text-[10px] block">Dimensions:</span>
                    <span className="font-bold text-neutral-200">{product.dimensions}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/50 p-3 rounded-xl border border-neutral-800">
              {product.description}
            </p>

            {/* Action Bar */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-neutral-300">Quantity:</span>
                <div className="flex items-center bg-neutral-950 border border-neutral-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-mono font-bold text-neutral-100">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                  addedSuccess
                    ? 'bg-primary-500 text-neutral-950'
                    : 'bg-primary-600 hover:bg-primary-500 text-white'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Shopping Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add {quantity} to Bag</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
