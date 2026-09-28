// Site and Company Configuration
// Central configuration for brand details, ordering rules, categories, and banners

// Company Details
export const COMPANY_DETAILS = {
  name: "Nanban Crackers",
  shortName: "Nanban",
  tagline: "Light Up Your Celebrations!",
  subtitle: "Sivakasi Direct Factory Wholesale & Retail Fireworks",
  description:
    "Buy premium quality fireworks, sparklers, sky shots, rockets, and gift boxes at Nanban Crackers. Best wholesale prices direct from Sivakasi factory. Minimum order ₹3,000.",
  logo: "/images/logo.webp",
  email: "Nanbancrackers0506@gmail.com",
  phone: "+91 98765 43210",
  phoneClean: "+919876543210",
  whatsapp: "+91 98765 43210",
  whatsappClean: "+919876543210",
  whatsappUrl: "https://wa.me/919876543210",
  developer: {
    name: "MKK Creation",
    url: "https://mkkcreation.com",
  },
  siteUrl: "https://nanbancrackers.mkkcreation.com",
} as const;

// Order and Delivery Configuration
export const ORDER_CONFIG = {
  // Master toggle to accept or pause orders
  isOrderingEnabled: true,
  // Customer notification shown when ordering is paused
  ordersDisabledMessage:
    "We are currently not taking new orders. Bookings will reopen soon. For urgent bulk enquiries, please reach out via phone or WhatsApp.",
  // Minimum order amount in Rupees for factory dispatch
  minimumOrderAmount: 3000,
  // Free delivery threshold in Rupees (all orders are free delivery)
  freeDeliveryAbove: 0,
  freeDeliveryText: "Free delivery",
  // Transport delivery notice
  deliveryRegionNotice: "Delivery is strictly within Tamil Nadu via Sivakasi transport hubs.",
  dispatchHub: "Sivakasi Direct Factory Dispatch",
} as const;

// Product Categories
export const CATEGORIES = [
  "All",
  "One Sound Crackers",
  "Giant Crackers",
  "Deluxe Crackers",
  "Bijili Crackers",
  "Flowerpots",
  "Ground Chakkars",
  "Pencils",
  "Twinkling Stars",
  "Rockets",
  "Bombs",
  "Paper Bombs",
  "Garlands",
  "Fancy Items",
  "SPECIAL Fancy Items",
  "Sky Fancy",
  "Sky Multishorts",
  "SKY BLASTER Shots",
  "Sparklers",
  "Matches",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Sort Options
export const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A – Z", value: "name-asc" },
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
    image: "/images/banners/banner1.webp",
    title: "Diwali Grand Wholesale Sale",
    subtitle: "Flat 90% discount on 100+ premium crackers & sky shots",
    cta: "Shop Now",
    ctaLink: "#products",
  },
  {
    id: 2,
    image: "/images/banners/banner2.webp",
    title: "Curated Gift Box Combos",
    subtitle: "14 festive combo packs starting from ₹350 • Flat 90% off",
    cta: "See Gift Boxes",
    ctaLink: "#gift-boxes",
  },
  {
    id: 3,
    image: "/images/banners/banner3.webp",
    title: "Sky Show & Multi-Shots",
    subtitle: "Aerial repeating shots, sky fancy & blasters at direct factory rates",
    cta: "View Sky Shots",
    ctaLink: "#products",
  },
  {
    id: 4,
    image: "/images/banners/banner4.webp",
    title: "Sivakasi Direct Factory Dispatch",
    subtitle: "Free transport dispatch across Tamil Nadu • Minimum order ₹3,000",
    cta: "Explore Catalog",
    ctaLink: "#products",
  },
] as const;
