import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../../../../lib/seed';
import { Product } from '../../../../../../lib/models';
import { aggregateStock } from '../../../../../../lib/products';
import { requireAdmin } from '../../../../../../lib/auth';

type Ctx = { params: Promise<{ variantId: string }> };

export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    await ensureSeeded();
    const denied = await requireAdmin(request);
    if (denied) return denied;
    const { variantId } = await ctx.params;
    const { stock } = await request.json();

    if (typeof stock !== 'number' || Number.isNaN(stock) || stock < 0) {
      return NextResponse.json(
        { message: 'Valid non-negative stock number required' },
        { status: 400 }
      );
    }

    const product = await Product.findOne({ 'variants.id': variantId });
    if (!product) {
      return NextResponse.json({ message: 'Variant not found' }, { status: 404 });
    }

    const variant = (product.variants || []).find((v: any) => v.id === variantId);
    if (!variant) {
      return NextResponse.json({ message: 'Variant not found' }, { status: 404 });
    }

    variant.stock = stock;
    product.stock = aggregateStock(product.variants as any);
    product.markModified('variants');
    await product.save();

    return NextResponse.json({
      success: true,
      variantId,
      newStock: variant.stock,
      parentTotalStock: product.stock,
      message: `Updated stock for ${product.name} - ${variant.name} to ${variant.stock}`
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to update stock' }, { status: 500 });
  }
}
