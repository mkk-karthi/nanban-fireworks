import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartFab } from "@/components/common/CartFab";
import { AosInitializer } from "@/components/common/AosInitializer";
import { COMPANY_DETAILS } from "@/config/site";

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

const SITE_TITLE = `${COMPANY_DETAILS.name} – Premium Crackers & Fireworks | Sivakasi`;
const OG_IMAGE = {
  url: "/images/logo.webp",
  width: 500,
  height: 500,
  alt: `${COMPANY_DETAILS.name} – Sivakasi Direct Sale`,
};

// Site-Wide Metadata
export const metadata: Metadata = {
  metadataBase: new URL(COMPANY_DETAILS.siteUrl),
  title: {
    default: SITE_TITLE,
    template: `%s | ${COMPANY_DETAILS.name}`,
  },
  description: COMPANY_DETAILS.description,
  keywords: [
    "fireworks",
    "crackers",
    "Sivakasi fireworks",
    "Sivakasi crackers",
    "Diwali crackers",
    "Diwali fireworks",
    "sparklers",
    "sky shots",
    "rockets",
    "gift box fireworks",
    "fireworks gift box",
    "buy fireworks online",
    "Nanban Crackers",
    "Nanban Fireworks",
    "Sivakasi wholesale",
    "Tamil Nadu crackers",
    "Tamil Nadu crackers wholesale",
  ],
  icons: {
    icon: [{ url: "/images/logo.png", type: "image/png" }],
    shortcut: "/images/logo.png",
    apple: [{ url: "/images/logo.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  authors: [
    { name: COMPANY_DETAILS.name, url: COMPANY_DETAILS.siteUrl },
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
    canonical: COMPANY_DETAILS.siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: COMPANY_DETAILS.siteUrl,
    siteName: COMPANY_DETAILS.name,
    title: SITE_TITLE,
    description: COMPANY_DETAILS.description,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: COMPANY_DETAILS.description,
    images: [OG_IMAGE.url],
  },
  category: "shopping",
};

// JSON-LD Structured Data

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: COMPANY_DETAILS.name,
      url: COMPANY_DETAILS.siteUrl,
      logo: `${COMPANY_DETAILS.siteUrl}/images/logo.webp`,
      email: COMPANY_DETAILS.email,
      telephone: COMPANY_DETAILS.phoneClean,
      description: COMPANY_DETAILS.description,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Sivakasi",
        addressRegion: "Tamil Nadu",
        addressCountry: "IN",
      },
    },
    {
      "@type": "WebSite",
      name: COMPANY_DETAILS.name,
      url: COMPANY_DETAILS.siteUrl,
      description: COMPANY_DETAILS.description,
      inLanguage: "en-IN",
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
