import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../lib/seed';
import { Order, cleanList } from '../../../lib/models';
import { requireAdmin } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    await ensureSeeded();
    const denied = await requireAdmin(request);
    if (denied) return denied;
    const orders = await Order.find().sort({ _id: -1 }).lean();
    return NextResponse.json(cleanList(orders));
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSeeded();
    const body = await request.json();
    const newOrder = {
      ...body,
      id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const created = await Order.create(newOrder);
    const { _id, __v, ...rest } = created.toObject();
    return NextResponse.json(rest, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to create order' }, { status: 500 });
  }
}
