# MKK Fireworks – Antigravity Project Guide & Instructions

## Project Overview
**MKK Fireworks** is a festive fireworks e-commerce platform for Sivakasi direct factory wholesale and retail dispatch across Tamil Nadu.

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
# Run local development server
npm run dev

# Run TypeScript type check
npx tsc --noEmit

# Run ESLint linter
npm run lint

# Run automated tests (Jest + React Testing Library)
npm test

# Run tests in watch mode
npm run test:watch

# Build production bundle
npm run build
```

---

## Testing Architecture & Conventions

1. **Next.js & React 19 Testing Stack**:
   - Built on `next/jest.js` (`jest.config.mjs`) with automatic SWC transformation and `@/*` alias resolution.
   - Setup file `jest.setup.ts` polyfills `TextEncoder`, `TextDecoder`, `window.matchMedia`, `ResizeObserver`, `IntersectionObserver`, and mocks `next/image`, `swiper/react`, `aos`, and `jsPDF`.

2. **DOM Queries & Accessibility First**:
   - Query elements by accessible role (`getByRole("button")`, `getByRole("heading")`, `getByRole("searchbox")`).
   - Use accessible names rather than brittle CSS selectors or class names.

3. **Standard Test Suites (`tests/`)**:
   - `01-catalog-render.test.tsx`: Banners, Gift Box combos, and Product Grid DOM rendering.
   - `02-filter-sort-search.test.tsx`: Live search, category filtering chips, and price/name sorting.
   - `03-cart-stepper-discounts.test.tsx`: Add to cart, reactive stepper transitions (`-`, `qty`, `+`), Zustand persistence, and exact discount calculations.
   - `04-minimum-order-estimate-pdf.test.tsx`: ₹3,000 threshold enforcement, progress bar, and Festive Estimate PDF download.
   - `05-order-checkout-invoice-pdf.test.tsx`: Checkout modal validation, order submit, celebratory view, and final Invoice PDF download.
   - `06-lightbox-and-fallback.test.tsx`: Lightbox opening, multiple image navigation, keyboard controls, temp image fallback, and lightbox prevention when images are unavailable.

---

## Tailwind CSS Rules & Guidelines (Strictly Enforced)

1. **Linear Gradients**:
   - **Always** use `bg-linear-to-*` (e.g., `bg-linear-to-r`, `bg-linear-to-br`).
   - Do **NOT** use `bg-gradient-to-*`.

2. **Equal Width & Height (`size-{n}`)**:
   - **Always** use `size-{n}` whenever width and height are equal (e.g., `size-10` instead of `w-10 h-10`).

3. **Standard Spacing Scale ($px / 4$)**:
   - Do **NOT** use arbitrary pixel brackets like `w-[40px]` or `min-w-[20px]`.
   - Map to standard Tailwind spacing scale (`w-10`, `min-w-5`, `min-h-5`, `min-h-8`, `min-h-10`).

4. **Aspect Ratio & Z-Index Utilities**:
   - Use standard classes without brackets: `aspect-4/3`, `aspect-square`, `z-999`.

5. **Single Display Style per Element**:
   - Avoid conflicting display properties on the same element (e.g. use `flex items-center gap-1`).

6. **No Raw Emojis**:
   - Use Lucide React SVG icons exclusively across the application.

---

## Core Business & UX Conventions

1. **Product Cards & Catalog**:
   - Full product titles displayed without truncation.
   - Equal card heights across rows with pinned bottom actions (`mt-auto`).
   - Clean border and shadow hover transitions without layout shifts.
   - Real-time search, category filtering, price sorting, and infinite scroll.

2. **Image Loading & Lightbox Safety**:
   - Products with valid images open full-window `<Lightbox />` on image click or zoom trigger.
   - Multi-image products support Next/Prev arrows, keyboard navigation, and thumbnail strip.
   - When images are absent (`images: []`) or fail to load (`onError`), `<ImageWithFallback />` displays a themed placeholder with a Lucide `Package` icon and accessible label (`${product.name} – image unavailable`).
   - In fallback state, the zoom trigger is omitted, image container button role is disabled, and Lightbox opening is blocked.

3. **Cart & Stepper Behavior**:
   - Default quantity is `0` when an item is not in cart.
   - Stepper displays `0` and transitions smoothly to `1` when added.
   - State persists via Zustand and `localStorage`.

4. **Minimum Order & Factory Checkout**:
   - Minimum order threshold is ₹3,000 for direct Sivakasi transport dispatch.
   - Below ₹3,000: Displays shortfall progress bar and "Add More" action.
   - Above ₹3,000: Enables factory order checkout modal and festive PDF estimate generation.

5. **Dual PDF Generation Engine**:
   - **Festive Estimate PDF**: Generated for orders $\ge ₹3,000$ with festive branding and native `₹` symbol.
   - **Order Invoice PDF**: Clean monochrome layout strictly **$\le 40\text{ KB}$** with Deflate compression for rapid transmission.

6. **Delivery Scope**:
   - Delivery is strictly within **Tamil Nadu** via Sivakasi transport hubs.
