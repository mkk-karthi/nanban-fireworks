import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductCard } from "@/components/home/ProductCard";
import { Lightbox } from "@/components/common/Lightbox";
import { useCartStore } from "@/store/cartStore";
import { ProductSchema, type Product } from "@/lib/types";
import rawProducts from "@/data/products.json";

const baseProduct: Product = ProductSchema.parse(rawProducts[0]);

const multiImageProduct: Product = {
  ...baseProduct,
  id: "test-multi-image",
  name: "Mega Multi Sparkler Box",
  images: [
    "https://example.com/sparkler-1.jpg",
    "https://example.com/sparkler-2.jpg",
    "https://example.com/sparkler-3.jpg",
  ],
};

const noImageProduct: Product = {
  ...baseProduct,
  id: "test-no-image",
  name: "Mystery Shell Cracker",
  images: [],
};

const brokenImageProduct: Product = {
  ...baseProduct,
  id: "test-broken-image",
  name: "Broken Image Shell",
  images: ["https://example.com/non-existent-image.jpg"],
};

describe("06: Lightbox Interactions & Fallback Placeholder Logic", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useCartStore.getState().setHasHydrated(true);
  });

  describe("Lightbox Opening & Multiple Image Loading in ProductCard", () => {
    it("opens lightbox on trigger click, loads multiple images, and navigates correctly", () => {
      render(<ProductCard product={multiImageProduct} />);

      // Zoom trigger button is present for products with images
      const zoomTrigger = screen.getByRole("button", {
        name: /View full window image/i,
      });
      expect(zoomTrigger).toBeInTheDocument();

      // Click zoom trigger to open Lightbox
      fireEvent.click(zoomTrigger);

      // Lightbox modal rendered into document.body
      const lightboxModal = document.body;
      expect(lightboxModal).toHaveTextContent(multiImageProduct.name);
      expect(lightboxModal).toHaveTextContent("Photo 1 of 3");

      // Verify navigation arrow buttons exist
      const nextBtn = screen.getByRole("button", { name: /Next image/i });
      const prevBtn = screen.getByRole("button", { name: /Previous image/i });
      expect(nextBtn).toBeInTheDocument();
      expect(prevBtn).toBeInTheDocument();

      // Verify thumbnails are rendered for multiple images
      expect(screen.getByRole("tab", { name: /View image 1/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /View image 2/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /View image 3/i })).toBeInTheDocument();

      // Navigate to next image
      fireEvent.click(nextBtn);
      expect(lightboxModal).toHaveTextContent("Photo 2 of 3");

      // Navigate back to previous image
      fireEvent.click(prevBtn);
      expect(lightboxModal).toHaveTextContent("Photo 1 of 3");

      // Direct thumbnail jump
      fireEvent.click(screen.getByRole("tab", { name: /View image 3/i }));
      expect(lightboxModal).toHaveTextContent("Photo 3 of 3");

      // Close modal
      const closeBtn = screen.getByRole("button", { name: /Close image gallery/i });
      fireEvent.click(closeBtn);
      expect(screen.queryByText("Photo 3 of 3")).not.toBeInTheDocument();
    });

    it("opens lightbox when clicking the image container directly", () => {
      render(<ProductCard product={multiImageProduct} />);

      const imageContainerBtn = screen.getByRole("button", {
        name: `View ${multiImageProduct.name} images`,
      });
      fireEvent.click(imageContainerBtn);

      expect(document.body).toHaveTextContent("Photo 1 of 3");
    });
  });

  describe("Direct Lightbox component behavior", () => {
    it("handles keyboard navigation (Escape, ArrowRight, ArrowLeft)", () => {
      const onClose = jest.fn();
      render(
        <Lightbox
          images={["img1.jpg", "img2.jpg"]}
          isOpen={true}
          onClose={onClose}
          productName="Rocket Shell"
        />
      );

      expect(document.body).toHaveTextContent("Photo 1 of 2");

      // Press ArrowRight
      fireEvent.keyDown(window, { key: "ArrowRight" });
      expect(document.body).toHaveTextContent("Photo 2 of 2");

      // Press ArrowLeft
      fireEvent.keyDown(window, { key: "ArrowLeft" });
      expect(document.body).toHaveTextContent("Photo 1 of 2");

      // Press Escape
      fireEvent.keyDown(window, { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Fallback Image When Image Not Found & Lightbox Prevention", () => {
    it("renders temp placeholder image and does not open lightbox when product has no images", () => {
      render(<ProductCard product={noImageProduct} />);

      // Themed temp placeholder is rendered with accessible role="img"
      const tempPlaceholder = screen.getByRole("img", {
        name: `${noImageProduct.name} – image unavailable`,
      });
      expect(tempPlaceholder).toBeInTheDocument();

      // Zoom trigger is NOT rendered
      expect(
        screen.queryByRole("button", { name: /View full window image/i })
      ).not.toBeInTheDocument();

      // Image container is NOT a button
      expect(
        screen.queryByRole("button", {
          name: `View ${noImageProduct.name} images`,
        })
      ).not.toBeInTheDocument();

      // Attempting to click the placeholder does not open Lightbox
      fireEvent.click(tempPlaceholder);
      expect(screen.queryByText(/Photo \d of/i)).not.toBeInTheDocument();
    });

    it("switches to temp placeholder image and disables lightbox when image fails to load", () => {
      const { container } = render(<ProductCard product={brokenImageProduct} />);

      // Initially, image element exists
      const imgElement = container.querySelector("img")!;
      expect(imgElement).toBeInTheDocument();

      // Simulate remote image loading error
      fireEvent.error(imgElement);

      // Now fallback temp placeholder is shown
      const tempPlaceholder = screen.getByRole("img", {
        name: `${brokenImageProduct.name} – image unavailable`,
      });
      expect(tempPlaceholder).toBeInTheDocument();

      // Lightbox trigger button is no longer present
      expect(
        screen.queryByRole("button", { name: /View full window image/i })
      ).not.toBeInTheDocument();

      // Clicking placeholder does not open Lightbox
      fireEvent.click(tempPlaceholder);
      expect(screen.queryByText(/Photo \d of/i)).not.toBeInTheDocument();
    });
  });
});
