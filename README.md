# 🎆 MKK Fireworks – Premium Sivakasi Factory E-Commerce Platform

A high-performance, festive fireworks e-commerce platform built for **MKK Fireworks (Sivakasi)** direct factory wholesale and retail dispatch across Tamil Nadu.

Powered by **Next.js 16 (App Router)**, **React 19**, **TypeScript 5**, **Tailwind CSS v4**, **Zustand**, **Framer Motion**, **Swiper 11**, and **jsPDF**.

---

## 🚀 Key Features & Architectural Highlights

### 1. Festive Design System & Lightbox Modal
- **Warm Festive Palette**: Warm Ivory `#FFFBF0`, Crimson `#C8102E`, Golden Yellow `#FFD700`, and Amber `#FF6B00`.
- **Spring-Animated Lightbox Modal**: High-contrast interactive lightbox gallery with zero background scroll jumping, navigation chevrons, and dynamic multi-image thumbnail strips.
- **Zero Raw Emojis**: Crisp, accessible SVG iconography powered entirely by [Lucide React](https://lucide.dev/).

### 2. Product Catalog & Curated Combos
- **Curated Gift Box Assortments**: Swiper carousel with mobile horizontal touch-panning for price pills (`From ₹99`, `From ₹499`, etc.).
- **Dynamic Filter Grid**: Instant live search, category chips, sort options, and infinite scroll pagination with progressive skeleton loaders.
- **Equal Row Height Architecture**: Uniform card heights across every grid row with pinned bottom actions (`mt-auto`) and compact, gap-free product titles.

### 3. Persistent Cart & Order Management
- **Zustand State Store**: Fully hydrated and persisted with `localStorage`.
- **Smart Stepper Controls**: Starts at `0` for unadded items, transitioning to reactive quantity controls upon interaction.
- **Floating Cart FAB**: Automatically appears on the catalog page and hides cleanly on `/cart`.
- **Master Booking Switch**: Global `ORDER_CONFIG.isOrderingEnabled` flag to pause and resume bookings seamlessly with user-facing alerts.

### 4. Dual PDF Generation Engine
- **Festive Estimate PDF**:
  - Available for orders $\ge ₹3,000$.
  - Rich festive color theme (Crimson `#C8102E`, Golden Yellow `#FFD700`, Warm Ivory `#FFFBF0`).
  - Native Indian Rupee (`₹`) symbol rendered with embedded **Roboto** font.
  - No customer details, `#` item numbering, and factory dispatch terms.
- **Final Order Invoice PDF**:
  - Compressed using Deflate stream compression (`compress: true`) strictly **$\le 40\text{ KB}$** (measured at **~17.85 KB**) for rapid email transmission.
  - Professional monochrome design with customer & delivery details, unique collision-resistant invoice numbers (`MKK-YYYYMMDD-HHMMSS-XXXX`), itemized breakdown, and non-overlapping terms/totals.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16.3.5 (App Router, Turbopack) |
| **Runtime & UI** | React 19, TypeScript 5 |
| **Styling** | Tailwind CSS v4 with PostCSS |
| **State Management** | Zustand (with persistent localStorage middleware) |
| **Animations & Carousels** | Framer Motion, Swiper 11, AOS (Animate on Scroll) |
| **Icons** | Lucide React |
| **PDF Generation** | jsPDF & jspdf-autotable (client-side) |
| **Typography** | Google Fonts (Poppins, Inter) & Roboto TrueType Font |

---

## 📁 Repository Structure

```
fireworks/
├── .agents/
│   └── rules/
│       └── tailwind-rules.md     # Antigravity Tailwind CSS v4 guidelines
├── app/
│   ├── _components/
│   │   ├── common/               # Lightbox, CartFab, AosInitializer, QuantitySelector
│   │   ├── home/                 # BannerSlider, GiftBoxSection, ProductCard, ProductGrid, ProductFilters
│   │   └── layout/               # Header, Footer
│   ├── _data/                    # products.json, giftBoxes.json
│   ├── _hooks/                   # useInfiniteScroll.ts
│   ├── _lib/                     # types.ts, constants.ts, utils.ts, pdfFont.ts, pdfGenerator.ts
│   ├── _store/                   # cartStore.ts (Zustand persistent store)
│   ├── cart/                     # /cart page, CartItem, CartSummary, OrderModal
│   ├── globals.css               # Tailwind v4 directives, scrollbar rules, Swiper themes
│   ├── layout.tsx                # Root layout with header, footer, & fonts
│   └── page.tsx                  # Home catalog page
├── public/                       # Favicons, static assets, and Roboto-Regular.ttf
├── GEMINI.md                     # Antigravity project guide & strict conventions
├── README.md                     # Comprehensive project documentation
└── package.json                  # Dependencies & scripts
```

---

## ⚡ Developer Workflow

### Installation
```bash
npm install
```

### Local Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application in development.

### Production Build & Lint
```bash
# Run ESLint validation
npm run lint

# Build optimized production bundle
npm run build

# Start production server
npm run start
```

---

## 📋 Strict Tailwind CSS v4 Guidelines

The codebase strictly adheres to Tailwind CSS v4 conventions:
- **Gradients**: Always use `bg-linear-to-*` (e.g., `bg-linear-to-r`, `bg-linear-to-br`).
- **Equal Dimensions**: Always use `size-{n}` instead of `w-{n} h-{n}` (e.g., `size-10`, `size-8`).
- **Standard Scale**: Avoid arbitrary bracket dimensions (e.g., use `w-10`, `min-w-5`, `min-h-5`).
- **Aspect Ratio & Z-Index**: Use unbracketed utilities (`aspect-4/3`, `z-999`).
- **Display**: Use a single unambiguous display property per element (e.g., `flex items-center gap-1`).

---

## 📄 License
Private commercial project for **MKK Fireworks, Sivakasi**. All rights reserved.
