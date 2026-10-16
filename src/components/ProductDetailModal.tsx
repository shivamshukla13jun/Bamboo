import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addToCart } from '../store/cartSlice';
import { Product } from '../types';
import { formatPrice, getCategoryLabel } from '../utils/formatters';
import { X, Star, ShoppingBag, ShieldCheck, Leaf, Trees, Check, Search } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const dispatch = useDispatch();
  const currency = useSelector((state: RootState) => state.cart.currency);
  const currencyRates = useSelector((state: RootState) => state.cart.currencyRates);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity }));
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto text-stone-100 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white z-10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-6 sm:p-8">
          {/* Left Column: Image Gallery */}
          <div className="space-y-3">
            <div className="aspect-4/3 rounded-2xl bg-stone-950 overflow-hidden border border-stone-800">
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
                      activeImageIndex === idx ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-stone-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Admin SEO Snippet Preview Card */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2 mt-4">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                <Search className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Search Engine Preview</span>
              </div>
              <div className="font-sans text-xs space-y-0.5">
                <div className="text-blue-400 text-sm font-medium hover:underline cursor-pointer truncate">
                  {product.seoTitle || product.name}
                </div>
                <div className="text-emerald-500 text-[11px] truncate">
                  https://bamboorise.ai.studio/products/{product.slug}
                </div>
                <div className="text-stone-400 text-[11px] line-clamp-2 leading-relaxed">
                  {product.seoDescription || product.description}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Specs & Actions */}
          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
                {getCategoryLabel(product.category)}
              </span>

              <h2 className="text-2xl font-black text-stone-50 mt-3 leading-snug">
                {product.name}
              </h2>

              <div className="flex items-center gap-3 mt-2 text-xs text-stone-300">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-1 font-bold text-stone-100">{product.rating}</span>
                </div>
                <span>•</span>
                <span>{product.reviewsCount} Verified Eco Reviews</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 flex justify-between items-center">
              <div>
                <span className="text-xs text-stone-400 block">Selling Price</span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {formatPrice(product.price, currency, currencyRates)}
                </span>
              </div>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
                In Stock: {product.stock} units
              </span>
            </div>

            {/* Bamboo Technical Specifications */}
            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span>Material & Eco Specifications</span>
              </h3>

              <div className="grid grid-cols-2 gap-2 text-stone-300">
                {product.bambooSpecies && (
                  <div className="bg-stone-800 p-2.5 rounded-xl border border-stone-700">
                    <span className="text-stone-400 text-[10px] block">Species:</span>
                    <span className="font-bold text-emerald-300">{product.bambooSpecies}</span>
                  </div>
                )}
                {product.treatmentMethod && (
                  <div className="bg-stone-800 p-2.5 rounded-xl border border-stone-700">
                    <span className="text-stone-400 text-[10px] block">Preservation:</span>
                    <span className="font-bold text-stone-200">{product.treatmentMethod}</span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="bg-stone-800 p-2.5 rounded-xl border border-stone-700">
                    <span className="text-stone-400 text-[10px] block">Dimensions:</span>
                    <span className="font-bold text-stone-200">{product.dimensions}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-stone-300 leading-relaxed bg-stone-950/50 p-3 rounded-xl border border-stone-800">
              {product.description}
            </p>

            {/* Action Bar */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-stone-300">Quantity:</span>
                <div className="flex items-center bg-stone-950 border border-stone-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-stone-300 hover:text-white hover:bg-stone-800 transition-colors font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-mono font-bold text-stone-100">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-stone-300 hover:text-white hover:bg-stone-800 transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                  addedSuccess
                    ? 'bg-emerald-500 text-stone-950'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
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
