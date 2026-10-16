import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../../lib/seed';
import { PageSeo, clean, cleanList } from '../../../../lib/models';
import { requireAdmin } from '../../../../lib/auth';

/**
 * GET /api/seo/pages        — list all per-page SEO records
 * GET /api/seo/pages?path=  — fetch a single record by route path
 * PUT /api/seo/pages        — create-or-update (upsert) by `path`
 */
export async function GET(request: NextRequest) {
  try {
    await ensureSeeded();
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const path = request.nextUrl.searchParams.get('path');
    if (path) {
      const doc = await PageSeo.findOne({ path }).lean();
      return NextResponse.json(doc ? clean(doc) : null);
    }

    const docs = await PageSeo.find().sort({ path: 1 }).lean();
    return NextResponse.json(cleanList(docs));
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch page SEO' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await ensureSeeded();
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const { path, title, description, keywords, ogImageUrl } = await request.json();
    if (!path || typeof path !== 'string' || !path.startsWith('/')) {
      return NextResponse.json({ message: 'A valid route path (e.g. /, /products/x) is required' }, { status: 400 });
    }

    const record = {
      title: title?.trim() || undefined,
      description: description?.trim() || undefined,
      keywords: Array.isArray(keywords)
        ? keywords.map((k: string) => k.trim()).filter(Boolean)
        : typeof keywords === 'string'
          ? keywords.split(',').map((k) => k.trim()).filter(Boolean)
          : [],
      ogImageUrl: ogImageUrl?.trim() || undefined
    };

    const updated = await PageSeo.findOneAndUpdate(
      { path },
      { $set: record },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json(clean(updated));
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to save page SEO' }, { status: 500 });
  }
}
