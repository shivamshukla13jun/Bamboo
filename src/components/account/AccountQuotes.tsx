'use client';
import React from 'react';
import { useAccountSummaryQuery } from '../../services/api';
import { formatPrice } from '../../utils/formatters';
import { Home, CheckCircle2 } from 'lucide-react';
import { QuoteStatus } from '../../types';

const LIFECYCLE: QuoteStatus[] = [
  QuoteStatus.QuoteRequested,
  QuoteStatus.BlueprintDrafted,
  QuoteStatus.Approved,
  QuoteStatus.InConstruction,
  QuoteStatus.Completed
];

const STATUS_LABELS: Record<QuoteStatus, string> = {
  [QuoteStatus.QuoteRequested]: 'Quote Requested',
  [QuoteStatus.BlueprintDrafted]: 'Blueprint Drafted',
  [QuoteStatus.Approved]: 'Approved',
  [QuoteStatus.InConstruction]: 'In Construction',
  [QuoteStatus.OnHold]: 'On Hold',
  [QuoteStatus.Completed]: 'Completed',
  [QuoteStatus.Cancelled]: 'Cancelled'
};

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const AccountQuotes: React.FC = () => {
  const { data, isLoading } = useAccountSummaryQuery();
  const quotes = data?.quotes || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-neutral-50">My Quotes</h1>
        <p className="text-neutral-400 text-xs mt-1">
          Track your custom build requests — status, schedule, and final pricing.
        </p>
      </div>

      {isLoading ? (
        <p className="text-xs text-neutral-500 font-mono">Loading quotes...</p>
      ) : quotes.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-10 text-center text-neutral-400 text-xs">
          No quote requests yet — use the home customizer on the storefront to create one.
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((q) => {
            const idx = LIFECYCLE.indexOf(q.status || QuoteStatus.QuoteRequested);
            return (
              <div key={q.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-primary-400" />
                      <span className="font-bold text-neutral-100 text-sm">{q.homeTypeName || q.homeTypeId}</span>
                    </div>
                    <span className="text-[11px] text-neutral-500">
                      {q.floorAreaSqFt} sq.ft · {q.stories} story · {q.roofStyleName}{q.offGridSolar ? ' + Solar' : ''} · Requested {fmtDate(q.createdAt)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-neutral-400 block">Estimate</span>
                    <span className="font-mono font-black text-accent-400">{formatPrice(q.estimatedPrice || 0)}</span>
                  </div>
                </div>

                {/* Lifecycle stepper */}
                {q.status !== QuoteStatus.Cancelled && q.status !== QuoteStatus.OnHold ? (
                  <div className="flex items-center gap-1">
                    {LIFECYCLE.map((stage, i) => (
                      <React.Fragment key={stage}>
                        <div className={`flex items-center gap-1.5 text-[10px] font-bold ${i <= idx ? 'text-primary-400' : 'text-neutral-600'}`}>
                          {i < idx || q.status === QuoteStatus.Completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <span className={`w-3 h-3 rounded-full border-2 ${i <= idx ? 'border-primary-400 bg-primary-500/30' : 'border-neutral-700'}`} />
                          )}
                          <span className="hidden sm:inline">{STATUS_LABELS[stage]}</span>
                        </div>
                        {i < LIFECYCLE.length - 1 && (
                          <div className={`flex-1 h-px ${i < idx ? 'bg-primary-600' : 'bg-neutral-800'}`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <span className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border inline-block ${
                    q.status === QuoteStatus.Cancelled
                      ? 'text-rose-400 bg-rose-950/60 border-rose-800'
                      : 'text-accent-400 bg-accent-950/60 border-accent-800'
                  }`}>
                    {STATUS_LABELS[q.status]}
                  </span>
                )}

                {/* Schedule + latest event */}
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1">
                    <span className="text-neutral-500 text-[10px] font-bold uppercase block">Schedule</span>
                    <span className="text-neutral-300 block">
                      Started: <strong>{fmtDate(q.startDate)}</strong>
                      {q.estimatedDurationWeeks ? ` · ~${q.estimatedDurationWeeks} weeks` : ''}
                    </span>
                    <span className="text-neutral-300 block">
                      Est. completion: <strong>{fmtDate(q.estimatedCompletionDate)}</strong>
                      {q.completedAt ? ` · Done ${fmtDate(q.completedAt)}` : ''}
                    </span>
                  </div>
                  <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1">
                    <span className="text-neutral-500 text-[10px] font-bold uppercase block">Latest Update</span>
                    {q.statusHistory && q.statusHistory.length > 0 ? (
                      <>
                        <span className="text-primary-300 font-bold block">
                          {STATUS_LABELS[q.statusHistory[q.statusHistory.length - 1].status]}
                        </span>
                        <span className="text-neutral-400 block text-[11px]">
                          {new Date(q.statusHistory[q.statusHistory.length - 1].changedAt).toLocaleString('en-IN')}
                          {q.statusHistory[q.statusHistory.length - 1].note
                            ? ` — ${q.statusHistory[q.statusHistory.length - 1].note}`
                            : ''}
                        </span>
                      </>
                    ) : (
                      <span className="text-neutral-500 block">Awaiting first update</span>
                    )}
                  </div>
                </div>

                {q.finalPrice ? (
                  <div className="text-right text-xs">
                    <span className="text-neutral-400">Final agreed price: </span>
                    <span className="font-mono font-black text-primary-400">{formatPrice(q.finalPrice)}</span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
