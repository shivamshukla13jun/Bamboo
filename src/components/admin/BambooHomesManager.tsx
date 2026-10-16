import React from 'react';
import { useHomeQuotesQuery } from '../../services/api';
import { Home, CheckCircle2, Phone, Mail, FileText, Calendar, DollarSign } from 'lucide-react';

export const BambooHomesManager: React.FC = () => {
  const { data: quotes = [], isLoading } = useHomeQuotesQuery();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-50">Bamboo Home Architectural Inquiries</h1>
          <p className="text-stone-400 text-xs mt-0.5">
            Client custom eco-villa blueprint configurations & price quote leads.
          </p>
        </div>

        <div className="bg-stone-900 border border-stone-800 px-4 py-2 rounded-xl text-xs font-mono text-emerald-400 font-bold">
          Total Inquiries: {quotes.length}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-stone-500 font-mono">Loading bamboo home quotes...</div>
        ) : quotes.length === 0 ? (
          <div className="p-8 bg-stone-900 rounded-2xl border border-stone-800 text-center text-stone-400 text-xs">
            No custom bamboo home requests submitted yet. Use the customer home customizer to generate one!
          </div>
        ) : (
          quotes.map((quote) => (
            <div
              key={quote.id}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 shadow-sm hover:border-emerald-700/60 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-base font-bold text-stone-50">{quote.clientName}</h3>
                    <span className="text-[10px] font-mono bg-stone-950 px-2 py-0.5 rounded text-stone-400 border border-stone-800">
                      ID: {quote.id}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-stone-500" />
                      {quote.clientEmail}
                    </span>
                    {quote.clientPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-stone-500" />
                        {quote.clientPhone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-stone-400 block">Estimated Blueprint Quote</span>
                  <span className="text-xl font-black text-amber-400 font-mono">
                    ${(quote.estimatedPrice || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                  <span className="text-stone-500 text-[10px] block uppercase font-bold">Living Area</span>
                  <span className="font-bold text-stone-200">{quote.floorAreaSqFt} sq. ft ({quote.stories} story)</span>
                </div>
                <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                  <span className="text-stone-500 text-[10px] block uppercase font-bold">Bamboo Species</span>
                  <span className="font-bold text-emerald-400 uppercase">{quote.speciesName || quote.speciesId}</span>
                </div>
                <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                  <span className="text-stone-500 text-[10px] block uppercase font-bold">Roof Architecture</span>
                  <span className="font-bold text-stone-200 capitalize">{quote.roofStyleName || quote.roofStyleId}</span>
                </div>
                <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                  <span className="text-stone-500 text-[10px] block uppercase font-bold">Off-Grid Solar</span>
                  <span className="font-bold text-stone-200">{quote.offGridSolar ? 'Included (10kW)' : 'Standard Grid'}</span>
                </div>
              </div>

              {quote.notes && (
                <div className="text-xs text-stone-300 bg-stone-950 p-3 rounded-xl border border-stone-800">
                  <strong className="text-stone-400 block mb-0.5 text-[11px]">Client Project Notes:</strong>
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
