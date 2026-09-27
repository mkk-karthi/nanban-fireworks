# 🎆 MKK Fireworks – Factory Direct E-Commerce Platform

A high-performance festive fireworks e-commerce platform for **MKK Fireworks (Sivakasi)** direct factory wholesale and retail dispatch across Tamil Nadu.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript 5**, **Tailwind CSS v4**, **Zustand**, **Framer Motion**, **Swiper 11**, **jsPDF**, **Jest**, and **React Testing Library**.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Runtime & UI** | React 19, TypeScript 5 |
| **Styling** | Tailwind CSS v4 with PostCSS |
| **State Management** | Zustand (with persistent localStorage middleware) |
| **Animations & Carousels** | Framer Motion, Swiper 11, AOS (Animate on Scroll) |
| **Icons** | Lucide React |
| **PDF Engine** | jsPDF & jspdf-autotable (client-side) |
| **Testing** | Jest (`next/jest`), `@testing-library/react` (React 19), `@testing-library/dom`, `@testing-library/jest-dom` |

---

## 📁 Project Architecture

```
fireworks/
├── src/
│   ├── app/                      # Next.js App Router (layout, page, cart, sitemap, robots)
│   ├── components/
│   │   ├── common/               # ImageWithFallback, Lightbox, QuantitySelector, CartFab, AosInitializer
│   │   ├── home/                 # BannerSlider, GiftBoxSection, ProductCard, ProductGrid, ProductFilters
│   │   ├── cart/                 # CartItem, CartSummary, OrderModal
│   │   └── layout/               # Header, Footer
│   ├── config/
│   │   └── site.ts               # Single source of truth for company details, branding, banners, order config
│   ├── data/
│   │   ├── products.json         # Complete regular products catalog
│   │   └── giftBoxes.json        # Curated combo gift boxes
│   ├── hooks/
│   │   ├── useInfiniteScroll.ts  # Progressive product pagination hook
│   │   └── usePrefersReducedMotion.ts # Accessibility hook
│   ├── lib/
│   │   ├── pdfGenerator.ts       # Dual PDF engine (Festive Estimate & Monochrome Invoice)
│   │   ├── pdfFont.ts            # Embedded Roboto TrueType font for Rupee symbol (₹)
│   │   ├── types.ts              # Zod schemas & TypeScript types
│   │   └── utils.ts              # Pricing, savings, discount, invoice number utilities
│   └── store/
│       └── cartStore.ts          # Zustand persistent cart store
├── tests/                        # Comprehensive Jest & React Testing Library test suites
│   ├── 01-catalog-render.test.tsx         # Banners, Gift Box combos, and Product Grid DOM rendering
│   ├── 02-filter-sort-search.test.tsx      # Category filtering chips, live search, and sorting
│   ├── 03-cart-stepper-discounts.test.tsx  # Add to cart, adaptive stepper, and discount calculations
│   ├── 04-minimum-order-estimate-pdf.test.tsx # ₹3,000 threshold enforcement & Festive Estimate PDF
│   ├── 05-order-checkout-invoice-pdf.test.tsx # Checkout modal validation, order submit & Invoice PDF
│   └── 06-lightbox-and-fallback.test.tsx   # Lightbox multiple images, temp placeholder & click safety
├── jest.config.mjs               # Jest configuration integrated with next/jest
├── jest.setup.ts                 # JSDOM polyfills (matchMedia, observers, TextEncoder) and mocks
├── public/                       # Static fonts and assets
└── package.json
```

---

## ⚡ Developer Commands

```bash
# Start local development server
npm run dev

# Run TypeScript type check
npx tsc --noEmit

# Run ESLint validation
npm run lint

# Run automated Jest DOM & interaction tests
npm test

# Run tests in interactive watch mode
npm run test:watch

# Build optimized production bundle
npm run build

# Start production server
npm run start
```

---

## 🧪 Automated Testing Suite

The testing infrastructure uses **Jest** and **React Testing Library** for end-to-end DOM rendering and interaction testing:

1. **Catalog & Banner Rendering (`01-catalog-render.test.tsx`)**:
   - Validates `<BannerSlider />` carousel accessibility roles (`aria-roledescription="carousel"`), headline text, subtitles, CTAs, and prev/next slide buttons.
   - Validates `<GiftBoxSection />` rendering combo names, pricing, discount tags, and "Add Combo" actions.
   - Validates `<ProductGrid />` rendering catalog products with titles, prices, and "Add to Cart" buttons.

2. **Search, Filter & Sorting (`02-filter-sort-search.test.tsx`)**:
   - Tests category chip clicks (e.g. "Sparklers") to ensure only matching category products appear in the DOM.
   - Tests live search input events to filter products by name and category in real time.
   - Tests sort combobox changes: `price-asc` (Low to High), `price-desc` (High to Low), and `name-asc` (A–Z).

3. **Cart Stepper & Discounts (`03-cart-stepper-discounts.test.tsx`)**:
   - Tests `0 in Cart` transitioning to adaptive stepper (`-`, `1 in Cart`, `+`) upon clicking "Add to Cart" or "Add Combo".
   - Tests incrementing to 2 and decrementing back to 0, restoring the button.
   - Verifies exact Total MRP, Festival Discount, and Net Payable calculations in `<CartSummary />`.

4. **₹3,000 Minimum Order & Estimate PDF (`04-minimum-order-estimate-pdf.test.tsx`)**:
   - Below ₹3,000: Displays shortfall progress bar and "Add More" action; hides "Order Now" button and restricts estimate PDF.
   - At or above ₹3,000: Displays minimum met badge, enables "Order Now", and enables "Generate Estimate PDF".
   - Verifies `generateEstimatePdf` generates festive PDF and triggers download (`MKK_Fireworks_Estimate_EST-*.pdf`).

5. **Order Checkout & Invoice PDF (`05-order-checkout-invoice-pdf.test.tsx`)**:
   - Submits empty/invalid fields to test validation error hints (name, 10-digit phone, email, address, city, 6-digit pincode).
   - Submits valid sample customer details, verifies invoice PDF auto-download (`MKK_Fireworks_Invoice_MKK-*.pdf`).
   - Verifies celebratory confirmation screen, re-download button, and cart clearance.

6. **Lightbox & Fallback Image Handling (`06-lightbox-and-fallback.test.tsx`)**:
   - Tests opening `<Lightbox />` on image container click and zoom trigger button.
   - Tests multiple image navigation (Next, Prev, Thumbnails, Keyboard arrow keys, Escape).
   - Validates fallback temp image: when a product has no images or when an image fails to load (`onError`), renders Lucide `Package` placeholder, hides zoom trigger, and prevents Lightbox from opening.

---

## 📋 Tailwind CSS v4 Rules

- **Linear Gradients**: Always use `bg-linear-to-*` (e.g. `bg-linear-to-r`, `bg-linear-to-br`).
- **Equal Dimensions**: Always use `size-{n}` instead of `w-{n} h-{n}` (e.g. `size-10`, `size-8`).
- **Standard Scale**: Avoid arbitrary brackets (`w-10`, `min-w-5`, `min-h-5`).
- **Aspect Ratio & Z-Index**: Use unbracketed standard classes (`aspect-4/3`, `aspect-square`, `z-999`).
- **Single Display**: Use a single, unambiguous display utility per element.
- **No Raw Emojis**: Use Lucide React SVG icons exclusively.

---

## 📄 License
Commercial proprietary software for **MKK Fireworks, Sivakasi**. All rights reserved.
