import { NextResponse } from 'next/server';
import { ensureSeeded } from '../../../lib/seed';
import { Product, Order, HomeQuote, cleanList } from '../../../lib/models';
import { getStorageConfig } from '../../../lib/storage';

export async function GET() {
  try {
    await ensureSeeded();
    const [orders, quotes, products, storage] = await Promise.all([
      Order.find().sort({ _id: -1 }).lean(),
      HomeQuote.find().sort({ _id: -1 }).lean(),
      Product.find().lean(),
      getStorageConfig()
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
      activeProvider: storage.activeProvider,
      recentQuotes: cleanList(quotes.slice(0, 5)),
      recentOrders: cleanList(orders.slice(0, 5))
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch analytics' }, { status: 500 });
  }
}
