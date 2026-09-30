import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartFab } from "@/components/common/CartFab";
import { AosInitializer } from "@/components/common/AosInitializer";
import { COMPANY_DETAILS } from "@/config/site";
import { FAQ_LIST } from "@/data/faqs";

// Typography

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

// Viewport (mobile theme color, width)

export const viewport: Viewport = {
  themeColor: "#C8102E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Shared SEO Strings

const SITE_TITLE = `${COMPANY_DETAILS.name} – Sivakasi Crackers Online Wholesale & Retail | Diwali 2026`;
const OG_BANNER = {
  url: "/images/banners/banner1.webp",
  width: 1200,
  height: 630,
  alt: `${COMPANY_DETAILS.name} – Sivakasi Direct Sale Fireworks`,
};
const OG_LOGO = {
  url: "/images/logo.webp",
  width: 500,
  height: 500,
  alt: `${COMPANY_DETAILS.name} Logo`,
};

// Site-Wide Metadata
export const metadata: Metadata = {
  metadataBase: new URL(COMPANY_DETAILS.canonicalUrl),
  title: {
    default: SITE_TITLE,
    template: `%s | ${COMPANY_DETAILS.name}`,
  },
  description: COMPANY_DETAILS.description,
  keywords: [
    "Sivakasi crackers online",
    "buy crackers online",
    "Sivakasi fireworks wholesale",
    "Diwali crackers 2026 price list",
    "Sivakasi crackers direct sale",
    "buy Diwali crackers online Tamil Nadu",
    "buy crackers online Kerala",
    "buy crackers online Bangalore",
    "Sivakasi crackers Bangalore delivery",
    "Kerala crackers wholesale dispatch",
    "sparklers online shopping",
    "sky shots buy Sivakasi",
    "gift box crackers combo",
    "fireworks gift box",
    "Nanban Crackers",
    "Nanban Fireworks Sivakasi",
    "standard crackers online 2026",
    "Tamil Nadu crackers wholesale dispatch",
    "Sivakasi wholesale price crackers",
    "premium crackers Sivakasi online",
  ],
  icons: {
    icon: [{ url: "/images/logo.png", type: "image/png" }],
    shortcut: "/images/logo.png",
    apple: [{ url: "/images/logo.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  authors: [
    { name: COMPANY_DETAILS.name, url: COMPANY_DETAILS.canonicalUrl },
    { name: COMPANY_DETAILS.developer.name, url: COMPANY_DETAILS.developer.url },
  ],
  creator: COMPANY_DETAILS.developer.name,
  publisher: COMPANY_DETAILS.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: COMPANY_DETAILS.canonicalUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: COMPANY_DETAILS.canonicalUrl,
    siteName: COMPANY_DETAILS.name,
    title: SITE_TITLE,
    description: COMPANY_DETAILS.description,
    images: [OG_BANNER, OG_LOGO],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: COMPANY_DETAILS.description,
    images: [OG_BANNER.url],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  category: "shopping",
};

// JSON-LD Structured Data (Knowledge Graph + Store + FAQ + Breadcrumb)

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Store", "WholesaleStore"],
      "@id": `${COMPANY_DETAILS.canonicalUrl}#store`,
      name: COMPANY_DETAILS.name,
      alternateName: ["Nanban Fireworks Sivakasi", "Nanban Crackers Online"],
      url: COMPANY_DETAILS.canonicalUrl,
      logo: `${COMPANY_DETAILS.siteUrl}/images/logo.webp`,
      image: `${COMPANY_DETAILS.siteUrl}/images/banners/banner1.webp`,
      description: COMPANY_DETAILS.description,
      email: COMPANY_DETAILS.email,
      telephone: COMPANY_DETAILS.phoneClean,
      priceRange: "₹₹",
      currenciesAccepted: "INR",
      paymentAccepted: "Offline Payment, Bank Transfer, UPI",
      address: {
        "@type": "PostalAddress",
        streetAddress: COMPANY_DETAILS.address.streetAddress,
        addressLocality: COMPANY_DETAILS.address.addressLocality,
        addressRegion: COMPANY_DETAILS.address.addressRegion,
        postalCode: COMPANY_DETAILS.address.postalCode,
        addressCountry: COMPANY_DETAILS.address.addressCountry,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: COMPANY_DETAILS.geo.latitude,
        longitude: COMPANY_DETAILS.geo.longitude,
      },
      areaServed: [
        {
          "@type": "AdministrativeArea",
          name: "Tamil Nadu",
        },
        {
          "@type": "AdministrativeArea",
          name: "Kerala",
        },
        {
          "@type": "City",
          name: "Bangalore",
        },
      ],
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "08:00",
          closes: "22:00",
        },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Sivakasi Fireworks Wholesale Catalog",
        itemListElement: [
          {
            "@type": "OfferCatalog",
            name: "Festive Gift Box Combos",
          },
          {
            "@type": "OfferCatalog",
            name: "Sparklers & Flowerpots",
          },
          {
            "@type": "OfferCatalog",
            name: "Sky Shots & Aerial Repeater Cakes",
          },
          {
            "@type": "OfferCatalog",
            name: "Ground Chakkars & Rockets",
          },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${COMPANY_DETAILS.canonicalUrl}#website`,
      name: COMPANY_DETAILS.name,
      url: COMPANY_DETAILS.canonicalUrl,
      description: COMPANY_DETAILS.description,
      inLanguage: "en-IN",
      publisher: {
        "@id": `${COMPANY_DETAILS.canonicalUrl}#store`,
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${COMPANY_DETAILS.canonicalUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: COMPANY_DETAILS.canonicalUrl,
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${COMPANY_DETAILS.canonicalUrl}#faq`,
      mainEntity: FAQ_LIST.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ],
};

// Root Layout

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-IN"
      dir="ltr"
      className={`${poppins.variable} h-full scroll-smooth`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-amber-50 text-gray-900 antialiased"
        suppressHydrationWarning
      >
        <AosInitializer />

        {/* Skip-to-content link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-red-700 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:text-sm"
        >
          Skip to main content
        </a>

        {/* Site-wide header */}
        <Header />

        {/* Page content */}
        <main id="main-content" className="flex-1" role="main">
          {children}
        </main>

        {/* Site-wide footer */}
        <Footer />

        {/* Floating cart button – appears after first item added */}
        <CartFab />
      </body>
    </html>
  );
}
