'use client';
import React, { useState } from 'react';
import { useHomeQuotesQuery } from '../../services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { Home, Phone, Mail, ChevronDown, ChevronUp, History, CalendarClock, Save, CheckCircle2 } from 'lucide-react';
import { HomeQuote, QuoteStatus } from '../../types';
import { formatPrice } from '../../utils/formatters';
import { setNotification, NotificationType } from '../../store/adminSlice';

/** Linear happy-path lifecycle for the progress stepper */
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

const daysBetween = (a?: string, b?: string) => {
  if (!a) return null;
  const ms = new Date(b || Date.now()).getTime() - new Date(a).getTime();
  return Math.max(0, Math.round(ms / 86400000));
};

export const HomeQuotesManager: React.FC = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { data: quotes = [], isLoading } = useHomeQuotesQuery();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { startDate: string; estimatedDurationWeeks: string; estimatedCompletionDate: string; finalPrice: string; adminNotes: string; statusNote: string }>>({});

  const updateQuoteMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, any> }) => {
      const res = await fetch(`/api/home-quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update quote');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeQuotes'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      dispatch(setNotification({ message: 'Quote project updated!', type: NotificationType.Success }));
    },
    onError: (err: any) => {
      dispatch(setNotification({ message: err.message || 'Update failed', type: NotificationType.Error }));
    }
  });

  const draftFor = (q: HomeQuote) =>
    drafts[q.id!] ?? {
      startDate: q.startDate?.slice(0, 10) || '',
      estimatedDurationWeeks: q.estimatedDurationWeeks?.toString() || '',
      estimatedCompletionDate: q.estimatedCompletionDate?.slice(0, 10) || '',
      finalPrice: q.finalPrice?.toString() || '',
      adminNotes: q.adminNotes || '',
      statusNote: ''
    };

  const setDraft = (qid: string, patch: Partial<ReturnType<typeof draftFor>>) =>
    setDrafts((prev) => ({
      ...prev,
      [qid]: {
        ...(prev[qid] ?? {
          startDate: '', estimatedDurationWeeks: '', estimatedCompletionDate: '',
          finalPrice: '', adminNotes: '', statusNote: ''
        }),
        ...patch
      }
    }));

  const handleStatusChange = (q: HomeQuote, status: QuoteStatus) => {
    const note = draftFor(q).statusNote.trim();
    updateQuoteMutation.mutate({
      id: q.id!,
      payload: { status, ...(note ? { statusNote: note } : {}) }
    });
  };

  const handleSaveProject = (q: HomeQuote) => {
    const d = draftFor(q);
    updateQuoteMutation.mutate({
      id: q.id!,
      payload: {
        ...(d.startDate ? { startDate: d.startDate } : {}),
        ...(d.estimatedDurationWeeks ? { estimatedDurationWeeks: Number(d.estimatedDurationWeeks) } : {}),
        ...(d.estimatedCompletionDate ? { estimatedCompletionDate: d.estimatedCompletionDate } : {}),
        ...(d.finalPrice ? { finalPrice: Number(d.finalPrice) } : {}),
        adminNotes: d.adminNotes
      }
    });
  };

  const stageIndex = (status?: QuoteStatus) =>
    status ? LIFECYCLE.indexOf(status) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-50">Custom Build Quotes & Projects</h1>
          <p className="text-neutral-400 text-xs mt-0.5">
            Client quote leads tracked end-to-end — status timeline, schedule, and final pricing.
          </p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-xl text-xs font-mono text-primary-400 font-bold">
          Total Inquiries: {quotes.length}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-neutral-500 font-mono">Loading quotes...</div>
        ) : quotes.length === 0 ? (
          <div className="p-8 bg-neutral-900 rounded-2xl border border-neutral-800 text-center text-neutral-400 text-xs">
            No quote requests submitted yet. Use the storefront customizer to generate one.
          </div>
        ) : (
          quotes.map((quote) => {
            const expanded = expandedId === quote.id;
            const d = draftFor(quote);
            const idx = stageIndex(quote.status);
            const elapsedDays = daysBetween(quote.startDate, quote.completedAt);
            return (
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
                      {(quote.status === QuoteStatus.OnHold || quote.status === QuoteStatus.Cancelled) && (
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          quote.status === QuoteStatus.Cancelled
                            ? 'text-rose-400 bg-rose-950/60 border-rose-800'
                            : 'text-accent-400 bg-accent-950/60 border-accent-800'
                        }`}>
                          {STATUS_LABELS[quote.status]}
                        </span>
                      )}
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
                      <span className="text-neutral-500">Submitted {fmtDate(quote.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-neutral-400 block">Estimated Quote</span>
                      <span className="text-xl font-black text-accent-400 font-mono">
                        {formatPrice(quote.estimatedPrice || 0)}
                      </span>
                    </div>
                    <select
                      value={quote.status || QuoteStatus.QuoteRequested}
                      onChange={(e) => handleStatusChange(quote, e.target.value as QuoteStatus)}
                      className="bg-neutral-950 text-neutral-100 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none cursor-pointer font-bold capitalize"
                    >
                      {Object.values(QuoteStatus).map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setExpandedId(expanded ? null : quote.id!)}
                      className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
                      title="Project details"
                    >
                      {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Lifecycle Progress Stepper */}
                {quote.status !== QuoteStatus.Cancelled && quote.status !== QuoteStatus.OnHold && (
                  <div className="flex items-center gap-1">
                    {LIFECYCLE.map((stage, i) => (
                      <React.Fragment key={stage}>
                        <div className={`flex items-center gap-1.5 text-[10px] font-bold ${i <= idx ? 'text-primary-400' : 'text-neutral-600'}`}>
                          {i < idx || quote.status === QuoteStatus.Completed ? (
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
                )}

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] block uppercase font-bold">Living Area</span>
                    <span className="font-bold text-neutral-200">{quote.floorAreaSqFt} sq. ft ({quote.stories} story)</span>
                  </div>
                  <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] block uppercase font-bold">Home Type</span>
                    <span className="font-bold text-neutral-200">{quote.homeTypeName || quote.homeTypeId}</span>
                  </div>
                  <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] block uppercase font-bold">Material Species</span>
                    <span className="font-bold text-primary-400 uppercase">{quote.speciesName || quote.speciesId}</span>
                  </div>
                  <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] block uppercase font-bold">Roof / Solar</span>
                    <span className="font-bold text-neutral-200">
                      {quote.roofStyleName || quote.roofStyleId} {quote.offGridSolar ? '+ Solar' : ''}
                    </span>
                  </div>
                </div>

                {quote.notes && (
                  <div className="text-xs text-neutral-300 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                    <strong className="text-neutral-400 block mb-0.5 text-[11px]">Client Project Notes:</strong>
                    {quote.notes}
                  </div>
                )}

                {/* Expanded Project Panel */}
                {expanded && (
                  <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
                    {/* Left: schedule + pricing */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                        <CalendarClock className="w-3.5 h-3.5 text-primary-400" />
                        <span>Schedule & Commercials</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label className="space-y-1">
                          <span className="text-neutral-500 text-[10px] font-bold uppercase">Start Date</span>
                          <input
                            type="date"
                            value={d.startDate}
                            onChange={(e) => setDraft(quote.id!, { startDate: e.target.value })}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-100"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-neutral-500 text-[10px] font-bold uppercase">Duration (weeks)</span>
                          <input
                            type="number"
                            min={0}
                            placeholder="e.g. 12"
                            value={d.estimatedDurationWeeks}
                            onChange={(e) => setDraft(quote.id!, { estimatedDurationWeeks: e.target.value })}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-100"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-neutral-500 text-[10px] font-bold uppercase">Est. Completion</span>
                          <input
                            type="date"
                            value={d.estimatedCompletionDate}
                            onChange={(e) => setDraft(quote.id!, { estimatedCompletionDate: e.target.value })}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-100"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-neutral-500 text-[10px] font-bold uppercase">Final Price</span>
                          <input
                            type="number"
                            min={0}
                            placeholder="Negotiated amount"
                            value={d.finalPrice}
                            onChange={(e) => setDraft(quote.id!, { finalPrice: e.target.value })}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-100 font-mono"
                          />
                        </label>
                      </div>
                      <label className="space-y-1 block text-xs">
                        <span className="text-neutral-500 text-[10px] font-bold uppercase">Internal Admin Notes</span>
                        <textarea
                          rows={2}
                          value={d.adminNotes}
                          onChange={(e) => setDraft(quote.id!, { adminNotes: e.target.value })}
                          placeholder="Private notes — client never sees these"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-100"
                        />
                      </label>
                      <div className="flex items-center justify-between text-[11px] text-neutral-400">
                        <span>
                          {elapsedDays !== null && `Elapsed: ${elapsedDays} days · `}
                          {quote.startDate && `Started ${fmtDate(quote.startDate)} · `}
                          {quote.estimatedCompletionDate && `Due ${fmtDate(quote.estimatedCompletionDate)}`}
                          {quote.completedAt && ` · Done ${fmtDate(quote.completedAt)}`}
                        </span>
                        <button
                          onClick={() => handleSaveProject(quote)}
                          disabled={updateQuoteMutation.isPending}
                          className="px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-bold flex items-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" /> Save
                        </button>
                      </div>
                      <label className="space-y-1 block text-xs">
                        <span className="text-neutral-500 text-[10px] font-bold uppercase">Note for next status change</span>
                        <input
                          type="text"
                          value={d.statusNote}
                          onChange={(e) => setDraft(quote.id!, { statusNote: e.target.value })}
                          placeholder="e.g. 'Client signed agreement' — recorded in timeline"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-100"
                        />
                      </label>
                    </div>

                    {/* Right: status timeline */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                        <History className="w-3.5 h-3.5 text-accent-400" />
                        <span>Status Timeline</span>
                      </div>
                      <div className="space-y-0 max-h-56 overflow-y-auto pr-1">
                        {[...(quote.statusHistory || [])].reverse().map((ev, i) => (
                          <div key={i} className="flex gap-2.5 text-xs pb-2.5 relative">
                            <div className="flex flex-col items-center">
                              <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${i === 0 ? 'bg-primary-400' : 'bg-neutral-700'}`} />
                              {i < (quote.statusHistory?.length || 0) - 1 && (
                                <span className="flex-1 w-px bg-neutral-800 mt-1" />
                              )}
                            </div>
                            <div className="pb-1">
                              <span className={`font-bold ${i === 0 ? 'text-primary-300' : 'text-neutral-300'}`}>
                                {STATUS_LABELS[ev.status] || ev.status}
                              </span>
                              <span className="text-neutral-500 text-[10px] block">
                                {new Date(ev.changedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {ev.note && <span className="text-neutral-400 text-[11px] block mt-0.5">{ev.note}</span>}
                            </div>
                          </div>
                        ))}
                        {(!quote.statusHistory || quote.statusHistory.length === 0) && (
                          <p className="text-neutral-500 text-xs">No timeline events yet — status changes will be recorded here.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
