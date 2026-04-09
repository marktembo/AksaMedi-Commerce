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

## Features

- Homepage with hero, featured categories, featured products, trust strip
- Product catalog with category filtering, search, pagination
- Product detail page with add to cart
- Shopping cart with quantity controls
- Checkout flow (DRC & South Africa focused)
- Order confirmation page

## Database Tables

- `categories` — Product categories (pharmaceuticals, devices, etc.)
- `products` — Medical products with pricing, stock, prescription flag
- `cart_items` — Session-based cart items
- `orders` + `order_items` — Customer orders

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
