import type { Metadata } from "next";
import { ProductSchema } from "@/lib/types";
import productsData from "@/data/products.json";
import giftBoxesData from "@/data/giftBoxes.json";
import { BannerSlider } from "@/components/home/BannerSlider";
import { GiftBoxSection } from "@/components/home/GiftBoxSection";
import { ProductGrid } from "@/components/home/ProductGrid";
import { SeoContentSection } from "@/components/home/SeoContentSection";
import { COMPANY_DETAILS } from "@/config/site";

// SEO Metadata
export const metadata: Metadata = {
  title: `Buy Sivakasi Crackers Online Wholesale & Retail | ${COMPANY_DETAILS.name}`,
  description:
    "Buy 100+ premium Sivakasi crackers, sparklers, sky shots, rockets, and gift box combos online at flat 90% wholesale discount. Fast transport dispatch across Tamil Nadu, Kerala, and Bangalore. Minimum order ₹3,000.",
  keywords: [
    "buy crackers online",
    "Sivakasi crackers online purchase",
    "Diwali fireworks Sivakasi 2026",
    "sparklers online",
    "sky shots buy",
    "gift box crackers",
    "bijili crackers wholesale",
    "flower pots Sivakasi",
    "Tamil Nadu crackers delivery",
    "Kerala crackers delivery",
    "Bangalore crackers delivery",
  ],
  alternates: {
    canonical: COMPANY_DETAILS.canonicalUrl,
  },
  openGraph: {
    url: COMPANY_DETAILS.canonicalUrl,
    title: `Buy Sivakasi Crackers Online Wholesale & Retail | ${COMPANY_DETAILS.name}`,
    description:
      "100+ fireworks products – sparklers, sky shots, rockets, gift boxes. Best prices with Sivakasi Direct Sale. Delivery across Tamil Nadu, Kerala, and Bangalore.",
  },
};

// Data (validated at build time)
const products = productsData.map((p) => ProductSchema.parse(p));
const giftBoxes = giftBoxesData.map((g) => ProductSchema.parse(g));

// Page
/**
 * Home page – server component.
 * Validates static JSON data, then renders client components for interactivity.
 */
export default function HomePage() {
  return (
    <>
      {/* Hero banner */}
      <BannerSlider />

      {/* Gift box combos */}
      <GiftBoxSection giftBoxes={giftBoxes} />

      {/* Main product grid with filters, sort, infinite scroll */}
      <ProductGrid products={products} />

      {/* Sivakasi Wholesale Guide, ordering workflow & FAQ */}
      <SeoContentSection />
    </>
  );
}
