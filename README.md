# Bamboorise 🌱

Full-stack bamboo homes & eco-products e-commerce platform — **Next.js (App Router) + MongoDB + TypeScript + Tailwind CSS v4**, dark stone/emerald/amber theme.

## Stack

- **Frontend**: React 19, Redux Toolkit (cart / admin / filters / seo / form-error bridge), TanStack Query (server state), React Hook Form, lucide-react
- **Backend**: Next.js API route handlers only (`src/app/api/*`)
- **Database**: MongoDB via Mongoose (`src/lib/*`), auto-seeds on first request
- **Storage**: switchable provider — `mock` writes real files to `public/uploads/` (served at `/uploads/*`), `aws` / `cloudinary` / `minio` return simulated URLs

## Getting started

```bash
cp .env.example .env.local   # MONGODB_URI defaults to mongodb://localhost:27017/bamboorise
npm install
npm run seed                 # optional — the API auto-seeds an empty DB anyway
npm run dev                  # http://localhost:3000
```

`npm run build` / `npm run start` for production, `npm run lint` for typecheck.

## Features

**Storefront** (single page): master-driven category pills, search, USD/EUR/GBP/AUD currency picker, price-range slider + sort, product grid, detail modal with Google SEO preview + material specs + quantity add-to-cart, cart drawer, checkout → `POST /api/orders`, and a Bamboo Home Customizer (home type / species / roof style masters × sq-ft slider × stories × solar → live estimate → `POST /api/bamboo-homes/quote`).

**Admin panel** (toggle in header): dashboard analytics, Products Manager with variant builder + image upload + master selects + SEO fields, Inventory Manager (per-variant SKU stock, low/out-of-stock filters), Masters Manager (categories, species, treatments, roof styles, home types, storage providers — `type` stamped server-side), Orders Manager, quote leads, SEO Manager, Storage Manager with test-upload panel, and a Redux Form Console that streams React Hook Form errors via `useFormReduxSync`.

## API

```
GET/POST  /api/products            GET/PUT/DELETE /api/products/[id]
GET       /api/masters             GET/POST       /api/masters/[type]
                                   PUT/DELETE     /api/masters/[type]/[id]
GET       /api/inventory           PUT            /api/inventory/variants/[variantId]/stock
GET/POST  /api/orders              PUT            /api/orders/[id]/status
GET       /api/bamboo-homes/quotes POST           /api/bamboo-homes/quote
                                   PUT            /api/bamboo-homes/quotes/[id]
GET/PUT   /api/seo                 GET            /api/storage
PUT       /api/storage/provider    POST           /api/storage/upload (multipart)
GET       /api/analytics           GET            /api/health
GET       /api/check-references?type=&id=         -> 409 + blockers when referenced
GET       /uploads/*               serves runtime-uploaded files from public/uploads
```

## Rules implemented

- Every product requires `variants: ProductVariant[]`; product `stock` = sum of variant stock (normalized server-side).
- No hardcoded dropdown options — all selects are driven by the Masters API.
- Referential integrity engine: deleting a referenced master/product returns HTTP 409 with the blocking references and suggested actions; the admin UI shows a warning modal.
