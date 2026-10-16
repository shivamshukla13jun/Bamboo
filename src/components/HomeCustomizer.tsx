'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { useFormReduxSync } from '../hooks/useFormReduxSync';
import { RootState } from '../store';
import { useCreateHomeQuoteMutation } from '../services/api';
import { HomeQuote } from '../types';
import { setNotification, NotificationType } from '../store/adminSlice';
import { Home, Calculator, ArrowRight, ShieldAlert } from 'lucide-react';
import { siteConfig } from '../config/site';
import { formatPrice } from '../utils/formatters';

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

export const HomeCustomizer: React.FC = () => {
  const dispatch = useDispatch();
  const createQuoteMutation = useCreateHomeQuoteMutation();
  const { currency, currencyRates } = useSelector((state: RootState) => state.cart);
  const cfg = siteConfig.customizer;

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
    setValue,
    formState
  } = useForm<CustomizerInputs>({
    mode: 'onChange',
    defaultValues: {
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      homeTypeId: '',
      speciesId: '',
      floorAreaSqFt: cfg.defaultArea,
      stories: cfg.defaultStories,
      roofStyleId: '',
      offGridSolar: true,
      interiorFinish: '',
      notes: ''
    }
  });

  useFormReduxSync('home-estimator', formState);

  const watchHomeTypeId = watch('homeTypeId');
  const watchSpeciesId = watch('speciesId');
  const watchRoofStyleId = watch('roofStyleId');
  const watchArea = watch('floorAreaSqFt') || cfg.defaultArea;
  const watchStories = watch('stories') || 1;
  const watchSolar = watch('offGridSolar');

  // Select the first available master once data loads (no hardcoded ids)
  useEffect(() => {
    if (!watchHomeTypeId && homeTypes.length > 0) setValue('homeTypeId', homeTypes[0].id);
    if (!watchSpeciesId && speciesList.length > 0) setValue('speciesId', speciesList[0].id);
    if (!watchRoofStyleId && roofStyles.length > 0) setValue('roofStyleId', roofStyles[0].id);
  }, [homeTypes, speciesList, roofStyles]);

  const calculatePrice = () => {
    const selectedHomeType = homeTypes.find((h: any) => h.id === watchHomeTypeId || h.code === watchHomeTypeId);
    const selectedRoof = roofStyles.find((r: any) => r.id === watchRoofStyleId);

    const basePerSqFt = selectedHomeType?.basePricePerSqFt || 0;
    const roofMultiplier = selectedRoof?.priceMultiplier || 1.0;

    let subtotal = watchArea * basePerSqFt * roofMultiplier;
    if (watchStories > 1) subtotal += (watchStories - 1) * cfg.extraStoryCost;
    if (watchSolar) subtotal += cfg.solarAddonCost;

    return Math.round(subtotal);
  };

  const estimatedPrice = calculatePrice();
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const onSubmit = (data: CustomizerInputs) => {
    const selectedHomeType = homeTypes.find((h: any) => h.id === data.homeTypeId);
    const selectedSpecies = speciesList.find((s: any) => s.id === data.speciesId);
    const selectedRoof = roofStyles.find((r: any) => r.id === data.roofStyleId);

    const quotePayload: Partial<HomeQuote> = {
      ...data,
      homeTypeName: selectedHomeType?.name || '',
      speciesName: selectedSpecies?.name || '',
      roofStyleName: selectedRoof?.name || '',
      estimatedPrice
    };

    createQuoteMutation.mutate(quotePayload, {
      onSuccess: () => {
        setSubmittedSuccess(true);
        dispatch(
          setNotification({
            message: '🎉 Home quote request received! Our team will contact you shortly.',
            type: NotificationType.Success
          })
        );
      }
    });
  };

  return (
    <section id="home-builder" className="my-12 bg-neutral-900 border border-primary-900/60 rounded-3xl p-6 sm:p-10 text-neutral-100 shadow-2xl relative overflow-hidden">
      {/* Visual Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-950 text-primary-400 border border-primary-800 text-xs font-semibold">
            <Calculator className="w-3.5 h-3.5" />
            <span>{cfg.badge}</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-50 mt-2">
            {cfg.title}
          </h2>
          <p className="text-neutral-300 text-xs sm:text-sm mt-1">
            {cfg.subtitle}
          </p>
        </div>

        <div className="bg-neutral-950 px-5 py-3 rounded-2xl border border-neutral-800 text-right">
          <span className="text-neutral-400 text-xs block font-medium">{cfg.estimatedLabel}</span>
          <span className="text-2xl sm:text-3xl font-black text-accent-400 font-mono">
            {formatPrice(estimatedPrice, currency, currencyRates)}
          </span>
        </div>
      </div>

      {submittedSuccess ? (
        <div className="py-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary-600/20 text-primary-400 border border-primary-500 flex items-center justify-center mx-auto text-3xl">
            ✓
          </div>
          <h3 className="text-2xl font-bold text-primary-300">{cfg.successTitle}</h3>
          <p className="text-neutral-300 max-w-lg mx-auto text-sm">
            {cfg.successText} Estimated building cost: <strong className="text-accent-400">{formatPrice(estimatedPrice, currency, currencyRates)}</strong>.
          </p>
          <button
            onClick={() => setSubmittedSuccess(false)}
            className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs"
          >
            {cfg.successCta}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8">
          {/* Step 1: Structure & Specs */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Home Type Master */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                {cfg.stepLabels.homeType}
              </label>
              <select
                {...register('homeTypeId')}
                className="w-full bg-neutral-950 text-neutral-100 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
              >
                {homeTypes.map((ht: any) => (
                  <option key={ht.id} value={ht.id}>
                    {ht.name} ({formatPrice(ht.basePricePerSqFt, currency, currencyRates)}/sq.ft)
                  </option>
                ))}
              </select>
            </div>

            {/* Species Master */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                {cfg.stepLabels.species}
              </label>
              <select
                {...register('speciesId')}
                className="w-full bg-neutral-950 text-neutral-100 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
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
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                {cfg.stepLabels.roofStyle}
              </label>
              <select
                {...register('roofStyleId')}
                className="w-full bg-neutral-950 text-neutral-100 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
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
          <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                {cfg.areaLabel}
              </label>
              <span className="text-primary-400 font-bold font-mono text-sm">
                {watchArea} sq. ft ({Math.round(watchArea * 0.0929)} m²)
              </span>
            </div>
            <input
              type="range"
              min={cfg.areaMin}
              max={cfg.areaMax}
              step={cfg.areaStep}
              {...register('floorAreaSqFt', { valueAsNumber: true })}
              className="w-full accent-primary-500 cursor-pointer"
            />

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-3 p-3 bg-neutral-900 rounded-xl border border-neutral-800 cursor-pointer hover:border-primary-700/60">
                <input
                  type="checkbox"
                  {...register('offGridSolar')}
                  className="w-4 h-4 accent-primary-500 rounded"
                />
                <div>
                  <span className="text-xs font-bold text-neutral-100 block">{cfg.solarLabel}</span>
                  <span className="text-[11px] text-neutral-400">
                    {cfg.solarDescription} (+{formatPrice(cfg.solarAddonCost, currency, currencyRates)})
                  </span>
                </div>
              </label>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
                  {cfg.storiesLabel}
                </label>
                <select
                  {...register('stories', { valueAsNumber: true })}
                  className="w-full bg-neutral-900 text-neutral-100 border border-neutral-800 rounded-xl px-3 py-2 text-xs"
                >
                  {cfg.storiesOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Details Form */}
          <div className="space-y-4 pt-2 border-t border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">
              {cfg.contactTitle}
            </h3>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-neutral-300 font-medium mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Eleanor Vance"
                  {...register('clientName', { required: 'Full name required' })}
                  className="w-full bg-neutral-950 text-neutral-100 border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-300 font-medium mb-1">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="eleanor@example.com"
                  {...register('clientEmail', { required: 'Email required' })}
                  className="w-full bg-neutral-950 text-neutral-100 border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-300 font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 00000 00000"
                  {...register('clientPhone')}
                  className="w-full bg-neutral-950 text-neutral-100 border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-neutral-300 font-medium mb-1">Project Notes</label>
              <textarea
                rows={2}
                placeholder="Describe building site specifications..."
                {...register('notes')}
                className="w-full bg-neutral-950 text-neutral-100 border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
              ></textarea>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={createQuoteMutation.isPending}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-accent-500 hover:bg-accent-400 text-neutral-950 font-black text-sm flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              <Home className="w-4 h-4" />
              <span>
                {createQuoteMutation.isPending ? cfg.pendingText : cfg.submitText}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </section>
  );
};
