import { dbInstance } from '../../../server/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  
  let products = [...dbInstance.products];
  if (category && category !== 'all') {
    products = products.filter(p => p.categoryId === category || p.categoryName === category);
  }
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  return Response.json(products);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newProduct = {
    ...body,
    id: `prod-${Date.now()}`,
    slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  };
  dbInstance.products.unshift(newProduct);
  return Response.json(newProduct, { status: 201 });
}
