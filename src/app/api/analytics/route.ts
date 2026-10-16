import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../lib/seed';
import { Product, Order, HomeQuote, cleanList } from '../../../lib/models';
import { getUploadStats } from '../../../lib/storage';
import { requireAdmin } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    await ensureSeeded();
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const [orders, quotes, products, uploadStats] = await Promise.all([
      Order.find().sort({ _id: -1 }).lean(),
      HomeQuote.find().sort({ _id: -1 }).lean(),
      Product.find().lean(),
      getUploadStats()
    ]);

    const totalRevenue = orders.reduce((acc, o: any) => acc + (o.total || 0), 0);
    const lowStockCount = products
      .flatMap((p: any) => p.variants || [])
      .filter((v: any) => (v.stock || 0) < 10).length;

    return NextResponse.json({
      totalRevenue,
      totalOrders: orders.length,
      totalHomeQuotes: quotes.length,
      totalProducts: products.length,
      lowStockCount,
      uploadStats,
      recentQuotes: cleanList(quotes.slice(0, 5)),
      recentOrders: cleanList(orders.slice(0, 5))
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch analytics' }, { status: 500 });
  }
}
