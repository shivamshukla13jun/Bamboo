import { Master, Product, clean, cleanList } from './models';
import { ProductVariant } from '../types';

/** Load all masters grouped by type into lookup maps */
async function loadMasterMaps() {
  const masters = await Master.find().lean();
  const byId = new Map<string, any>();
  for (const m of masters) byId.set(m.id, m);
  return byId;
}

/** Enrich a product doc with master-derived display fields */
export function enrichProduct(p: any, mastersById: Map<string, any>) {
  const cat = mastersById.get(p.categoryId);
  const spec = mastersById.get(p.speciesId);
  const treat = mastersById.get(p.treatmentId);
  return {
    ...p,
    categoryName: cat?.name || p.categoryName,
    categorySlug: cat?.slug || p.categorySlug,
    speciesName: spec?.name || p.speciesName,
    treatmentName: treat?.name || p.treatmentName,
    stock: (p.variants || []).reduce((acc: number, v: any) => acc + (v.stock || 0), 0)
  };
}

export async function getEnrichedProducts(filter: any = {}) {
  const [products, mastersById] = await Promise.all([Product.find(filter).lean(), loadMasterMaps()]);
  return cleanList<any>(products).map((p) => enrichProduct(p, mastersById));
}

export async function getEnrichedProduct(idOrSlug: string) {
  const [product, mastersById] = await Promise.all([
    Product.findOne({ $or: [{ id: idOrSlug }, { slug: idOrSlug }] }).lean(),
    loadMasterMaps()
  ]);
  if (!product) return null;
  return enrichProduct(clean<any>(product), mastersById);
}

/**
 * Normalize incoming variant payloads: assign ids/productId, coerce numbers,
 * and recompute the product's aggregate stock.
 */
export function normalizeVariants(raw: any[] | undefined, productId: string, fallbackPrice = 0): ProductVariant[] {
  const list: ProductVariant[] =
    raw && raw.length > 0
      ? raw.map((v: any, idx: number) => ({
          id: v.id || `var-${productId}-${idx + 1}`,
          productId,
          sku: v.sku || `SKU-${idx + 1}`,
          name: v.name || 'Standard Option',
          price: Number(v.price ?? fallbackPrice) || 0,
          originalPrice: v.originalPrice !== undefined ? Number(v.originalPrice) : undefined,
          stock: Math.max(0, Number(v.stock) || 0),
          attributes: v.attributes || {},
          image: v.image,
          isDefault: v.isDefault ?? idx === 0
        }))
      : [
          {
            id: `var-${productId}-1`,
            productId,
            sku: 'STD-OPTION',
            name: 'Standard Option',
            price: fallbackPrice,
            stock: 0,
            attributes: { Option: 'Standard' },
            isDefault: true
          }
        ];
  return list;
}

export function aggregateStock(variants: { stock?: number }[]): number {
  return (variants || []).reduce((acc, v) => acc + (v.stock || 0), 0);
}
