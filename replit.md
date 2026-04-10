# Aksantimed Medical Ecommerce

## Overview

Medical ecommerce website for Aksantimed — a medical supply company based in Kinshasa, DR Congo and South Africa. Tagline: "empowering health, enriching lives."

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/aksantimed)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Routing**: wouter
- **Styling**: Tailwind CSS v4

## Color Scheme

- Primary: Deep maroon red (~#8B0000) from the Aksantimed logo
- Background: White
- Accents: Gold/cream tones

## Admin Panel

- Route: `/admin/login` → `/admin`
- Credentials: username `admin`, password `aksantimed`
- JWT-based admin auth (stored in `aksantimed_admin_token` cookie/localStorage)
- **Sidebar layout** — 5 sections: Overview, Products, Add Product, Inventory, Requests
- **Overview** — Stats cards (total/published products, low stock, new requests, customers) + recent requests preview
- **Products** — Full CRUD table; search/filter by category/published/stock; edit, delete, toggle published/featured/inStock per row
- **Add/Edit Product** — Full form: name, description, category, brand, SKU, pricing, stock qty, image upload (base64 to `/api/admin/upload`), toggles for published/inStock/featured/Rx
- **Inventory** — Quick stock table; inline quantity editing, per-row save, in-stock toggle
- **Requests** — Quote requests list with status filter, expandable cards showing line items + customer info + admin notes; status update (new→pending→contacted→closed); internal notes with save
- No header/footer — fully standalone admin UI

### Admin API Routes (all require `Authorization: Bearer <jwt>`)
- `GET /api/admin/products` — list all products with category names
- `POST /api/admin/products` — create product
- `PUT /api/admin/products/:id` — update product
- `DELETE /api/admin/products/:id` — delete product
- `PATCH /api/admin/products/:id/toggle` — toggle inStock/featured/published
- `PATCH /api/admin/products/:id/stock` — update stock qty/inStock
- `POST /api/admin/upload` — upload product image (base64 data URL → `/products/*.ext`)
- `GET /api/quote-requests/admin` — list all quote requests with items
- `PATCH /api/quote-requests/admin/:id/status` — update status
- `PATCH /api/quote-requests/admin/:id/notes` — update internal admin notes

## Quote Cart Flow (Core Business Model)

Aksantimed uses a quote-based model — no prices shown publicly. Flow:

1. **Browse** — Products page / ProductDetail page
2. **Add to Quote Cart** — Button on ProductCard and ProductDetail; stored in `localStorage` (key: `aksantimed_quote_cart`) via `QuoteCartContext`
3. **Quote Cart page** (`/cart`) — Review items, update quantities, remove items
4. **Checkout page** (`/checkout`) — Fill contact details, submit to `POST /api/quote-requests`
5. **Confirmation page** (`/order-confirmation/:id?rn=QR-...`) — Shows reference number, next steps
6. **Admin receives** — Quote shows in `/admin` → Quote Requests tab; admin can update status

## Features

- Homepage with hero, featured categories, featured products, trust strip
- Product catalog with category filtering, search, pagination
- Product detail page with "Add to Quote Cart" button
- Quote cart with quantity controls and localStorage persistence
- Quote checkout form (name, email, phone, company, delivery city, message)
- Quote confirmation page with reference number
- Full EN/FR/ES/PT internationalization (i18next)

## Database Tables

- `categories` — Product categories (pharmaceuticals, devices, etc.)
- `products` — Medical products with pricing, stock, prescription flag
- `cart_items` — Session-based legacy cart items (kept, unused in new flow)
- `orders` + `order_items` — Legacy customer orders
- `users` — Business client accounts (clinics, hospitals, practices)
- `saved_products` — Products saved/bookmarked by each user
- `user_inquiries` — Legacy inquiry history per user
- `quote_requests` — Quote submissions (requestNumber, customerName/Email/Phone, companyName, deliveryCity, message, status)
- `quote_request_items` — Line items per quote (productId, productName, productSku, quantity)

## Authentication System

JWT-based auth. Token stored in `localStorage` under `aksantimed_auth_token`.

- **Auth routes** (backend): `artifacts/api-server/src/routes/auth.ts`
  - `POST /api/auth/register` — Create account
  - `POST /api/auth/login` — Login, returns JWT
  - `GET /api/auth/me` — Get current user (requires Bearer token)
  - `PUT /api/auth/profile` — Update profile
  - `POST /api/auth/change-password` — Change password
  - `POST /api/auth/forgot-password` — Request reset token
  - `POST /api/auth/reset-password` — Reset via token

- **Account routes** (backend): `artifacts/api-server/src/routes/account.ts`
  - `GET/POST /api/account/saved-products` — Saved product list
  - `DELETE /api/account/saved-products/:id` — Remove saved
  - `GET/POST /api/account/inquiries` — Inquiry history

- **Auth helper**: `artifacts/api-server/src/lib/auth.ts` — JWT sign/verify, bcrypt, requireAuth middleware

- **Frontend context**: `artifacts/aksantimed/src/contexts/AuthContext.tsx`
- **Frontend API helpers**: `artifacts/aksantimed/src/lib/auth-api.ts`
- **Protected route**: `artifacts/aksantimed/src/components/auth/ProtectedRoute.tsx`

- **Pages**: LoginPage, SignUpPage, ForgotPasswordPage, DashboardPage
- **Routes**: `/login`, `/signup`, `/forgot-password`, `/account` (protected)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/aksantimed run dev` — run frontend locally

## Logo

Logo file: `attached_assets/Artboard-22-300x300_1775736029036.png` — also copied to `artifacts/aksantimed/public/aksantimed-logo.png`

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
