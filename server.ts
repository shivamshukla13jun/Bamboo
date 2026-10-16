import express from 'express';
import path from 'path';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { dbInstance, connectMongoDB } from './server/db';
import { storageService } from './server/storage';
import { Product, ProductVariant, BambooHomeConfig, Order, StorageProviderType } from './src/types';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Connect database (with fallback to in-memory document engine)
  await connectMongoDB();

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      framework: 'Next.js API Engine (Node TypeScript)',
      activeStorageProvider: storageService.getConfig().activeProvider,
      productsCount: dbInstance.products.length,
      categoriesCount: dbInstance.categories.length,
      speciesCount: dbInstance.species.length
    });
  });

  // ==========================================
  // 1. REFERENTIAL INTEGRITY CHECKER API
  // ==========================================
  app.get('/api/check-references', (req, res) => {
    const { type, id } = req.query as { type: string; id: string };
    if (!type || !id) {
      return res.status(400).json({ message: 'Missing type or id parameter' });
    }
    const result = dbInstance.checkEntityReferences(type, id);
    res.json(result);
  });

  // ==========================================
  // 2. MASTER DATA ENGINE API (NO HARDCODED VALUES)
  // ==========================================
  app.get('/api/masters', (req, res) => {
    res.json({
      categories: dbInstance.categories,
      species: dbInstance.species,
      treatments: dbInstance.treatments,
      roofStyles: dbInstance.roofStyles,
      homeTypes: dbInstance.homeTypes,
      storageProviders: dbInstance.storageProviders
    });
  });

  app.get('/api/masters/:type', (req, res) => {
    const { type } = req.params;
    switch (type) {
      case 'categories':
        return res.json(dbInstance.categories);
      case 'species':
        return res.json(dbInstance.species);
      case 'treatments':
        return res.json(dbInstance.treatments);
      case 'roof_styles':
        return res.json(dbInstance.roofStyles);
      case 'home_types':
        return res.json(dbInstance.homeTypes);
      case 'storage_providers':
        return res.json(dbInstance.storageProviders);
      default:
        return res.status(404).json({ message: 'Master type not found' });
    }
  });

  app.post('/api/masters/:type', (req, res) => {
    const { type } = req.params;
    const body = req.body;
    const newId = `${type.slice(0, 4)}-${Date.now()}`;
    const newItem = { ...body, id: body.id || newId };

    switch (type) {
      case 'categories':
        dbInstance.categories.push(newItem);
        break;
      case 'species':
        dbInstance.species.push(newItem);
        break;
      case 'treatments':
        dbInstance.treatments.push(newItem);
        break;
      case 'roof_styles':
        dbInstance.roofStyles.push(newItem);
        break;
      case 'home_types':
        dbInstance.homeTypes.push(newItem);
        break;
      case 'storage_providers':
        dbInstance.storageProviders.push(newItem);
        break;
      default:
        return res.status(400).json({ message: 'Invalid master type' });
    }
    res.status(201).json(newItem);
  });

  app.put('/api/masters/:type/:id', (req, res) => {
    const { type, id } = req.params;
    const list = (dbInstance as any)[type === 'roof_styles' ? 'roofStyles' : type === 'home_types' ? 'homeTypes' : type === 'storage_providers' ? 'storageProviders' : type];
    if (!list) return res.status(404).json({ message: 'Master list not found' });

    const index = list.findIndex((item: any) => item.id === id);
    if (index === -1) return res.status(404).json({ message: 'Item not found' });

    list[index] = { ...list[index], ...req.body };
    res.json(list[index]);
  });

  app.delete('/api/masters/:type/:id', (req, res) => {
    const { type, id } = req.params;
    // Singularize entity type for reference check
    const singleType = type.endsWith('ies') ? type.slice(0, -3) + 'y' : type.slice(0, -1);
    const refCheck = dbInstance.checkEntityReferences(singleType, id);

    if (!refCheck.canDelete) {
      return res.status(409).json(refCheck); // HTTP 409 Conflict with suggested actions
    }

    const key = type === 'roof_styles' ? 'roofStyles' : type === 'home_types' ? 'homeTypes' : type === 'storage_providers' ? 'storageProviders' : type;
    const list = (dbInstance as any)[key];
    if (!list) return res.status(404).json({ message: 'Master list not found' });

    const index = list.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      list.splice(index, 1);
    }
    res.json({ success: true, message: `Deleted ${singleType} successfully.` });
  });

  // ==========================================
  // 3. PRODUCTS & VARIANTS API
  // ==========================================
  app.get('/api/products', (req, res) => {
    const { category, search, minPrice, maxPrice, sort } = req.query;
    let results = [...dbInstance.products];

    if (category && category !== 'all') {
      results = results.filter(p => p.categoryId === category || p.categoryName === category);
    }

    if (search) {
      const q = String(search).toLowerCase();
      results = results.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.speciesName && p.speciesName.toLowerCase().includes(q))
      );
    }

    if (minPrice) {
      results = results.filter(p => p.price >= Number(minPrice));
    }

    if (maxPrice) {
      results = results.filter(p => p.price <= Number(maxPrice));
    }

    if (sort === 'price_asc') {
      results.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      results.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      results.sort((a, b) => b.rating - a.rating);
    }

    res.json(results);
  });

  app.get('/api/products/:id', (req, res) => {
    const product = dbInstance.products.find(p => p.id === req.params.id || p.slug === req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  });

  app.post('/api/products', (req, res) => {
    const prodId = `prod-${Date.now()}`;
    const variants: ProductVariant[] = req.body.variants && req.body.variants.length > 0
      ? req.body.variants
      : [
          {
            id: `var-${Date.now()}-1`,
            productId: prodId,
            sku: `${req.body.name.slice(0, 3).toUpperCase()}-STD`,
            name: 'Standard Option',
            price: req.body.price || 100,
            originalPrice: req.body.originalPrice,
            stock: req.body.stock || 10,
            attributes: { Option: 'Standard' },
            isDefault: true
          }
        ];

    const totalStock = variants.reduce((acc, v) => acc + (v.stock || 0), 0);

    const newProduct: Product = {
      ...req.body,
      id: prodId,
      slug: req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      rating: 5.0,
      reviewsCount: 1,
      stock: totalStock,
      variants
    };

    dbInstance.products.unshift(newProduct);
    res.status(201).json(newProduct);
  });

  app.put('/api/products/:id', (req, res) => {
    const index = dbInstance.products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const current = dbInstance.products[index];
    const updatedVariants = req.body.variants || current.variants;
    const totalStock = updatedVariants.reduce((acc: number, v: ProductVariant) => acc + (v.stock || 0), 0);

    dbInstance.products[index] = {
      ...current,
      ...req.body,
      variants: updatedVariants,
      stock: totalStock
    };
    res.json(dbInstance.products[index]);
  });

  app.delete('/api/products/:id', (req, res) => {
    const refCheck = dbInstance.checkEntityReferences('product', req.params.id);
    if (!refCheck.canDelete) {
      return res.status(409).json(refCheck);
    }

    const index = dbInstance.products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
    dbInstance.products.splice(index, 1);
    res.json({ success: true, message: 'Product deleted successfully.' });
  });

  // ==========================================
  // 4. DEDICATED INVENTORY MANAGEMENT API
  // ==========================================
  app.get('/api/inventory', (req, res) => {
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
    res.json(inventoryList);
  });

  app.put('/api/inventory/variants/:variantId/stock', (req, res) => {
    const { variantId } = req.params;
    const { stock } = req.body;

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ message: 'Valid non-negative stock number required' });
    }

    let foundVariant: ProductVariant | null = null;
    let parentProduct: Product | null = null;

    for (const prod of dbInstance.products) {
      const v = prod.variants.find(item => item.id === variantId);
      if (v) {
        v.stock = stock;
        foundVariant = v;
        parentProduct = prod;
        prod.stock = prod.variants.reduce((sum, item) => sum + item.stock, 0);
        break;
      }
    }

    if (!foundVariant || !parentProduct) {
      return res.status(404).json({ message: 'Variant not found' });
    }

    res.json({
      success: true,
      variantId,
      newStock: foundVariant.stock,
      parentTotalStock: parentProduct.stock,
      message: `Updated stock for ${parentProduct.name} - ${foundVariant.name} to ${foundVariant.stock}`
    });
  });

  // ==========================================
  // 5. BAMBOO CUSTOM HOMES & QUOTES API
  // ==========================================
  app.get('/api/bamboo-homes/quotes', (req, res) => {
    res.json(dbInstance.homeQuotes);
  });

  app.post('/api/bamboo-homes/quote', (req, res) => {
    const quote: BambooHomeConfig = {
      ...req.body,
      id: `quote-${Date.now()}`,
      status: 'quote_requested',
      createdAt: new Date().toISOString()
    };
    dbInstance.homeQuotes.unshift(quote);
    res.status(201).json(quote);
  });

  app.put('/api/bamboo-homes/quotes/:id', (req, res) => {
    const index = dbInstance.homeQuotes.findIndex(q => q.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Quote not found' });
    }
    dbInstance.homeQuotes[index] = { ...dbInstance.homeQuotes[index], ...req.body };
    res.json(dbInstance.homeQuotes[index]);
  });

  // ==========================================
  // 6. ORDERS & STORAGE API
  // ==========================================
  app.get('/api/orders', (req, res) => {
    res.json(dbInstance.orders);
  });

  app.post('/api/orders', (req, res) => {
    const newOrder: Order = {
      ...req.body,
      id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    dbInstance.orders.unshift(newOrder);
    res.status(201).json(newOrder);
  });

  app.put('/api/orders/:id/status', (req, res) => {
    const { status } = req.body;
    const order = dbInstance.orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    order.status = status;
    res.json(order);
  });

  app.get('/api/seo', (req, res) => {
    res.json(dbInstance.seoConfig);
  });

  app.put('/api/seo', (req, res) => {
    dbInstance.seoConfig = { ...dbInstance.seoConfig, ...req.body };
    res.json(dbInstance.seoConfig);
  });

  app.get('/api/storage', (req, res) => {
    res.json(storageService.getConfig());
  });

  app.put('/api/storage/provider', (req, res) => {
    const { provider } = req.body as { provider: StorageProviderType };
    if (!['cloudinary', 'aws', 'minio', 'mock'].includes(provider)) {
      return res.status(400).json({ message: 'Invalid storage provider' });
    }
    const updated = storageService.setProvider(provider);
    res.json(updated);
  });

  app.post('/api/storage/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      const folder = req.body.folder || 'products';
      const result = await storageService.uploadFile(req.file, folder);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'File upload failed' });
    }
  });

  app.get('/api/analytics', (req, res) => {
    const totalRevenue = dbInstance.orders.reduce((acc, o) => acc + o.total, 0);
    const totalHomeQuotes = dbInstance.homeQuotes.length;
    const totalProducts = dbInstance.products.length;
    const lowStockCount = dbInstance.products.flatMap(p => p.variants).filter(v => v.stock < 10).length;

    res.json({
      totalRevenue,
      totalOrders: dbInstance.orders.length,
      totalHomeQuotes,
      totalProducts,
      lowStockCount,
      activeProvider: storageService.getConfig().activeProvider,
      recentQuotes: dbInstance.homeQuotes.slice(0, 5),
      recentOrders: dbInstance.orders.slice(0, 5)
    });
  });

  // Vite middleware in dev mode & static handling in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bamboorise Next.js Full-Stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
