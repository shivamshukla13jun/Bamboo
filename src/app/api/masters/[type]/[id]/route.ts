import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../../../lib/seed';
import { Master, clean, MASTER_URL_TO_TYPE } from '../../../../../lib/models';
import { checkEntityReferences } from '../../../../../lib/refs';

type Ctx = { params: Promise<{ type: string; id: string }> };

export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    await ensureSeeded();
    const { type, id } = await ctx.params;
    const masterType = MASTER_URL_TO_TYPE[type];
    if (!masterType) {
      return NextResponse.json({ message: 'Invalid master type' }, { status: 400 });
    }

    const existing = await Master.findOne({ type: masterType, id }).lean();
    if (!existing) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }

    const body = await request.json();
    const { _id, id: _idField, type: _typeField, ...rest } = body;
    await Master.updateOne(
      { type: masterType, id },
      { $set: { ...rest, type: masterType, id } } // type re-stamped server-side, immutable
    );
    const updated = await Master.findOne({ type: masterType, id }).lean();
    return NextResponse.json(clean(updated));
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to update master item' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  try {
    await ensureSeeded();
    const { type, id } = await ctx.params;
    const masterType = MASTER_URL_TO_TYPE[type];
    if (!masterType) {
      return NextResponse.json({ message: 'Invalid master type' }, { status: 400 });
    }

    const refCheck = await checkEntityReferences(masterType, id);
    if (!refCheck.canDelete) {
      return NextResponse.json(refCheck, { status: 409 });
    }

    const result = await Master.deleteOne({ type: masterType, id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: `Deleted ${masterType} successfully.` });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to delete master item' }, { status: 500 });
  }
}
