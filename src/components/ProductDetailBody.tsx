'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addToCart } from '../store/cartSlice';
import { Product } from '../types';
import { formatPrice } from '../utils/formatters';
import { siteConfig } from '../config/site';
import { Star, ShoppingBag, Leaf, Check, Search, ArrowRight } from 'lucide-react';

/**
 * Shared product detail content (gallery, variants, specs, add-to-cart).
 * Used by both the storefront modal and the standalone /products/[slug] page.
 */
export const ProductDetailBody: React.FC<{ product: Product }> = ({ product }) => {
  const dispatch = useDispatch();
  const currency = useSelector((state: RootState) => state.cart.currency);
  const currencyRates = useSelector((state: RootState) => state.cart.currencyRates);
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    const def = product?.variants?.find((v) => v.isDefault) || product?.variants?.[0];
    setSelectedVariantId(def?.id || null);
    setActiveImageIndex(0);
    setQuantity(1);
  }, [product?.id]);

  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId) || null;
  const mainImage =
    selectedVariant?.image || product.images[activeImageIndex] || product.images[0];
  const displayPrice = selectedVariant?.price ?? product.price;
  const displayStock = selectedVariant?.stock ?? product.stock;
  const inCart = cartItems.some(
    (i) =>
      i.product.id === product.id &&
      (i.variant?.id ?? i.selectedOption ?? null) === (selectedVariant?.id ?? null)
  );

  const handleAddToCart = () => {
    dispatch(addToCart({ product, variant: selectedVariant || undefined, quantity }));
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left Column: Image Gallery */}
      <div className="space-y-3">
        <div className="aspect-4/3 rounded-2xl bg-neutral-950 overflow-hidden border border-neutral-800">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        {product.images.length > 1 && !selectedVariant?.image && (
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

        {/* Google SERP Preview Card */}
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
            {product.categoryName || 'Product'}
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

        {/* Variant Selector — swaps image, price & stock */}
        {product.variants && product.variants.length > 1 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
              Select Option
            </span>
            <div className="grid grid-cols-2 gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                    v.id === selectedVariantId
                      ? 'border-primary-500 bg-primary-950/60 ring-1 ring-primary-500/40'
                      : 'border-neutral-800 bg-neutral-950 hover:border-neutral-600'
                  }`}
                >
                  {v.image ? (
                    <img
                      src={v.image}
                      alt={v.name}
                      className="w-9 h-9 rounded-lg object-cover bg-neutral-900 border border-neutral-800 shrink-0"
                    />
                  ) : (
                    <span className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-500 text-[9px] font-mono shrink-0">
                      {v.sku.slice(0, 4)}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold text-neutral-100 truncate">
                      {v.name}
                    </span>
                    <span className="block text-[10px] font-mono text-accent-400">
                      {formatPrice(v.price, currency, currencyRates)}
                      {v.stock === 0 && (
                        <span className="text-rose-400 ml-1">(out)</span>
                      )}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex justify-between items-center">
          <div>
            <span className="text-xs text-neutral-400 block">
              {selectedVariant ? `${selectedVariant.name} Price` : 'Selling Price'}
            </span>
            <span className="text-2xl font-black text-accent-400 font-mono">
              {formatPrice(displayPrice, currency, currencyRates)}
            </span>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            displayStock > 0
              ? 'text-primary-400 bg-primary-950/80 border-primary-800'
              : 'text-rose-400 bg-rose-950/80 border-rose-800'
          }`}>
            {displayStock > 0 ? `In Stock: ${displayStock} units` : 'Out of Stock'}
          </span>
        </div>

        {/* Material & Eco Specifications */}
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

          {inCart ? (
            <Link
              href="/cart"
              className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg bg-accent-500 hover:bg-accent-400 text-neutral-950"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Go to Cart</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={displayStock === 0}
              className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                displayStock === 0
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : addedSuccess
                    ? 'bg-primary-500 text-neutral-950'
                    : 'bg-primary-600 hover:bg-primary-500 text-white'
              }`}
            >
              {displayStock === 0 ? (
                <span>Out of Stock</span>
              ) : addedSuccess ? (
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
          )}
        </div>
      </div>
    </div>
  );
};
