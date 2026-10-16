'use client';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setSeoConfig } from '../../store/seoSlice';
import { useFormReduxSync } from '../../hooks/useFormReduxSync';
import { useSeoQuery, useUpdateSeoMutation } from '../../services/api';
import { SeoConfig } from '../../types';
import { setNotification, NotificationType } from '../../store/adminSlice';
import { Search, Globe, Share2, Code, Save, Eye, CheckCircle2, ShieldAlert } from 'lucide-react';
import { siteConfig } from '../../config/site';

export const SeoManager: React.FC = () => {
  const dispatch = useDispatch();
  const activeSeo = useSelector((state: RootState) => state.seo);
  const { data: serverSeo } = useSeoQuery();
  const updateSeoMutation = useUpdateSeoMutation();

  const { register, handleSubmit, reset, watch, formState } = useForm<SeoConfig>({
    mode: 'onChange',
    defaultValues: activeSeo
  });

  useFormReduxSync('seo-manager-form', formState);

  useEffect(() => {
    if (serverSeo) {
      reset(serverSeo);
      dispatch(setSeoConfig(serverSeo));
    }
  }, [serverSeo, reset, dispatch]);

  const watchedTitle = watch('siteTitle') || activeSeo.siteTitle;
  const watchedDesc = watch('siteDescription') || activeSeo.siteDescription;
  const watchedOgImage = watch('ogImageUrl') || activeSeo.ogImageUrl;
  const watchedCanonical = watch('canonicalUrl') || activeSeo.canonicalUrl;

  const onSubmit = (data: SeoConfig) => {
    updateSeoMutation.mutate(data, {
      onSuccess: (updated) => {
        dispatch(setSeoConfig(updated));
        dispatch(
          setNotification({
            message: '🎉 SEO metadata updated successfully & live injected into DOM head!',
            type: NotificationType.Success
          })
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-50">Admin Panel SEO & Meta Tags Handle</h1>
          <p className="text-neutral-400 text-xs mt-0.5">
            Configure global site titles, meta descriptions, OpenGraph social share cards, and JSON-LD schema.
          </p>
        </div>

        <span className="text-xs bg-primary-950 text-primary-400 border border-primary-800 px-3 py-1 rounded-full font-mono font-bold">
          Live Head Sync Active
        </span>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Form: Metadata Control */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-300 font-bold mb-1">
                Site Title (`&lt;title&gt;` & `og:title`) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                {...register('siteTitle', {
                  required: 'Site Title is required for SEO',
                  minLength: { value: 10, message: 'Title should be at least 10 characters' }
                })}
                className={`w-full bg-neutral-950 text-neutral-100 border rounded-xl px-3 py-2 text-xs focus:outline-none ${
                  formState.errors.siteTitle ? 'border-rose-500' : 'border-neutral-700'
                }`}
              />
              {formState.errors.siteTitle && (
                <span className="text-[11px] text-rose-400 block mt-0.5 font-medium">
                  {formState.errors.siteTitle.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-neutral-300 font-bold mb-1">
                Meta Description (`meta description` & `og:description`) <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                {...register('siteDescription', {
                  required: 'Meta description required',
                  maxLength: { value: 160, message: 'Recommended under 160 characters' }
                })}
                className={`w-full bg-neutral-950 text-neutral-100 border rounded-xl px-3 py-2 text-xs focus:outline-none ${
                  formState.errors.siteDescription ? 'border-rose-500' : 'border-neutral-700'
                }`}
              ></textarea>
              <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                <span>{formState.errors.siteDescription ? formState.errors.siteDescription.message : 'Optimal: 120-160 characters'}</span>
                <span>{watchedDesc?.length || 0} / 160</span>
              </div>
            </div>

            <div>
              <label className="block text-neutral-300 font-bold mb-1">Target Search Keywords</label>
              <input
                type="text"
                {...register('keywords')}
                placeholder="bamboo homes, prefab cabins, bamboo flooring, eco villa"
                className="w-full bg-neutral-950 text-neutral-100 border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 font-bold mb-1">OpenGraph Image URL</label>
                <input
                  type="text"
                  {...register('ogImageUrl')}
                  className="w-full bg-neutral-950 text-neutral-100 border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-bold mb-1">Twitter / X Handle</label>
                <input
                  type="text"
                  {...register('twitterHandle')}
                  className="w-full bg-neutral-950 text-neutral-100 border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-300 font-bold mb-1">Canonical URL</label>
              <input
                type="text"
                {...register('canonicalUrl')}
                className="w-full bg-neutral-950 text-neutral-100 border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-bold mb-1">Schema.org Structured Data (JSON-LD)</label>
              <textarea
                rows={4}
                {...register('jsonLdSchema')}
                className="w-full bg-neutral-950 text-primary-400 font-mono text-[11px] border border-neutral-700 rounded-xl p-3 focus:outline-none"
              ></textarea>
            </div>

            {!formState.isValid && formState.isSubmitted && (
              <div className="bg-rose-950/60 border border-rose-800 text-rose-200 p-3 rounded-xl text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>SEO form errors logged to Redux store. Please review fields.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={updateSeoMutation.isPending}
              className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow"
            >
              <Save className="w-4 h-4" />
              <span>{updateSeoMutation.isPending ? 'Saving SEO Config...' : 'Save & Inject Meta Tags'}</span>
            </button>
          </form>
        </div>

        {/* Right Live Previews */}
        <div className="lg:col-span-5 space-y-6">
          {/* Google Search Snippet Card */}
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-4 h-4 text-primary-400" />
              <span>Google Search Result Snippet</span>
            </h3>

            <div className="bg-white p-4 rounded-xl space-y-1 shadow text-slate-900 font-sans">
              <div className="text-[11px] text-slate-600 flex items-center gap-1 truncate">
                <span>{watchedCanonical || siteConfig.siteUrl}</span>
                <span>›</span>
              </div>
              <div className="text-blue-700 font-semibold text-base hover:underline cursor-pointer leading-tight truncate">
                {watchedTitle}
              </div>
              <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {watchedDesc}
              </div>
            </div>
          </div>

          {/* Social OpenGraph Share Card */}
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-primary-400" />
              <span>Social OpenGraph Card Preview</span>
            </h3>

            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow">
              <div className="aspect-16/9 bg-neutral-900 overflow-hidden">
                <img
                  src={watchedOgImage}
                  alt="OG Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase font-mono block">
                  {siteConfig.siteUrl.replace(/^https?:\/\//, '')}
                </span>
                <h4 className="text-xs font-bold text-neutral-100 truncate">{watchedTitle}</h4>
                <p className="text-[11px] text-neutral-400 line-clamp-2">{watchedDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
