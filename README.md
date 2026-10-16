# Bamboorise 🌱

Full-stack bamboo homes & eco-products e-commerce platform — **Next.js (App Router) + MongoDB + TypeScript + Tailwind CSS v4**, dark stone/emerald/amber theme.

## Stack

- **Frontend**: React 19, Redux Toolkit (cart / admin / filters / seo / form-error bridge), TanStack Query (server state), React Hook Form, lucide-react
- **Backend**: Next.js API route handlers only (`src/app/api/*`)
- **Database**: MongoDB via Mongoose (`src/lib/*`), auto-seeds on first request
- **Auth**: bcrypt-hashed users + HMAC-signed httpOnly session cookie (`AUTH_SECRET`); seeded admin `admin@bamboorise.com` / `admin123` (override via `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- **Storage**: provider selected server-side via `STORAGE_PROVIDER` env (`mock` writes real files to `public/uploads/` → `/uploads/*`; `aws` / `cloudinary` simulate URLs). Provider internals are never exposed to the app.

## Getting started

```bash
cp .env.example .env.local   # MONGODB_URI defaults to mongodb://localhost:27017/bamboorise
npm install
npm run seed                 # optional — the API auto-seeds an empty DB anyway
npm run dev                  # http://localhost:3000
```

`npm run build` / `npm run start` for production, `npm run lint` for typecheck.

## Site configuration — `site.config.json`

All site-related branding and copy lives in **`site.config.json`** (root). Edit it to re-skin the entire app — site name, tagline, logo emoji, admin panel title, contact info, topbar promo, hero copy + featured card, footer sections, copyright, currencies (+rates/symbols), shipping threshold/cost, coupon codes, SEO defaults, and the customizer success message. Consumed via `src/config/site.ts` (`siteConfig`, `currencyRates`, `currencySymbols`, `currencyCodes`).

### Theme (`theme` key)

`theme.primary` / `theme.accent` / `theme.neutral` hold full 50–950 hex palettes. They're injected as CSS vars server-side (`layout.tsx`) and at runtime (`ThemeSync`) backing the `bg-primary-*`, `text-accent-*`, `bg-neutral-*` Tailwind utilities used throughout — recolor the whole app by editing the JSON. Default: emerald / amber / stone.

### Server-side SEO

`src/app/page.tsx` is an async **server component**: it resolves `generateMetadata()` from the SEO document in MongoDB (managed in Admin → SEO, with `site.config.json` as the default), injects the JSON-LD schema into the HTML, and passes `initialProducts`/`initialSeo` to the client app — so product cards, prices, and all meta/OG/Twitter/canonical tags exist in the page source before hydration (`export const dynamic = 'force-dynamic'`).

### Enums

All domain/status values are TypeScript `enum`s in `src/types.ts` — `UserRole`, `OrderStatus`, `QuoteStatus`, `PaymentMethod`, `CouponType`, `MasterEntityType`, `StorageProvider`, `AdminTab`, `NotificationType`, `SortBy`, `PricePreset`, `StockFilter`. No `'x' | 'y'` string unions.

### Currency

Currencies come from `commerce.currencies` (currently INR only — `₹`). Add more entries and the header picker reappears automatically; it's hidden when only one currency is configured.

## Naming

The codebase uses product-agnostic names so the storefront can be repurposed: `StorefrontApp`, `HomeCustomizer`, `HomeQuotesManager`, `HomeQuote` type, `/api/home-quotes` routes, `#home-builder` anchor, `store_session` cookie.

## Auth

- **Customers**: Sign In / Register from the header (`POST /api/auth/register` creates a `customer` role user and signs in).
- **Admins**: clicking the Admin Panel toggle opens a dedicated login page — sign in with an admin account to unlock the panel.
- **Admin-only API**: all management reads/writes (products/masters CRUD, inventory, orders list & status, quotes list & status, analytics, storage, uploads, reference checks) require a valid admin session (401 unauthenticated / 403 non-admin). Storefront reads and checkout/quote POSTs stay public.
- **Password reset**: `POST /api/auth/forgot-password` stores a SHA-256-hashed token (30 min) and emails a `/?reset-token=` link via the nodemailer service (`src/lib/email.ts`, branded templates in `src/lib/email-templates.ts` using `site.config.json` theme). Configure `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`SMTP_FROM`; without SMTP, dev mode returns the token in the response. `POST /api/auth/reset-password` validates and rotates the password. Registration also sends a welcome email.

## Features

**Storefront** (single page): master-driven category pills, search, currency picker (auto-hidden with a single configured currency — currently INR), price-range slider + sort, product grid, detail modal with Google SEO preview + material specs + quantity add-to-cart, cart drawer, checkout → `POST /api/orders`, and a custom Home Configurator (home type / species / roof style masters × sq-ft slider × stories × solar → live estimate → `POST /api/home-quotes`).

**Admin panel** (login-gated): dashboard analytics, Products Manager with variant builder + image upload + master selects + SEO fields, Inventory Manager (per-variant SKU stock, low/out-of-stock filters), Masters Manager (categories, species, treatments, roof styles, home types — `type` stamped server-side), Orders Manager, quote leads, SEO Manager, File Uploads panel (usage stats + test upload), and a Redux Form Console that streams React Hook Form errors via `useFormReduxSync`.

## API

```
POST      /api/auth/register       POST           /api/auth/login
GET       /api/auth/me             POST           /api/auth/logout
POST      /api/auth/forgot-password
POST      /api/auth/reset-password
GET/POST  /api/products            GET/PUT/DELETE /api/products/[id]
GET       /api/masters             GET/POST       /api/masters/[type]
                                   PUT/DELETE     /api/masters/[type]/[id]
GET       /api/inventory           PUT            /api/inventory/variants/[variantId]/stock
GET/POST  /api/orders              PUT            /api/orders/[id]/status
GET/POST  /api/home-quotes         PUT            /api/home-quotes/[id]
GET/PUT   /api/seo                 GET            /api/storage (upload stats only)
POST      /api/storage/upload      multipart — returns { url, filename } only
GET       /api/analytics           GET            /api/health
GET       /api/check-references?type=&id=         -> 409 + blockers when referenced
GET       /uploads/*               serves runtime-uploaded files from public/uploads
```

## Rules implemented

- Every product requires `variants: ProductVariant[]`; product `stock` = sum of variant stock (normalized server-side).
- No hardcoded dropdown options — all selects are driven by the Masters API.
- Referential integrity engine: deleting a referenced master/product returns HTTP 409 with the blocking references and suggested actions; the admin UI shows a warning modal.
