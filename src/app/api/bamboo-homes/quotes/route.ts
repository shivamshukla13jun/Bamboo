import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../../lib/seed';
import { HomeQuote, cleanList } from '../../../../lib/models';
import { requireAdmin } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    await ensureSeeded();
    const denied = await requireAdmin(request);
    if (denied) return denied;
    const quotes = await HomeQuote.find().sort({ _id: -1 }).lean();
    return NextResponse.json(cleanList(quotes));
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch quotes' }, { status: 500 });
  }
}
