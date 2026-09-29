import type { Metadata } from "next";
import { ProductSchema } from "@/lib/types";
import productsData from "@/data/products.json";
import giftBoxesData from "@/data/giftBoxes.json";
import { BannerSlider } from "@/components/home/BannerSlider";
import { GiftBoxSection } from "@/components/home/GiftBoxSection";
import { ProductGrid } from "@/components/home/ProductGrid";
import { COMPANY_DETAILS } from "@/config/site";

// SEO Metadata
export const metadata: Metadata = {
  title: `Shop Premium Crackers Online | ${COMPANY_DETAILS.name} Sivakasi`,
  description:
    "Browse 100+ premium fireworks products: sparklers, sky shots, rockets, bijili crackers, flower pots, gift boxes and more. Sivakasi Direct Sale pricing.",
  keywords: [
    "buy crackers online",
    "Diwali fireworks Sivakasi",
    "sparklers online",
    "sky shots buy",
    "gift box crackers",
    "bijili crackers wholesale",
    "flower pots Sivakasi",
  ],
  alternates: {
    canonical: COMPANY_DETAILS.siteUrl,
  },
  openGraph: {
    url: COMPANY_DETAILS.siteUrl,
    title: `Shop Premium Crackers Online | ${COMPANY_DETAILS.name} Sivakasi`,
    description: "100+ fireworks products – sparklers, sky shots, rockets, gift boxes. Best prices with Sivakasi Direct Sale.",
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
    </>
  );
}
