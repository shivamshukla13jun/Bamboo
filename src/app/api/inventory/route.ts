import { NextResponse } from 'next/server';
import { ensureSeeded } from '../../../lib/seed';
import { getEnrichedProducts } from '../../../lib/products';

export async function GET() {
  try {
    await ensureSeeded();
    const products = await getEnrichedProducts();
    const inventoryList = products.flatMap((p) =>
      (p.variants || []).map((v: any) => ({
        productId: p.id,
        productName: p.name,
        categoryName: p.categoryName || p.categoryId,
        variantId: v.id,
        variantName: v.name,
        sku: v.sku,
        price: v.price,
        stock: v.stock,
        isLowStock: (v.stock || 0) < 10
      }))
    );
    return NextResponse.json(inventoryList);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch inventory' }, { status: 500 });
  }
}
