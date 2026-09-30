# Nanban Crackers – Antigravity Project Guide

## Project Overview

**Nanban Crackers** is a festive fireworks e-commerce platform for Sivakasi direct factory wholesale and retail dispatch across Tamil Nadu.

- **Framework**: Next.js 16 (App Router) with React 19 & TypeScript 5
- **Styling**: Tailwind CSS v4 with PostCSS
- **State Management**: Zustand with `localStorage` persistence (`src/store/cartStore.ts`)
- **Animation & Motion**: Framer Motion, Swiper 11, and AOS (Animate on Scroll)
- **PDF Engine**: jsPDF + jspdf-autotable (Festive Estimate & Order Invoice generation)
- **Testing Engine**: Jest (`next/jest`), `@testing-library/react` (React 19), `@testing-library/dom`, `@testing-library/jest-dom`
- **Site Configuration**: Single source of truth (`src/config/site.ts`)

---

## Developer Commands

```bash
npm run dev          # Local development server
npx tsc --noEmit     # TypeScript type check
npm run lint         # ESLint linter
npm test             # Automated tests (Jest + RTL)
npm run test:watch   # Tests in watch mode
npm run build        # Production build
```

---

## Tailwind CSS v4 Rules (Strictly Enforced)

1. **Linear Gradients**: Always `bg-linear-to-*` — never `bg-gradient-to-*`.
2. **Equal Dimensions**: Always `size-{n}` — never `w-{n} h-{n}`.
3. **Standard Spacing Scale**: No arbitrary brackets (`w-[40px]`). Use Tailwind scale (`w-10`).
4. **Aspect Ratio & Z-Index**: Unbracketed (`aspect-4/3`, `z-999`).
5. **Single Display**: One display utility per element.
6. **No Raw Emojis**: Use Lucide React SVG icons exclusively.

---

## Core Business & UX Conventions

1. **Product Catalog**: Full titles, equal-height cards, pinned bottom actions, real-time search, category filtering, price sorting, infinite scroll.
2. **Image & Lightbox**: Valid images open `<Lightbox />` with multi-image nav & keyboard controls. Missing/failed images show `<ImageWithFallback />` placeholder (Lucide `Package` icon) and block Lightbox.
3. **Cart & Stepper**: Default qty `0`, smooth `0 → 1` transition on add, persists via Zustand + `localStorage`.
4. **Minimum Order**: ₹3,000 threshold for Sivakasi factory dispatch. Below: progress bar + "Add More". Above: checkout modal + festive PDF estimate.
5. **Dual PDF Engine**: Festive Estimate (branded, ₹ symbol) and Order Invoice (monochrome, ≤ 40 KB, Deflate compressed).
6. **Delivery**: Free delivery, strictly within **Tamil Nadu, Kerala, and Bangalore** via Sivakasi transport hubs.

---

## Environment Variables & Security Rules (Strictly Enforced)

1. **NEVER read, view, or log `.env` files**: Do NOT read, view, or print `.env`, `.env.local`, `.env.production`, or any sensitive environment files.
2. **NEVER write, edit, or overwrite `.env` files**: Local `.env` files belong strictly to the developer/user. Never generate or modify them directly.
3. **Use `.env.example` exclusively**: All environment variable schemas, documentation, and mock values belong in `.env.example`.
4. **Instruct user for local env changes**: Guide the user to add or update variables in their own `.env` file manually.

---

## Testing Suites (`tests/`)

- `01-catalog-render`: Banners, Gift Boxes, Product Grid DOM rendering.
- `02-filter-sort-search`: Category filtering, live search, sorting, empty state.
- `03-cart-stepper-discounts`: Add to cart, stepper transitions, discount calculations, store operations.
- `04-minimum-order-estimate-pdf`: ₹3,000 threshold, progress bar, Festive Estimate PDF.
- `05-order-checkout-invoice-pdf`: Checkout validation, order submit, Invoice PDF.
- `06-lightbox-and-fallback`: Lightbox nav, keyboard controls, fallback image safety.
- `07-emailjs-recaptcha`: EmailJS free tier dispatch, 45KB payload ceiling, Google reCAPTCHA.
- `08-utilities-and-store`: formatPrice, getDiscountPercent, generateInvoiceNumber, computeCartTotals.
