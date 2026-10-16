import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Search, AlertTriangle, CheckCircle, RefreshCw, Save, ArrowUpDown, Filter } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setNotification } from '../../store/adminSlice';

interface InventoryItem {
  productId: string;
  productName: string;
  categoryName: string;
  variantId: string;
  variantName: string;
  sku: string;
  price: number;
  stock: number;
  isLowStock: boolean;
}

export const InventoryManager: React.FC = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out'>('all');
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({});

  const { data: inventory = [], isLoading, refetch } = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await fetch('/api/inventory');
      if (!res.ok) throw new Error('Failed to load inventory');
      return res.json();
    }
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ variantId, stock }: { variantId: string; stock: number }) => {
      const res = await fetch(`/api/inventory/variants/${variantId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Stock update failed');
      }
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setStockEdits(prev => {
        const next = { ...prev };
        delete next[variables.variantId];
        return next;
      });
      dispatch(setNotification({ message: data.message || 'Stock level updated!', type: 'success' }));
    },
    onError: (err: any) => {
      dispatch(setNotification({ message: err.message, type: 'error' }));
    }
  });

  const handleStockChange = (variantId: string, value: number) => {
    setStockEdits(prev => ({
      ...prev,
      [variantId]: Math.max(0, value)
    }));
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.variantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const currentStock = stockEdits[item.variantId] !== undefined ? stockEdits[item.variantId] : item.stock;

    if (filterType === 'low') return currentStock > 0 && currentStock < 10;
    if (filterType === 'out') return currentStock === 0;
    return true;
  });

  const totalSKUs = inventory.length;
  const totalUnits = inventory.reduce((sum, item) => sum + (stockEdits[item.variantId] ?? item.stock), 0);
  const lowStockCount = inventory.filter(item => (stockEdits[item.variantId] ?? item.stock) < 10).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Overview Cards */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 flex items-center space-x-2">
            <Package className="w-7 h-7 text-emerald-600" />
            <span>Dedicated Inventory & Variant Stock Manager</span>
          </h2>
          <p className="text-sm text-stone-500">
            Real-time variant SKU inventory tracking, stock adjustments, and low-stock threshold alerts.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-stone-200 text-stone-700 rounded-xl hover:bg-stone-50 transition shadow-sm font-medium text-sm self-start"
        >
          <RefreshCw className="w-4 h-4 text-emerald-600" />
          <span>Sync Inventory</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Variant SKUs</p>
          <p className="text-2xl font-black text-stone-900">{totalSKUs}</p>
          <p className="text-xs text-stone-400">All registered product variations</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Units Available</p>
          <p className="text-2xl font-black text-emerald-700">{totalUnits.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 font-medium">Aggregated across all warehouses</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Low Stock Warnings</p>
          <p className="text-2xl font-black text-amber-600">{lowStockCount}</p>
          <p className="text-xs text-amber-700 font-medium">Variants with under 10 units remaining</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by SKU, Product or Variant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-stone-400 hidden sm:block" />
          <div className="flex bg-stone-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterType === 'all' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Variants
            </button>
            <button
              onClick={() => setFilterType('low')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterType === 'low' ? 'bg-amber-500 text-white shadow-sm' : 'text-stone-600 hover:text-amber-700'
              }`}
            >
              Low Stock (&lt;10)
            </button>
            <button
              onClick={() => setFilterType('out')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterType === 'out' ? 'bg-rose-500 text-white shadow-sm' : 'text-stone-600 hover:text-rose-700'
              }`}
            >
              Out of Stock
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-stone-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
            <span>Loading inventory database...</span>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <Package className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="font-medium text-stone-700">No variant inventory records match your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 text-xs font-semibold uppercase">
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Variant Details</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Adjust Stock Quantity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredInventory.map(item => {
                  const editedStock = stockEdits[item.variantId] !== undefined ? stockEdits[item.variantId] : item.stock;
                  const isModified = stockEdits[item.variantId] !== undefined && stockEdits[item.variantId] !== item.stock;
                  const isLow = editedStock > 0 && editedStock < 10;
                  const isOut = editedStock === 0;

                  return (
                    <tr key={item.variantId} className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-stone-800">
                        {item.sku}
                      </td>
                      <td className="py-3 px-4 font-medium text-stone-900">
                        {item.productName}
                        <span className="block text-[11px] text-stone-400 font-normal">{item.categoryName}</span>
                      </td>
                      <td className="py-3 px-4 text-stone-700 font-medium">
                        {item.variantName}
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-900">
                        ${item.price.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {isOut ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-rose-100 text-rose-800 rounded-lg text-xs font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Out of Stock</span>
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Low Stock ({editedStock})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>In Stock ({editedStock})</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            value={editedStock}
                            onChange={(e) => handleStockChange(item.variantId, parseInt(e.target.value) || 0)}
                            className={`w-24 px-3 py-1.5 border rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 ${
                              isModified
                                ? 'border-amber-400 bg-amber-50 text-amber-900 focus:ring-amber-500'
                                : 'border-stone-200 bg-white text-stone-900 focus:ring-emerald-500'
                            }`}
                          />
                          {isModified && (
                            <span className="text-[11px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                              Modified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          disabled={!isModified || updateStockMutation.isPending}
                          onClick={() => updateStockMutation.mutate({ variantId: item.variantId, stock: editedStock })}
                          className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            isModified
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          }`}
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Stock</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
