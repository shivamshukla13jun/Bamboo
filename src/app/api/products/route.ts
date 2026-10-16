import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../lib/seed';
import { Product, Master, clean } from '../../../lib/models';
import {
  getEnrichedProducts,
  enrichProduct,
  normalizeVariants,
  aggregateStock
} from '../../../lib/products';


export async function GET(request: NextRequest) {
  try {
    await ensureSeeded();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort');

    const filter: any = {};

    if (category && category !== 'all') {
      // Match by category master id or slug
      const cat = await Master.findOne({
        type: 'category',
        $or: [{ id: category }, { slug: category }]
      }).lean();
      const ids = new Set<string>([category]);
      if (cat) {
        ids.add(cat.id);
        if (cat.slug) ids.add(cat.slug);
      }
      filter.categoryId = { $in: [...ids] };
    }

    if (search) {
      const q = search.trim();
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: regex }, { description: regex }];
    }

    if (minPrice !== null && minPrice !== '') {
      filter.price = { ...(filter.price || {}), $gte: Number(minPrice) };
    }
    if (maxPrice !== null && maxPrice !== '') {
      filter.price = { ...(filter.price || {}), $lte: Number(maxPrice) };
    }

    let results = await getEnrichedProducts(filter);

    // Species name search (enriched field — applied post-fetch)
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.speciesName || '').toLowerCase().includes(q)
      );
    }

    if (sort === 'price_asc') {
      results.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      results.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // featured first, then rating
      results.sort((a, b) => Number(b.isFeatured || false) - Number(a.isFeatured || false));
    }

    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSeeded();
    const body = await request.json();
    const prodId = `prod-${Date.now()}`;

    const variants = normalizeVariants(body.variants, prodId, body.price || 100);
    const newProduct = {
      ...body,
      id: prodId,
      slug:
        body.slug ||
        String(body.name || 'product')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      rating: body.rating ?? 5.0,
      reviewsCount: body.reviewsCount ?? 1,
      stock: aggregateStock(variants),
      variants
    };

    await Product.create(newProduct);
    const [saved, masters] = await Promise.all([
      Product.findOne({ id: prodId }).lean(),
      Master.find().lean()
    ]);
    const byId = new Map(masters.map((m: any) => [m.id, m]));
    return NextResponse.json(enrichProduct(clean(saved), byId), { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to create product' }, { status: 500 });
  }
}
