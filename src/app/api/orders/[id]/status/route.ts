import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../../../lib/seed';
import { Order, clean } from '../../../../../lib/models';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    await ensureSeeded();
    const { id } = await ctx.params;
    const { status } = await request.json();

    const allowed = ['pending', 'processing', 'shipped', 'delivered'];
    if (!allowed.includes(status)) {
      return NextResponse.json({ message: 'Invalid order status' }, { status: 400 });
    }

    const updated = await Order.findOneAndUpdate(
      { id },
      { $set: { status } },
      { new: true }
    ).lean();
    if (!updated) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(clean(updated));
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to update order status' }, { status: 500 });
  }
}
