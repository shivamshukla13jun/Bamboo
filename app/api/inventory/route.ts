import { dbInstance } from '../../../server/db';

export async function GET() {
  const inventoryList = dbInstance.products.flatMap(p =>
    p.variants.map(v => ({
      productId: p.id,
      productName: p.name,
      categoryName: p.categoryName || p.categoryId,
      variantId: v.id,
      variantName: v.name,
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      isLowStock: v.stock < 10
    }))
  );
  return Response.json(inventoryList);
}
