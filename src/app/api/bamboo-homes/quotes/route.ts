import { NextResponse } from 'next/server';
import { ensureSeeded } from '../../../../lib/seed';
import { HomeQuote, cleanList } from '../../../../lib/models';

export async function GET() {
  try {
    await ensureSeeded();
    const quotes = await HomeQuote.find().sort({ _id: -1 }).lean();
    return NextResponse.json(cleanList(quotes));
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch quotes' }, { status: 500 });
  }
}
