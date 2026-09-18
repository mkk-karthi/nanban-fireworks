import { z } from "zod";

// Product
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  /** Multiple image URLs (optional). Show lightbox when clicked. */
  images: z.array(z.string()).optional().default([]),
  /** Product can belong to multiple categories */
  category: z.array(z.string()),
  actualPrice: z.number().positive(),
  discountedPrice: z.number().positive(),
  /** True for curated gift box products shown in the gift box section */
  isGiftBox: z.boolean().optional().default(false),
});

export type Product = z.infer<typeof ProductSchema>;

// Cart Item
export const CartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

export type CartItem = z.infer<typeof CartItemSchema>;

export interface CartProductItem {
  product: Product;
  quantity: number;
}

export interface CartTotals {
  actualTotal: number;
  discountedTotal: number;
  totalSaved: number;
  itemCount: number;
}

// Filter State
export interface FilterState {
  category: string;
  sort: string;
  search: string;
}
