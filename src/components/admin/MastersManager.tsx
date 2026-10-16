'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Database, Plus, Trash2, Edit2, ShieldAlert, CheckCircle, RefreshCw, AlertTriangle, ChevronRight } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setNotification } from '../../store/adminSlice';
import { ReferenceWarningModal } from './ReferenceWarningModal';
import { ReferenceCheckResult } from '../../types';

type MasterType = 'categories' | 'species' | 'treatments' | 'roof_styles' | 'home_types';

export const MastersManager: React.FC = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [activeMaster, setActiveMaster] = useState<MasterType>('categories');

  // Warning Modal State
  const [refCheckResult, setRefCheckResult] = useState<ReferenceCheckResult | null>(null);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);

  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const { data: masters, isLoading, refetch } = useQuery({
    queryKey: ['masters'],
    queryFn: async () => {
      const res = await fetch('/api/masters');
      if (!res.ok) throw new Error('Failed to fetch masters');
      return res.json();
    }
  });

  const createMasterMutation = useMutation({
    mutationFn: async ({ type, item }: { type: MasterType; item: any }) => {
      const res = await fetch(`/api/masters/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!res.ok) throw new Error('Failed to create master item');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masters'] });
      setIsCreating(false);
      setFormData({});
      dispatch(setNotification({ message: 'Master record created successfully!', type: 'success' }));
    }
  });

  const deleteMasterMutation = useMutation({
    mutationFn: async ({ type, id }: { type: MasterType; id: string }) => {
      const res = await fetch(`/api/masters/${type}/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (res.status === 409) {
        // Conflict - active references found!
        return { isConflict: true, refCheckResult: data as ReferenceCheckResult };
      }
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete master item');
      }
      return { isConflict: false, data };
    },
    onSuccess: (result) => {
      if (result.isConflict && result.refCheckResult) {
        setRefCheckResult(result.refCheckResult);
        setIsWarningModalOpen(true);
      } else {
        queryClient.invalidateQueries({ queryKey: ['masters'] });
        dispatch(setNotification({ message: 'Master record deleted cleanly.', type: 'success' }));
      }
    },
    onError: (err: any) => {
      dispatch(setNotification({ message: err.message, type: 'error' }));
    }
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMasterMutation.mutate({ type: activeMaster, item: formData });
  };

  const listKey =
    activeMaster === 'roof_styles'
      ? 'roofStyles'
      : activeMaster === 'home_types'
      ? 'homeTypes'
      : activeMaster;
  const currentList = masters ? (masters as any)[listKey] || [] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-50 flex items-center space-x-2">
            <Database className="w-7 h-7 text-primary-600" />
            <span>Everything Masters Engine (Dynamic Data)</span>
          </h2>
          <p className="text-sm text-neutral-400">
            Zero hardcoded options. Manage global Bamboo species, treatment methods, categories, roof styles, and home types.
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreating(true);
            setFormData({});
          }}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-700 text-white rounded-xl hover:bg-primary-800 transition shadow-sm font-medium text-sm self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Master Record</span>
        </button>
      </div>

      {/* Master Tabs */}
      <div className="flex border-b border-neutral-800 overflow-x-auto gap-2 scrollbar-none">
        {[
          { key: 'categories', label: 'Categories Master', count: masters?.categories?.length },
          { key: 'species', label: 'Bamboo Species Master', count: masters?.species?.length },
          { key: 'treatments', label: 'Treatment Methods Master', count: masters?.treatments?.length },
          { key: 'roof_styles', label: 'Roof Architecture Master', count: masters?.roofStyles?.length },
          { key: 'home_types', label: 'Home Types Master', count: masters?.homeTypes?.length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveMaster(tab.key as MasterType);
              setIsCreating(false);
            }}
            className={`px-4 py-3 font-semibold text-xs whitespace-nowrap border-b-2 transition flex items-center space-x-2 ${
              activeMaster === tab.key
                ? 'border-accent-500 text-accent-400 bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-100'
            }`}
          >
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-neutral-800 text-neutral-300">
              {tab.count || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Inline Create Form */}
      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="bg-primary-950/60 p-5 rounded-2xl border border-primary-900 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-primary-900">
            <h3 className="font-bold text-primary-300 text-sm uppercase tracking-wider">
              Add New {activeMaster.replace('_', ' ').toUpperCase()} Entry
            </h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs font-semibold text-neutral-400 hover:text-neutral-100"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Name / Title *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl"
                placeholder="Name"
              />
            </div>

            {activeMaster === 'categories' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug || ''}
                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl"
                    placeholder="e.g. homes"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Icon Emoji</label>
                  <input
                    type="text"
                    value={formData.icon || '🌿'}
                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl"
                  />
                </div>
              </>
            )}

            {activeMaster === 'species' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Scientific Name</label>
                  <input
                    type="text"
                    value={formData.scientificName || ''}
                    onChange={e => setFormData({ ...formData, scientificName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Tensile Strength Grade</label>
                  <input
                    type="text"
                    value={formData.tensileGrade || 'Grade A'}
                    onChange={e => setFormData({ ...formData, tensileGrade: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl"
                  />
                </div>
              </>
            )}

            {activeMaster === 'treatments' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Method Type</label>
                  <input
                    type="text"
                    value={formData.methodType || ''}
                    onChange={e => setFormData({ ...formData, methodType: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl"
                    placeholder="e.g. Boron-Borax Salt Dip"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Lifespan (Years)</label>
                  <input
                    type="number"
                    value={formData.lifespanYears || 50}
                    onChange={e => setFormData({ ...formData, lifespanYears: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl"
                    placeholder="e.g. 50"
                  />
                </div>
              </>
            )}

            {activeMaster === 'roof_styles' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Price Multiplier</label>
                <input
                  type="number"
                  step="0.05"
                  value={formData.priceMultiplier || 1.0}
                  onChange={e => setFormData({ ...formData, priceMultiplier: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl"
                />
              </div>
            )}

            {activeMaster === 'home_types' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Code / Identifier</label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl"
                    placeholder="e.g. villa, cabin, dome"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Base Price Per Sq. Ft ($)</label>
                  <input
                    type="number"
                    value={formData.basePricePerSqFt || 50}
                    onChange={e => setFormData({ ...formData, basePricePerSqFt: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl"
                    placeholder="e.g. 55"
                  />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Description</label>
              <textarea
                rows={2}
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl"
                placeholder="Description..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={createMasterMutation.isPending}
              className="px-5 py-2 bg-primary-700 text-white rounded-xl text-xs font-bold hover:bg-primary-800 transition"
            >
              Save Master Item
            </button>
          </div>
        </form>
      )}

      {/* List Table */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-neutral-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary-600" />
            Loading master list...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 text-xs font-semibold uppercase">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Details / Parameters</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Delete Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {currentList.map((item: any) => (
                  <tr key={item.id} className="hover:bg-neutral-950 transition">
                    <td className="py-3 px-4 font-mono text-xs text-neutral-400 font-semibold">
                      {item.id}
                    </td>
                    <td className="py-3 px-4 font-bold text-neutral-50">
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-xs text-neutral-400 font-medium">
                      {item.scientificName && <span className="italic block text-neutral-200">{item.scientificName}</span>}
                      {item.tensileGrade && <span className="text-primary-400 font-semibold block">{item.tensileGrade}</span>}
                      {item.methodType && <span className="text-accent-400 block">Method: {item.methodType}</span>}
                      {item.priceMultiplier && <span>Price x{item.priceMultiplier}</span>}
                      {item.basePricePerSqFt && <span className="text-primary-400 font-bold block">${item.basePricePerSqFt}/sq.ft</span>}
                      {item.lifespanYears && <span>Lifespan: {item.lifespanYears} Yrs</span>}
                      {item.code && <span className="font-mono text-neutral-400 block">code: {item.code}</span>}
                      {item.status && <span className="font-mono text-xs px-2 py-0.5 rounded bg-primary-900/50 text-primary-300 inline-block mt-0.5">{item.status}</span>}
                      {item.slug && <span className="font-mono text-neutral-400 block">slug: {item.slug}</span>}
                    </td>
                    <td className="py-3 px-4 text-xs text-neutral-400 max-w-xs truncate">
                      {item.description || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => deleteMasterMutation.mutate({ type: activeMaster, id: item.id })}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-rose-950/60 text-rose-300 rounded-lg hover:bg-rose-900/60 text-xs font-semibold transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete (With Check)</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Referential Integrity Warning Modal */}
      <ReferenceWarningModal
        isOpen={isWarningModalOpen}
        onClose={() => setIsWarningModalOpen(false)}
        result={refCheckResult}
      />
    </div>
  );
};
