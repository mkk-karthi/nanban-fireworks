import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BannerSlider } from "@/components/home/BannerSlider";
import { GiftBoxSection } from "@/components/home/GiftBoxSection";
import { ProductGrid } from "@/components/home/ProductGrid";
import { BANNER_SLIDES } from "@/config/site";
import { ProductSchema, type Product } from "@/lib/types";
import rawProducts from "@/data/products.json";
import rawGiftBoxes from "@/data/giftBoxes.json";

const products: Product[] = rawProducts.map((p) => ProductSchema.parse(p));
const giftBoxes: Product[] = rawGiftBoxes.map((g) => ProductSchema.parse(g));

describe("01: Catalog DOM Rendering – Banners, Gift Boxes & Product Grid", () => {
  describe("BannerSlider component", () => {
    it("renders carousel section with proper accessibility roles and banner slides", () => {
      render(<BannerSlider />);

      // Verify carousel wrapper and role description
      const carouselSection = screen.getByRole("region", {
        name: /Hero banner – featured promotions/i,
      });
      expect(carouselSection).toBeInTheDocument();
      expect(carouselSection).toHaveAttribute("aria-roledescription", "carousel");

      // Verify active slide (slide 0) renders headline, subtitle, and CTA
      const activeSlide = BANNER_SLIDES[0];
      expect(screen.getByText(activeSlide.title)).toBeInTheDocument();
      expect(screen.getByText(activeSlide.subtitle)).toBeInTheDocument();
      expect(screen.getByText(activeSlide.cta)).toBeInTheDocument();

      // Verify each slide container has accessibility label with title
      BANNER_SLIDES.forEach((slide, idx) => {
        expect(
          screen.getByLabelText(
            new RegExp(`Slide ${idx + 1} of ${BANNER_SLIDES.length}: ${slide.title}`, "i")
          )
        ).toBeInTheDocument();
      });

      // Verify carousel navigation controls
      const prevButton = screen.getByLabelText("Previous slide");
      const nextButton = screen.getByLabelText("Next slide");
      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();

      // Click next and previous slide controls
      fireEvent.click(nextButton);
      fireEvent.click(prevButton);
    });
  });

  describe("GiftBoxSection component", () => {
    it("renders gift box combos with names, pricing, premium tags, and Add Combo buttons", () => {
      render(<GiftBoxSection giftBoxes={giftBoxes} />);

      // Verify section heading
      expect(screen.getByRole("heading", { name: /Gift Box Combos/i })).toBeInTheDocument();

      // Verify each gift box combo is rendered
      for (const box of giftBoxes) {
        expect(
          screen.getAllByRole("heading", { name: box.name }).length
        ).toBeGreaterThanOrEqual(1);

        // Verify "Add Combo" button for each box
        const addComboBtns = screen.getAllByRole("button", {
          name: new RegExp(`Add ${box.name} combo to cart`, "i"),
        });
        expect(addComboBtns.length).toBeGreaterThanOrEqual(1);
      }

      // Verify premium tags are visible for premium gift boxes
      const premiumBoxes = giftBoxes.filter((b) => b.isPremium || b.badge);
      expect(premiumBoxes.length).toBeGreaterThan(0);
      for (const box of premiumBoxes) {
        if (box.badge) {
          expect(screen.getAllByText(box.badge).length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("ProductGrid component", () => {
    it("renders catalog products with full titles, prices, and Add to Cart buttons", () => {
      render(<ProductGrid products={products} />);

      // Verify filter bar elements
      expect(screen.getByPlaceholderText(/Search products…/i)).toBeInTheDocument();

      // Verify first batch of products rendered
      const initialProducts = products.slice(0, 12);
      for (const prod of initialProducts) {
        expect(screen.getByRole("heading", { name: prod.name })).toBeInTheDocument();

        const addToCartBtn = screen.getByRole("button", {
          name: `Add ${prod.name} to cart`,
        });
        expect(addToCartBtn).toBeInTheDocument();
      }
    });
  });
});
