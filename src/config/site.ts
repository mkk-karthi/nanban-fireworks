// Site and Company Configuration
// Central configuration for brand details, ordering rules, categories, and banners

// Company Details
export const COMPANY_DETAILS = {
  name: "MKK Fireworks",
  shortName: "MKK",
  tagline: "Light Up Your Celebrations!",
  subtitle: "Sivakasi Direct Factory Wholesale & Retail Fireworks",
  description:
    "Buy premium quality fireworks, sparklers, sky shots, rockets, and gift boxes at MKK Fireworks. Best wholesale prices direct from Sivakasi factory. Minimum order ₹3,000.",
  establishedYear: 2005,
  email: "mkkfireworks@gmail.com",
  phone: "+91 98765 43210",
  phoneClean: "+919876543210",
  whatsapp: "+91 98765 43210",
  whatsappClean: "+919876543210",
  whatsappUrl: "https://wa.me/919876543210",
  address: {
    line1: "123, Market Street",
    city: "Sivakasi",
    state: "Tamil Nadu",
    pincode: "626123",
    country: "India",
    formatted: "123, Market Street, Sivakasi, Tamil Nadu – 626 123",
  },
  developer: {
    name: "MKK Creation",
    url: "https://mkkcreation.com",
  },
  siteUrl: "https://nanban-fireworks.pages.dev",
} as const;

// Brand and Contact Quick Access
export const BRAND = {
  name: COMPANY_DETAILS.name,
  tagline: COMPANY_DETAILS.tagline,
  email: COMPANY_DETAILS.email,
  phone: COMPANY_DETAILS.phone,
  whatsapp: COMPANY_DETAILS.whatsapp,
  address: COMPANY_DETAILS.address.formatted,
} as const;

export const CONTACT = BRAND;

// Order and Delivery Configuration
export const ORDER_CONFIG = {
  // Master toggle to accept or pause orders
  isOrderingEnabled: true,
  // Customer notification shown when ordering is paused
  ordersDisabledMessage:
    "We are currently not taking new orders. Bookings will reopen soon. For urgent bulk enquiries, please reach out via phone or WhatsApp.",
  // Minimum order amount in Rupees for factory dispatch
  minimumOrderAmount: 3000,
  // Free delivery threshold in Rupees
  freeDeliveryAbove: 5000,
  // Transport delivery notice
  deliveryRegionNotice: "Delivery is strictly within Tamil Nadu via Sivakasi transport hubs.",
  dispatchHub: "Sivakasi Direct Factory Dispatch",
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

// Pagination Settings
export const PAGINATION = {
  // Number of products loaded per batch in catalog
  productsPerPage: 20,
} as const;

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
