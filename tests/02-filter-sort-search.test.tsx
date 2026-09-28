import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductGrid } from "@/components/home/ProductGrid";
import { ProductSchema, type Product } from "@/lib/types";
import rawProducts from "@/data/products.json";

const products: Product[] = rawProducts.map((p) => ProductSchema.parse(p));

describe("02: Product Filtering, Live Search & Sorting Interactions", () => {
  it("filters products by category chip click", () => {
    render(<ProductGrid products={products} />);

    // Click "Sparklers" category button
    const sparklersChip = screen.getByRole("tab", { name: "Sparklers" });
    fireEvent.click(sparklersChip);

    // Verify all displayed product cards belong to Sparklers category
    const sparklerProducts = products.filter((p) =>
      p.category.some((c) => c.toLowerCase() === "sparklers"),
    );
    expect(sparklerProducts.length).toBeGreaterThan(0);

    // At least the first sparkler product heading is visible
    expect(screen.getByRole("heading", { name: sparklerProducts[0].name })).toBeInTheDocument();

    // A non-sparkler product heading should not be rendered
    const nonSparkler = products.find(
      (p) => !p.category.some((c) => c.toLowerCase() === "sparklers"),
    );
    if (nonSparkler) {
      expect(screen.queryByRole("heading", { name: nonSparkler.name })).not.toBeInTheDocument();
    }

    // Switch back to "All"
    const allChip = screen.getByRole("tab", { name: "All" });
    fireEvent.click(allChip);
    if (nonSparkler) {
      // Once All is clicked, the non-sparkler product heading is now back
      expect(screen.getByRole("heading", { name: nonSparkler.name })).toBeInTheDocument();
    }
  });

  it("filters products by search input term", () => {
    render(<ProductGrid products={products} />);

    const searchInput = screen.getByRole("searchbox", { name: /Search products/i });

    // Search for a specific product name query
    const targetProduct = products[0];
    const searchTerm = targetProduct.name.split(" ")[0]; // e.g. "Electric" or "Standard"

    fireEvent.change(searchInput, { target: { value: searchTerm } });

    // Target product heading is rendered
    expect(screen.getByRole("heading", { name: targetProduct.name })).toBeInTheDocument();

    // Completely unrelated product should not be rendered
    const unrelatedProduct = products.find(
      (p) =>
        !p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !p.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !p.category.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase())),
    );
    if (unrelatedProduct) {
      expect(
        screen.queryByRole("heading", { name: unrelatedProduct.name }),
      ).not.toBeInTheDocument();
    }

    // Clear search
    fireEvent.change(searchInput, { target: { value: "" } });
    if (unrelatedProduct) {
      expect(screen.getByRole("heading", { name: unrelatedProduct.name })).toBeInTheDocument();
    }
  });

  it("sorts products by price low to high, high to low, and name A-Z", () => {
    render(<ProductGrid products={products} />);

    const sortSelect = screen.getByRole("combobox", { name: /Sort products/i });

    // Sort by Price: Low to High
    fireEvent.change(sortSelect, { target: { value: "price-asc" } });

    const sortedByPriceAsc = [...products].sort((a, b) => a.discountedPrice - b.discountedPrice);
    // The lowest priced product should be rendered first
    expect(screen.getByRole("heading", { name: sortedByPriceAsc[0].name })).toBeInTheDocument();

    // Sort by Price: High to Low
    fireEvent.change(sortSelect, { target: { value: "price-desc" } });

    const sortedByPriceDesc = [...products].sort((a, b) => b.discountedPrice - a.discountedPrice);
    expect(screen.getByRole("heading", { name: sortedByPriceDesc[0].name })).toBeInTheDocument();

    // Sort by Name: A to Z
    fireEvent.change(sortSelect, { target: { value: "name-asc" } });

    const sortedByNameAsc = [...products].sort((a, b) => a.name.localeCompare(b.name));
    expect(screen.getByRole("heading", { name: sortedByNameAsc[0].name })).toBeInTheDocument();
  });

  it("loads more fireworks progressively via infinite scroll / load more", () => {
    render(<ProductGrid products={products} />);

    // Initially loads the first page of 20 products
    const initialHeadings = screen.getAllByRole("heading", { level: 3 });
    expect(initialHeadings.length).toBe(20);

    // "Load More Fireworks" button is present because there are 143 products
    const loadMoreBtn = screen.getByRole("button", { name: /Load more Crackers/i });
    expect(loadMoreBtn).toBeInTheDocument();

    // Click load more
    fireEvent.click(loadMoreBtn);

    // Next page loads immediately: 40 products should now be rendered
    const nextHeadings = screen.getAllByRole("heading", { level: 3 });
    expect(nextHeadings.length).toBe(40);
  });
});
