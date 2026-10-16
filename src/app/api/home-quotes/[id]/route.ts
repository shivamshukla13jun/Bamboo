import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../../lib/seed';
import { HomeQuote, clean } from '../../../../lib/models';
import { requireAdmin } from '../../../../lib/auth';
import { QuoteStatus } from '../../../../types';

type Ctx = { params: Promise<{ id: string }> };

/**
 * PUT /api/home-quotes/[id]
 * Admin-managed quote/project updates. Accepts any editable field plus:
 *  - status + statusNote  → appends a QuoteStatusEvent to statusHistory
 *  - startDate / estimatedDurationWeeks → auto-derives estimatedCompletionDate
 *  - in_construction auto-stamps startDate, completed auto-stamps completedAt
 */
export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    await ensureSeeded();
    const denied = await requireAdmin(request);
    if (denied) return denied;
    const { id } = await ctx.params;
    const body = await request.json();

    const existing = await HomeQuote.findOne({ id }).lean();
    if (!existing) {
      return NextResponse.json({ message: 'Quote not found' }, { status: 404 });
    }

    const { _id, id: _idField, status, statusNote, ...rest } = body;
    const updates: Record<string, any> = { ...rest };
    const now = new Date().toISOString();

    // --- Status transition → timeline entry ---
    if (status !== undefined) {
      const allowed = Object.values(QuoteStatus) as string[];
      if (!allowed.includes(status)) {
        return NextResponse.json({ message: 'Invalid quote status' }, { status: 400 });
      }
      updates.status = status;
      if (status !== existing.status) {
        // Backfill the initial event for quotes created before history tracking
        const prior =
          existing.statusHistory?.length
            ? existing.statusHistory
            : [
                {
                  status: existing.status || QuoteStatus.QuoteRequested,
                  changedAt: existing.createdAt || now,
                  note: 'Quote request received'
                }
              ];
        updates.statusHistory = [
          ...prior,
          { status, changedAt: now, ...(statusNote ? { note: String(statusNote) } : {}) }
        ];
      }
      // Auto-stamps for lifecycle milestones
      if (status === QuoteStatus.InConstruction && !existing.startDate && !rest.startDate) {
        updates.startDate = now;
      }
      if (status === QuoteStatus.Completed && !existing.completedAt && !rest.completedAt) {
        updates.completedAt = now;
      }
    }

    // --- Derive estimated completion = startDate + duration (weeks) ---
    const effectiveStart = updates.startDate ?? (existing as any).startDate;
    const effectiveWeeks =
      updates.estimatedDurationWeeks ?? (existing as any).estimatedDurationWeeks;
    if (effectiveStart && effectiveWeeks && rest.estimatedCompletionDate === undefined) {
      const startMs = new Date(effectiveStart).getTime();
      if (!Number.isNaN(startMs)) {
        updates.estimatedCompletionDate = new Date(
          startMs + Number(effectiveWeeks) * 7 * 24 * 60 * 60 * 1000
        ).toISOString();
      }
    }

    const updated = await HomeQuote.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    ).lean();
    return NextResponse.json(clean(updated));
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to update quote' }, { status: 500 });
  }
}
