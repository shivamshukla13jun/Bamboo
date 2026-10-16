'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { useFormReduxSync } from '../../hooks/useFormReduxSync';
import {
  useProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUploadFileMutation
} from '../../services/api';
import { Product, ProductVariant, ReferenceCheckResult } from '../../types';
import { formatPrice } from '../../utils/formatters';
import { setNotification, NotificationType } from '../../store/adminSlice';
import { Plus, Search, Edit2, Trash2, X, Upload, HardDrive, ShieldAlert, Check, Layers } from 'lucide-react';
import { ReferenceWarningModal } from './ReferenceWarningModal';

interface ProductFormInputs {
  name: string;
  categoryId: string;
  speciesId: string;
  treatmentId: string;
  price: number;
  originalPrice?: number;
  stock: number;
  description: string;
  dimensions: string;
  seoTitle: string;
  seoDescription: string;
}

export const ProductsManager: React.FC = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  // Variants state for active modal form
  const [variantsList, setVariantsList] = useState<Partial<ProductVariant>[]>([]);
  const [newVariantSku, setNewVariantSku] = useState('');
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantPrice, setNewVariantPrice] = useState(100);
  const [newVariantStock, setNewVariantStock] = useState(10);

  // Reference warning modal state
  const [refCheckResult, setRefCheckResult] = useState<ReferenceCheckResult | null>(null);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);

  // Fetch dynamic Master data
  const { data: masters } = useQuery({
    queryKey: ['masters'],
    queryFn: async () => {
      const res = await fetch('/api/masters');
      if (!res.ok) throw new Error('Failed to fetch masters');
      return res.json();
    }
  });

  const categories = masters?.categories || [];
  const speciesList = masters?.species || [];
  const treatmentList = masters?.treatments || [];

  const { data: products = [], isLoading, refetch } = useProductsQuery({
    search: searchTerm,
    category: categoryFilter
  });

  const createProductMutation = useCreateProductMutation();
  const updateProductMutation = useUpdateProductMutation();
  const uploadFileMutation = useUploadFileMutation();

  const { register, handleSubmit, reset, formState } = useForm<ProductFormInputs>({
    mode: 'onChange'
  });

  useFormReduxSync('product-admin-form', formState);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setUploadedImageUrl('');
    setVariantsList([
      { id: `var-new-1`, sku: 'VAR-STD', name: 'Standard Edition', price: 100, stock: 10, isDefault: true }
    ]);
    reset({
      name: '',
      categoryId: categories[0]?.id || 'cat-homes',
      speciesId: speciesList[0]?.id || 'spec-petung',
      treatmentId: treatmentList[0]?.id || 'treat-boron',
      price: 100,
      stock: 10,
      description: '',
      dimensions: '',
      seoTitle: '',
      seoDescription: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setUploadedImageUrl(prod.images[0] || '');
    setVariantsList(prod.variants || []);
    reset({
      name: prod.name,
      categoryId: prod.categoryId,
      speciesId: prod.speciesId || speciesList[0]?.id || '',
      treatmentId: prod.treatmentId || treatmentList[0]?.id || '',
      price: prod.price,
      originalPrice: prod.originalPrice,
      stock: prod.stock,
      description: prod.description,
      dimensions: prod.dimensions || '',
      seoTitle: prod.seoTitle || '',
      seoDescription: prod.seoDescription || ''
    });
    setIsModalOpen(true);
  };

  const handleAddVariant = () => {
    if (!newVariantSku || !newVariantName) {
      dispatch(setNotification({ message: 'Please provide SKU and Variant Name', type: NotificationType.Info }));
      return;
    }
    setVariantsList(prev => [
      ...prev,
      {
        id: `var-${Date.now()}`,
        sku: newVariantSku.toUpperCase(),
        name: newVariantName,
        price: newVariantPrice,
        stock: newVariantStock,
        isDefault: prev.length === 0
      }
    ]);
    setNewVariantSku('');
    setNewVariantName('');
    setNewVariantPrice(100);
    setNewVariantStock(10);
  };

  const handleRemoveVariant = (idx: number) => {
    setVariantsList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFileMutation.mutate(
        { file, folder: 'products' },
        {
          onSuccess: (data) => {
            setUploadedImageUrl(data.url);
            dispatch(
              setNotification({
                message: 'Image uploaded successfully!',
                type: NotificationType.Success
              })
            );
          }
        }
      );
    }
  };

  const onSubmit = (data: ProductFormInputs) => {
    const selectedCat = categories.find((c: any) => c.id === data.categoryId);
    const selectedSpec = speciesList.find((s: any) => s.id === data.speciesId);
    const selectedTreat = treatmentList.find((t: any) => t.id === data.treatmentId);

    const defaultImg =
      uploadedImageUrl ||
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80';

    const payload = {
      ...data,
      categoryName: selectedCat?.name || 'General',
      speciesName: selectedSpec?.name || '',
      treatmentName: selectedTreat?.name || '',
      images: [defaultImg],
      variants: variantsList as ProductVariant[],
      isCustomHome: selectedCat?.slug === 'homes'
    };

    if (editingProduct) {
      updateProductMutation.mutate(
        { id: editingProduct.id, data: payload },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            dispatch(setNotification({ message: 'Product & Variants updated!', type: NotificationType.Success }));
          }
        }
      );
    } else {
      createProductMutation.mutate(payload, {
        onSuccess: () => {
          setIsModalOpen(false);
          dispatch(setNotification({ message: 'Product & Variants created!', type: NotificationType.Success }));
        }
      });
    }
  };

  const handleDeleteWithCheck = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.status === 409) {
        // Active references found!
        setRefCheckResult(data as ReferenceCheckResult);
        setIsWarningModalOpen(true);
      } else if (res.ok) {
        refetch();
        dispatch(setNotification({ message: 'Product deleted successfully!', type: NotificationType.Info }));
      } else {
        dispatch(setNotification({ message: data.message || 'Delete failed', type: NotificationType.Error }));
      }
    } catch (err: any) {
      dispatch(setNotification({ message: err.message, type: NotificationType.Error }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-50">Products & Variant Builder</h1>
          <p className="text-neutral-400 text-xs mt-0.5">
            Every product requires at least one variant. Stock aggregates across all variant SKUs.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product with Variants</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search catalog by name, species, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-950 text-neutral-100 placeholder-neutral-500 text-xs pl-9 pr-3 py-2 rounded-xl border border-neutral-800 focus:outline-none focus:border-primary-500"
          />
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-neutral-950 text-neutral-100 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
        >
          <option value="all">All Master Categories</option>
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Data Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950 text-neutral-400 uppercase tracking-wider text-[10px] font-bold border-b border-neutral-800">
              <tr>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Bamboo Species</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Variants & Stock</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500 font-mono">
                    Loading inventory catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500 font-mono">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt=""
                          className="w-10 h-10 object-cover rounded-lg bg-neutral-950 border border-neutral-800"
                        />
                        <div>
                          <span className="font-bold text-neutral-100 block max-w-xs truncate">{p.name}</span>
                          <span className="text-[10px] text-neutral-500 font-mono">{p.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="bg-neutral-950 text-primary-400 text-[10px] font-bold px-2 py-0.5 rounded border border-primary-900">
                        {p.categoryName || p.categoryId}
                      </span>
                    </td>
                    <td className="p-3.5 text-neutral-300 font-medium">
                      {p.speciesName || '—'}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-accent-400">
                      ${p.price.toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <div className="space-y-1">
                        <span className="inline-flex items-center space-x-1 font-mono text-[11px] font-bold text-primary-400">
                          <Layers className="w-3 h-3" />
                          <span>{p.variants?.length || 0} Variants</span>
                        </span>
                        <span className="block text-[10px] text-neutral-400">Total Stock: {p.stock} units</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white"
                          title="Edit Product & Variants"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteWithCheck(p.id)}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-rose-900/60 text-neutral-300 hover:text-rose-400"
                          title="Delete Product (Checks References)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product & Variant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-700 rounded-3xl max-w-3xl w-full p-6 sm:p-8 text-neutral-100 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black text-neutral-50 mb-6">
              {editingProduct ? 'Edit Product & Variants' : 'Create New Product with Variants'}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
              {/* Name & Dynamic Masters Selection */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Product Title *</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Title is required' })}
                    className="w-full bg-neutral-950 text-neutral-100 border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Category Master *</label>
                  <select
                    {...register('categoryId')}
                    className="w-full bg-neutral-950 text-neutral-100 border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Species & Treatment Masters */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Bamboo Species Master</label>
                  <select
                    {...register('speciesId')}
                    className="w-full bg-neutral-950 text-neutral-100 border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    {speciesList.map((spec: any) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.name} ({spec.scientificName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Treatment Method Master</label>
                  <select
                    {...register('treatmentId')}
                    className="w-full bg-neutral-950 text-neutral-100 border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    {treatmentList.map((treat: any) => (
                      <option key={treat.id} value={treat.id}>
                        {treat.name} ({treat.lifespanYears} Yrs)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Base Price & Dimensions */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Base Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('price', { valueAsNumber: true })}
                    className="w-full bg-neutral-950 text-neutral-100 border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Dimensions / Size</label>
                  <input
                    type="text"
                    {...register('dimensions')}
                    placeholder="e.g. 2,400 sq.ft or 12ft x 4.5in"
                    className="w-full bg-neutral-950 text-neutral-100 border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Product Variants Builder */}
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
                <div className="flex justify-between items-center text-[11px] font-bold text-accent-400 uppercase tracking-wider">
                  <span>Product Variants ({variantsList.length})</span>
                  <Layers className="w-4 h-4 text-accent-400" />
                </div>

                {/* Variants List */}
                <div className="space-y-2">
                  {variantsList.map((v, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-neutral-900 rounded-xl border border-neutral-800 text-xs">
                      <div>
                        <span className="font-mono font-bold text-primary-400">{v.sku}</span>
                        <span className="text-neutral-200 ml-2 font-medium">{v.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-neutral-300">${v.price}</span>
                        <span className="bg-neutral-800 px-2 py-0.5 rounded font-mono text-[10px] text-neutral-300">Stock: {v.stock}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Variant Sub-Form */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-800">
                  <input
                    type="text"
                    placeholder="SKU (e.g. SK-2400)"
                    value={newVariantSku}
                    onChange={e => setNewVariantSku(e.target.value)}
                    className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100"
                  />
                  <input
                    type="text"
                    placeholder="Variant Name"
                    value={newVariantName}
                    onChange={e => setNewVariantName(e.target.value)}
                    className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100"
                  />
                  <input
                    type="number"
                    placeholder="Price ($)"
                    value={newVariantPrice}
                    onChange={e => setNewVariantPrice(parseFloat(e.target.value) || 0)}
                    className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 font-mono"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Stock"
                      value={newVariantStock}
                      onChange={e => setNewVariantStock(parseInt(e.target.value) || 0)}
                      className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-100 font-mono w-full"
                    />
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="px-3 py-1.5 bg-accent-600 hover:bg-accent-500 text-neutral-950 font-bold rounded-lg text-xs shrink-0"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2">
                <div className="flex justify-between items-center text-[11px] text-neutral-400 font-bold uppercase">
                  <span>Product Image Upload</span>
                  <HardDrive className="w-3.5 h-3.5 text-primary-400" />
                </div>
                <div className="flex gap-3 items-center">
                  <label className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl border border-neutral-700 cursor-pointer flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5 text-primary-400" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  {uploadedImageUrl && (
                    <span className="text-primary-400 text-xs font-mono truncate max-w-xs">
                      ✓ Uploaded: {uploadedImageUrl.substring(0, 35)}...
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  {...register('description')}
                  className="w-full bg-neutral-950 text-neutral-100 border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                ></textarea>
              </div>

              {/* Submit CTA */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  className="px-6 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Product & Variants</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reference Warning Modal */}
      <ReferenceWarningModal
        isOpen={isWarningModalOpen}
        onClose={() => setIsWarningModalOpen(false)}
        result={refCheckResult}
      />
    </div>
  );
};
