import { NextResponse } from 'next/server';
import { ensureSeeded } from '../../../lib/seed';
import { Product, Master } from '../../../lib/models';

export async function GET() {
  try {
    await ensureSeeded();
    const [productsCount, mastersCount] = await Promise.all([
      Product.countDocuments(),
      Master.countDocuments()
    ]);
    return NextResponse.json({
      status: 'ok',
      framework: 'Next.js App Router API (MongoDB + Mongoose)',
      database: 'mongodb',
      productsCount,
      mastersCount
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message || 'Database unreachable' },
      { status: 500 }
    );
  }
}
