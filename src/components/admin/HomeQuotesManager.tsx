'use client';
import React from 'react';
import { useHomeQuotesQuery } from '../../services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Home, Phone, Mail } from 'lucide-react';
import { HomeQuote, QuoteStatus } from '../../types';

export const HomeQuotesManager: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: quotes = [], isLoading } = useHomeQuotesQuery();

  const updateQuoteMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: QuoteStatus }) => {
      const res = await fetch(`/api/home-quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update quote');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeQuotes'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-50">Bamboo Home Architectural Inquiries</h1>
          <p className="text-neutral-400 text-xs mt-0.5">
            Client custom eco-villa blueprint configurations & price quote leads.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-xl text-xs font-mono text-primary-400 font-bold">
          Total Inquiries: {quotes.length}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-neutral-500 font-mono">Loading bamboo home quotes...</div>
        ) : quotes.length === 0 ? (
          <div className="p-8 bg-neutral-900 rounded-2xl border border-neutral-800 text-center text-neutral-400 text-xs">
            No custom bamboo home requests submitted yet. Use the customer home customizer to generate one!
          </div>
        ) : (
          quotes.map((quote) => (
            <div
              key={quote.id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-sm hover:border-primary-700/60 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-primary-400" />
                    <h3 className="text-base font-bold text-neutral-50">{quote.clientName}</h3>
                    <span className="text-[10px] font-mono bg-neutral-950 px-2 py-0.5 rounded text-neutral-400 border border-neutral-800">
                      ID: {quote.id}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-neutral-500" />
                      {quote.clientEmail}
                    </span>
                    {quote.clientPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-neutral-500" />
                        {quote.clientPhone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-neutral-400 block">Estimated Blueprint Quote</span>
                    <span className="text-xl font-black text-accent-400 font-mono">
                      ${(quote.estimatedPrice || 0).toLocaleString()}
                    </span>
                  </div>

                  <select
                    value={quote.status || QuoteStatus.QuoteRequested}
                    onChange={(e) =>
                      updateQuoteMutation.mutate({ id: quote.id!, status: e.target.value as QuoteStatus })
                    }
                    className="bg-neutral-950 text-neutral-100 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none cursor-pointer font-bold capitalize"
                  >
                    {Object.values(QuoteStatus).map((status) => (
                      <option key={status} value={status}>
                        {status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                  <span className="text-neutral-500 text-[10px] block uppercase font-bold">Living Area</span>
                  <span className="font-bold text-neutral-200">{quote.floorAreaSqFt} sq. ft ({quote.stories} story)</span>
                </div>
                <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                  <span className="text-neutral-500 text-[10px] block uppercase font-bold">Bamboo Species</span>
                  <span className="font-bold text-primary-400 uppercase">{quote.speciesName || quote.speciesId}</span>
                </div>
                <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                  <span className="text-neutral-500 text-[10px] block uppercase font-bold">Roof Architecture</span>
                  <span className="font-bold text-neutral-200 capitalize">{quote.roofStyleName || quote.roofStyleId}</span>
                </div>
                <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                  <span className="text-neutral-500 text-[10px] block uppercase font-bold">Off-Grid Solar</span>
                  <span className="font-bold text-neutral-200">{quote.offGridSolar ? 'Included (10kW)' : 'Standard Grid'}</span>
                </div>
              </div>

              {quote.notes && (
                <div className="text-xs text-neutral-300 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <strong className="text-neutral-400 block mb-0.5 text-[11px]">Client Project Notes:</strong>
                  {quote.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
