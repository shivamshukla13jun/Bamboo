import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../../lib/seed';
import { HomeQuote, clean } from '../../../../lib/models';
import { requireAdmin } from '../../../../lib/auth';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    await ensureSeeded();
    const denied = await requireAdmin(request);
    if (denied) return denied;
    const { id } = await ctx.params;
    const body = await request.json();

    const { _id, id: _idField, ...rest } = body;
    const updated = await HomeQuote.findOneAndUpdate({ id }, { $set: rest }, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ message: 'Quote not found' }, { status: 404 });
    }
    return NextResponse.json(clean(updated));
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to update quote' }, { status: 500 });
  }
}
