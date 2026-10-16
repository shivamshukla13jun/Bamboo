import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { useFormReduxSync } from '../hooks/useFormReduxSync';
import { useCreateHomeQuoteMutation } from '../services/api';
import { BambooHomeConfig } from '../types';
import { setNotification } from '../store/adminSlice';
import { Home, Calculator, ArrowRight, ShieldAlert } from 'lucide-react';

interface CustomizerInputs {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  homeTypeId: string;
  speciesId: string;
  floorAreaSqFt: number;
  stories: number;
  roofStyleId: string;
  offGridSolar: boolean;
  interiorFinish: string;
  notes: string;
}

export const BambooHomeCustomizer: React.FC = () => {
  const dispatch = useDispatch();
  const createQuoteMutation = useCreateHomeQuoteMutation();

  // Fetch dynamic Masters data
  const { data: masters } = useQuery({
    queryKey: ['masters'],
    queryFn: async () => {
      const res = await fetch('/api/masters');
      if (!res.ok) throw new Error('Failed to fetch masters');
      return res.json();
    }
  });

  const homeTypes = masters?.homeTypes || [];
  const speciesList = masters?.species || [];
  const roofStyles = masters?.roofStyles || [];

  const {
    register,
    handleSubmit,
    watch,
    formState
  } = useForm<CustomizerInputs>({
    mode: 'onChange',
    defaultValues: {
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      homeTypeId: 'ht-villa',
      speciesId: 'spec-petung',
      floorAreaSqFt: 1200,
      stories: 2,
      roofStyleId: 'roof-hyperbolic',
      offGridSolar: true,
      interiorFinish: 'luxury_teak_bamboo',
      notes: ''
    }
  });

  useFormReduxSync('bamboo-home-estimator', formState);

  const watchArea = watch('floorAreaSqFt') || 1200;
  const watchStories = watch('stories') || 1;
  const watchHomeTypeId = watch('homeTypeId');
  const watchSpeciesId = watch('speciesId');
  const watchRoofStyleId = watch('roofStyleId');
  const watchSolar = watch('offGridSolar');

  const calculatePrice = () => {
    const selectedHomeType = homeTypes.find((h: any) => h.id === watchHomeTypeId || h.code === watchHomeTypeId);
    const selectedRoof = roofStyles.find((r: any) => r.id === watchRoofStyleId);

    const basePerSqFt = selectedHomeType?.basePricePerSqFt || 45;
    const roofMultiplier = selectedRoof?.priceMultiplier || 1.0;

    let subtotal = watchArea * basePerSqFt * roofMultiplier;
    if (watchStories > 1) subtotal += (watchStories - 1) * 8500;
    if (watchSolar) subtotal += 12500;

    return Math.round(subtotal);
  };

  const estimatedPrice = calculatePrice();
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const onSubmit = (data: CustomizerInputs) => {
    const selectedHomeType = homeTypes.find((h: any) => h.id === data.homeTypeId);
    const selectedSpecies = speciesList.find((s: any) => s.id === data.speciesId);
    const selectedRoof = roofStyles.find((r: any) => r.id === data.roofStyleId);

    const quotePayload: Partial<BambooHomeConfig> = {
      ...data,
      homeTypeName: selectedHomeType?.name || 'Bamboo Villa',
      speciesName: selectedSpecies?.name || 'Petung Bamboo',
      roofStyleName: selectedRoof?.name || 'Hyperbolic Roof',
      estimatedPrice
    };

    createQuoteMutation.mutate(quotePayload, {
      onSuccess: () => {
        setSubmittedSuccess(true);
        dispatch(
          setNotification({
            message: '🎉 Custom Bamboo Home Quote request received! Our architectural team will contact you.',
            type: 'success'
          })
        );
      }
    });
  };

  return (
    <section id="bamboo-home-builder" className="my-12 bg-stone-900 border border-emerald-900/60 rounded-3xl p-6 sm:p-10 text-stone-100 shadow-2xl relative overflow-hidden">
      {/* Visual Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-semibold">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Eco Architecture Studio</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-50 mt-2">
            Configure Your Custom Bamboo Home
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm mt-1">
            Real-time price estimator & structural blueprint proposal generator (Dynamic Masters Engine).
          </p>
        </div>

        <div className="bg-stone-950 px-5 py-3 rounded-2xl border border-stone-800 text-right">
          <span className="text-stone-400 text-xs block font-medium">Estimated Project Cost</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            ${estimatedPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {submittedSuccess ? (
        <div className="py-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500 flex items-center justify-center mx-auto text-3xl">
            ✓
          </div>
          <h3 className="text-2xl font-bold text-emerald-300">Architectural Quote Request Received!</h3>
          <p className="text-stone-300 max-w-lg mx-auto text-sm">
            Thank you for designing your sustainable bamboo home with Bamboorise. Estimated building cost: <strong className="text-amber-400">${estimatedPrice.toLocaleString()}</strong>.
          </p>
          <button
            onClick={() => setSubmittedSuccess(false)}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
          >
            Configure Another Home
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8">
          {/* Step 1: Structure & Specs */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Home Style Master */}
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                1. Architectural Type Master
              </label>
              <select
                {...register('homeTypeId')}
                className="w-full bg-stone-950 text-stone-100 border border-stone-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              >
                {homeTypes.map((ht: any) => (
                  <option key={ht.id} value={ht.id}>
                    {ht.name} (${ht.basePricePerSqFt}/sq.ft)
                  </option>
                ))}
              </select>
            </div>

            {/* Bamboo Species Master */}
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                2. Bamboo Culm Species Master
              </label>
              <select
                {...register('speciesId')}
                className="w-full bg-stone-950 text-stone-100 border border-stone-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              >
                {speciesList.map((spec: any) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.name} ({spec.scientificName})
                  </option>
                ))}
              </select>
            </div>

            {/* Roof Style Master */}
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
                3. Roof Architecture Master
              </label>
              <select
                {...register('roofStyleId')}
                className="w-full bg-stone-950 text-stone-100 border border-stone-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              >
                {roofStyles.map((roof: any) => (
                  <option key={roof.id} value={roof.id}>
                    {roof.name} (x{roof.priceMultiplier})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Area Slider & Options */}
          <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                Total Interior Living Area
              </label>
              <span className="text-emerald-400 font-bold font-mono text-sm">
                {watchArea} sq. ft ({Math.round(watchArea * 0.0929)} m²)
              </span>
            </div>
            <input
              type="range"
              min="300"
              max="4500"
              step="50"
              {...register('floorAreaSqFt', { valueAsNumber: true })}
              className="w-full accent-emerald-500 cursor-pointer"
            />

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-3 p-3 bg-stone-900 rounded-xl border border-stone-800 cursor-pointer hover:border-emerald-700/60">
                <input
                  type="checkbox"
                  {...register('offGridSolar')}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                <div>
                  <span className="text-xs font-bold text-stone-100 block">Off-Grid Solar & Battery Package</span>
                  <span className="text-[11px] text-stone-400">10kW Solar Arrays + Lithium Storage (+$12,500)</span>
                </div>
              </label>

              <div>
                <label className="block text-[11px] font-bold text-stone-400 uppercase mb-1">
                  Stories & Levels
                </label>
                <select
                  {...register('stories', { valueAsNumber: true })}
                  className="w-full bg-stone-900 text-stone-100 border border-stone-800 rounded-xl px-3 py-2 text-xs"
                >
                  <option value={1}>1 Story (Single Floor)</option>
                  <option value={2}>2 Stories (Mezzanine Loft)</option>
                  <option value={3}>3 Stories (Grand Pavilion)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Details Form */}
          <div className="space-y-4 pt-2 border-t border-stone-800">
            <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
              Client Contact & Location Details
            </h3>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-stone-300 font-medium mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Eleanor Vance"
                  {...register('clientName', { required: 'Full name required' })}
                  className="w-full bg-stone-950 text-stone-100 border border-stone-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 font-medium mb-1">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="eleanor@example.com"
                  {...register('clientEmail', { required: 'Email required' })}
                  className="w-full bg-stone-950 text-stone-100 border border-stone-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  {...register('clientPhone')}
                  className="w-full bg-stone-950 text-stone-100 border border-stone-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-stone-300 font-medium mb-1">Project Notes</label>
              <textarea
                rows={2}
                placeholder="Describe building site specifications..."
                {...register('notes')}
                className="w-full bg-stone-950 text-stone-100 border border-stone-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
              ></textarea>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={createQuoteMutation.isPending}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              <Home className="w-4 h-4" />
              <span>
                {createQuoteMutation.isPending ? 'Calculating...' : 'Submit Bamboo Home Quote Request'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </section>
  );
};
