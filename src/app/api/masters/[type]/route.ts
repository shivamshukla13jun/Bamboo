import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../../lib/seed';
import { Master, clean, cleanList, MASTER_URL_TO_TYPE } from '../../../../lib/models';

type Ctx = { params: Promise<{ type: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  try {
    await ensureSeeded();
    const { type } = await ctx.params;
    const masterType = MASTER_URL_TO_TYPE[type];
    if (!masterType) {
      return NextResponse.json({ message: 'Master type not found' }, { status: 404 });
    }
    const items = await Master.find({ type: masterType }).lean();
    return NextResponse.json(cleanList(items));
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch master list' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, ctx: Ctx) {
  try {
    await ensureSeeded();
    const { type } = await ctx.params;
    const masterType = MASTER_URL_TO_TYPE[type];
    if (!masterType) {
      return NextResponse.json({ message: 'Invalid master type' }, { status: 400 });
    }

    const body = await request.json();
    const newId = body.id || `${masterType.slice(0, 4)}-${Date.now()}`;
    const doc = { ...body, id: newId, type: masterType }; // type stamped server-side
    const created = await Master.create(doc);
    return NextResponse.json(clean(created.toObject()), { status: 201 });
  } catch (err: any) {
    if (err?.code === 11000) {
      return NextResponse.json({ message: 'A master record with this ID already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: err.message || 'Failed to create master item' }, { status: 500 });
  }
}
