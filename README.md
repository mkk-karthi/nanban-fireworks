# 🎆 Nanban Crackers – Sivakasi Factory Direct E-Commerce

A high-performance festive fireworks e-commerce platform for **Nanban Crackers** — Sivakasi direct factory wholesale and retail dispatch across Tamil Nadu.

🌐 **Live**: [nanbancrackers.mkkcreation.com](https://nanbancrackers.mkkcreation.com)

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Runtime & UI** | React 19, TypeScript 5 |
| **Styling** | Tailwind CSS v4 with PostCSS |
| **State** | Zustand (persistent localStorage) |
| **Animations** | Framer Motion, Swiper 11, AOS |
| **Icons** | Lucide React |
| **PDF Engine** | jsPDF & jspdf-autotable (client-side) |
| **Testing** | Jest, React Testing Library |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router (layout, pages, sitemap, robots)
├── components/
│   ├── common/             # ImageWithFallback, Lightbox, QuantitySelector, CartFab, AosInitializer
│   ├── home/               # BannerSlider, GiftBoxSection, ProductCard, ProductGrid, ProductFilters
│   ├── cart/               # CartItem, CartSummary, OrderModal
│   └── layout/             # Header, Footer
├── config/site.ts          # Single source of truth (brand, banners, order config)
├── data/                   # products.json, giftBoxes.json
├── hooks/                  # useInfiniteScroll, usePrefersReducedMotion
├── lib/                    # PDF generator, types, utilities
└── store/cartStore.ts      # Zustand persistent cart
tests/                      # 6 Jest + RTL test suites
public/images/              # Product images, banners, logo (WebP optimized)
```

---

## Quick Start

```bash
npm install              # Install dependencies
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
```

---

## Commands

```bash
npm run dev              # Local development server
npx tsc --noEmit         # TypeScript type check
npm run lint             # ESLint validation
npm test                 # Run all tests
npm run test:watch       # Tests in watch mode
npm run build            # Production build
```

---

## Features

- **100+ Products** with 90% wholesale discount, real-time search, category filters, price sorting, and infinite scroll
- **14 Curated Gift Box Combos** starting from ₹350 with carousel showcase
- **4 Festive Promotional Banners** (local WebP, auto-rotating Swiper carousel)
- **Smart Cart** with reactive quantity stepper, Zustand persistence, and auto-discount calculations
- **₹3,000 Minimum Order** enforcement with visual progress bar
- **Dual PDF Generation** — Festive Estimate (branded) and Order Invoice (monochrome, ≤ 40 KB)
- **Lightbox Gallery** with multi-image navigation, keyboard controls, and fallback placeholders
- **Free Delivery** across Tamil Nadu via Sivakasi transport hubs
- **Accessibility** — ARIA roles, reduced-motion support, semantic HTML
- **SEO Optimized** — Dynamic sitemap, robots.txt, Open Graph meta, structured data

---

## Testing

6 comprehensive test suites covering catalog rendering, filtering/sorting, cart operations, minimum order enforcement, checkout flow, and lightbox behavior.

```bash
npm test
```

---

## Developed By

**[MKK Creation](https://mkkcreation.com)**

---

## License

Commercial proprietary software for **Nanban Crackers, Sivakasi**. All rights reserved.
