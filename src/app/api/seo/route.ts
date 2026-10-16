import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../lib/seed';
import { Setting } from '../../../lib/models';
import { DEFAULT_SEO_CONFIG } from '../../../lib/seed-data';
import { SeoConfig } from '../../../types';
import { requireAdmin } from '../../../lib/auth';

export async function GET() {
  try {
    await ensureSeeded();
    const doc = await Setting.findOne({ key: 'seo' }).lean();
    const value = (doc as any)?.value || {};
    return NextResponse.json({ ...DEFAULT_SEO_CONFIG, ...value } as SeoConfig);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch SEO config' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await ensureSeeded();
    const denied = await requireAdmin(request);
    if (denied) return denied;
    const body = await request.json();
    const current = await Setting.findOne({ key: 'seo' }).lean();
    const merged = { ...DEFAULT_SEO_CONFIG, ...((current as any)?.value || {}), ...body };
    await Setting.findOneAndUpdate(
      { key: 'seo' },
      { $set: { key: 'seo', value: merged } },
      { upsert: true }
    );
    return NextResponse.json(merged);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to update SEO config' }, { status: 500 });
  }
}
