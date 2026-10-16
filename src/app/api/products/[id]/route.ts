import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../../lib/seed';
import { Product } from '../../../../lib/models';
import { getEnrichedProduct, normalizeVariants, aggregateStock } from '../../../../lib/products';
import { checkEntityReferences } from '../../../../lib/refs';
import { requireAdmin } from '../../../../lib/auth';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  try {
    await ensureSeeded();
    const { id } = await ctx.params;
    const product = await getEnrichedProduct(id);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    await ensureSeeded();
    const denied = await requireAdmin(request);
    if (denied) return denied;
    const { id } = await ctx.params;
    const body = await request.json();

    const current = await Product.findOne({ id }).lean();
    if (!current) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const variants = body.variants
      ? normalizeVariants(body.variants, id, body.price ?? current.price)
      : current.variants;

    const { _id, ...rest } = body;
    const update = {
      ...rest,
      variants,
      stock: aggregateStock(variants)
    };

    await Product.updateOne({ id }, { $set: update });
    const product = await getEnrichedProduct(id);
    return NextResponse.json(product);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  try {
    await ensureSeeded();
    const denied = await requireAdmin(request);
    if (denied) return denied;
    const { id } = await ctx.params;

    const refCheck = await checkEntityReferences('product', id);
    if (!refCheck.canDelete) {
      return NextResponse.json(refCheck, { status: 409 });
    }

    const result = await Product.deleteOne({ id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to delete product' }, { status: 500 });
  }
}
