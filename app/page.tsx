import { ProductSchema } from "./_lib/types";
import productsData from "./_data/products.json";
import giftBoxesData from "./_data/giftBoxes.json";
import { BannerSlider } from "./_components/home/BannerSlider";
import { GiftBoxSection } from "./_components/home/GiftBoxSection";
import { ProductGrid } from "./_components/home/ProductGrid";
import type { Metadata } from "next";

// Metadata
export const metadata: Metadata = {
  title: "MKK Fireworks – Shop Premium Crackers Online | Sivakasi",
  description:
    "Browse 100+ premium fireworks products: sparklers, sky shots, rockets, gift boxes, and more. Competitive prices, fast delivery from Sivakasi.",
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
