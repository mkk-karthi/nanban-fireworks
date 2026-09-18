// Brand & Contact
export const BRAND = {
  name: "MKK Fireworks",
  tagline: "Light Up Your Celebrations!",
  email: "mkkfireworks@gmail.com",
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  address: "123, Market Street, Sivakasi, Tamil Nadu – 626 123",
} as const;

export const CONTACT = BRAND;

// Order Config
export const ORDER_CONFIG = {
  /** Master switch to enable / disable order taking */
  isOrderingEnabled: true,
  /** Message displayed when orders are disabled */
  ordersDisabledMessage:
    "We are currently not taking new orders. Bookings will reopen soon. For urgent bulk enquiries, please reach out via phone or WhatsApp.",
  /** Minimum payable amount (₹) required to place an order or generate estimate */
  minimumOrderAmount: 3000,
  freeDeliveryAbove: 5000,
} as const;

// Pagination
export const PAGINATION = {
  /** Number of products to show per infinite-scroll batch */
  productsPerPage: 20,
} as const;

// Product Categories
export const CATEGORIES = [
  "All",
  "Sparklers",
  "Ground Chakkar",
  "Sky Shots",
  "Rockets",
  "Flower Pots",
  "Bijili Crackers",
  "Fancy Items",
  "Bombs",
  "Snake Tablets",
  "Novelty Items",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Sort Options
export const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A – Z", value: "name-asc" },
  { label: "Best Discount", value: "discount-desc" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

// Banner Slides
export const BANNER_SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=1920&h=700&fit=crop&auto=format",
    title: "Diwali Grand Sale",
    subtitle: "Up to 30% off on all fireworks",
    cta: "Shop Now",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1920&h=700&fit=crop&auto=format",
    title: "Sparkle the Night",
    subtitle: "Premium sparklers for every celebration",
    cta: "Explore",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=1920&h=700&fit=crop&auto=format",
    title: "Sky Show Collection",
    subtitle: "Aerial shells & sky shots at best prices",
    cta: "View Collection",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&h=700&fit=crop&auto=format",
    title: "Gift Box Deals",
    subtitle: "Curated fireworks gift packs from ₹99",
    cta: "See Gift Boxes",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1920&h=700&fit=crop&auto=format",
    title: "Celebrate in Style",
    subtitle: "Quality crackers, trusted since 2005",
    cta: "Shop All",
  },
] as const;
