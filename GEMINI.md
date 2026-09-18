# MKK Fireworks – Antigravity Project Guide & Instructions

## Project Overview
**MKK Fireworks** is a high-performance, festive fireworks e-commerce platform for Sivakasi direct factory wholesale and retail sales.

- **Framework**: Next.js 16 (App Router) with React 19 and TypeScript 5
- **Styling**: Tailwind CSS v4 with PostCSS
- **State Management**: Zustand with `localStorage` persistence (`app/_store/cartStore.ts`)
- **Animation & Motion**: Framer Motion, Swiper 11, and AOS (Animate on Scroll)
- **PDF & Forms**: jsPDF + jspdf-autotable (client-side estimate & invoice generation), Zod form validation
- **Theme**: Festive Warm Light Theme (`#FFFBF0`, Crimson `#C8102E`, Golden Yellow `#FFD700`, Amber `#FF6B00`)

---

## Developer Commands
```bash
# Run local development server
npm run dev

# Build production bundle
npm run build

# Run linter
npm run lint
```

---

## Tailwind CSS Rules & Guidelines (Strictly Enforced)
Always follow these Tailwind CSS rules across all files:

1. **Linear Gradients**:
   - Do **NOT** use `bg-gradient-to-*` (legacy).
   - **Always** use `bg-linear-to-*` (e.g., `bg-linear-to-r`, `bg-linear-to-br`, `bg-linear-to-b`).

2. **Equal Width & Height (`size-{n}`)**:
   - Whenever width and height are identical, do **NOT** write `w-{n} h-{n}`.
   - **Always** use `size-{n}` (e.g., `size-10` instead of `w-10 h-10`, `size-8` instead of `w-8 h-8`).

3. **Standard Spacing Scale ($px / 4$)**:
   - Do **NOT** use arbitrary pixel brackets like `w-[40px]` or `min-w-[20px]`.
   - Divide pixels by 4 to map to standard units:
     - `w-[40px]` $\rightarrow$ `w-10`
     - `w-[24px]` $\rightarrow$ `w-6`
     - `min-w-[20px]` $\rightarrow$ `min-w-5`
     - `min-h-[1.25rem]` $\rightarrow$ `min-h-5` ($20px$)
     - `min-h-[2rem]` $\rightarrow$ `min-h-8` ($32px$)
     - `min-h-[2.5rem]` $\rightarrow$ `min-h-10` ($40px$)

4. **Aspect Ratio & Z-Index Utilities**:
   - Use standard classes without brackets:
     - `aspect-[4/3]` $\rightarrow$ `aspect-4/3`
     - `z-[999]` $\rightarrow$ `z-999`

5. **Single Display Style per Element**:
   - Do **NOT** combine multiple conflicting display utilities on a single element (e.g., avoid `block ... flex items-center`).
   - Use a single, unambiguous display property (e.g., `flex items-center gap-1`).

---

## Core Business & UX Conventions

1. **Product Cards & Catalog**:
   - Full product titles are displayed without truncation across product cards, gift box cards, and cart items.
   - Equal card heights across rows with responsive grid (2 columns on mobile, 3 on tablet, 4 on desktop, 5 on wide screens) using flex column layout with bottom actions pinned (`mt-auto`).
   - Zero card hover translate jumps; clean border and shadow hover transitions.
   - Real-time search, category filtering, price sorting, and infinite scroll.

2. **Cart & Stepper Behavior**:
   - Default quantity is `0` when a product is unselected or removed.
   - Stepper displays `0` when item is not in cart, transitioning smoothly to `1` when added.
   - Quantity increases/decreases dynamically sync with the persistent Zustand store.

3. **Gift Box Slider**:
   - Matches product list grid column scale (`2` on mobile, `3` on small screens/tablets, `4` on medium screens, `5` on laptop/desktop).
   - Container has `overflow-hidden` so corner/partial peek slides are hidden.
   - Price pills (`From ₹99`, `From ₹499`, etc.) support horizontal touch swipe on mobile.
   - Floating theme-colored SVG navigation buttons with smooth micro-hover animations.

4. **Lightbox Preview Modal**:
   - Built to match the spring modal architecture of `OrderModal` (`type: "spring", stiffness: 350, damping: 26`).
   - Locks scroll cleanly while preserving the exact window scroll position without jumping to top.
   - Thumbnail strip, navigation arrows (`ChevronLeft`, `ChevronRight`), and photo counter (`Photo X of Y`) are conditionally rendered **only when multiple images are found** (`images.length > 1`).

5. **Minimum Order & Factory Checkout**:
   - Minimum order value is ₹3,000 for direct Sivakasi factory dispatch.
   - Below ₹3,000: Shows dynamic progress bar with shortfall amount and active "Add More to Order Now" CTA.
   - Above ₹3,000: Enables "Order Now" modal checkout.

6. **Dual PDF Generation Engine**:
   - **Festive Estimate PDF**: Generated for orders $\ge ₹3,000$, rich festive colors (Crimson `#C8102E`, Golden Yellow `#FFD700`, Warm Ivory `#FFFBF0`), `#` numbering, native `₹` symbol, no size limit.
   - **Final Order Invoice PDF**: Clean monochrome layout, strictly **$\le 40\text{ KB}$** (measured at **~17.85 KB**) with Deflate compression (`compress: true`) for rapid email transmission.
   - Native Indian Rupee (`₹` U+20B9) rendered via embedded Roboto TrueType font.

7. **Order Modal & Delivery Scope**:
   - Checkout is streamlined to "Order Confirmation".
   - Prominent delivery notice: **Delivery is strictly within Tamil Nadu** via Sivakasi transport hubs.
   - Form fields: Name, Phone, Email (mandatory with regex validation), Address, City/District, Pincode.

8. **Navigation & Floating Elements**:
   - Floating Cart FAB is visible **only** on the catalog page (`/`) and automatically hidden on `/cart`.
   - Hero slider and gift box carousel use custom theme-colored SVG chevrons (`ChevronLeft` / `ChevronRight`).

9. **Icons & Styling Policy**:
   - **Zero Raw Emojis**: Use Lucide React SVG icons only.
   - Use **AOS** (`data-aos="..."`) for scroll-triggered animations.
