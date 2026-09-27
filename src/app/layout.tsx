import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartFab } from "@/components/common/CartFab";
import { AosInitializer } from "@/components/common/AosInitializer";
import { COMPANY_DETAILS } from "@/config/site";

// ─── Typography ──────────────────────────────────────────────────────────────

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// ─── Viewport (mobile theme color, width) ────────────────────────────────────

export const viewport: Viewport = {
  themeColor: "#C8102E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Site-Wide Metadata
export const metadata: Metadata = {
  metadataBase: new URL(COMPANY_DETAILS.siteUrl),
  title: {
    default: `${COMPANY_DETAILS.name} – Premium Crackers & Fireworks | Sivakasi`,
    template: `%s | ${COMPANY_DETAILS.name}`,
  },
  description: COMPANY_DETAILS.description,
  keywords: [
    "fireworks",
    "crackers",
    "Sivakasi fireworks",
    "Diwali crackers",
    "sparklers",
    "sky shots",
    "rockets",
    "gift box fireworks",
    "buy fireworks online",
    "MKK Fireworks",
    "Sivakasi wholesale",
    "Tamil Nadu crackers",
  ],
  authors: [{ name: COMPANY_DETAILS.name, url: COMPANY_DETAILS.siteUrl }],
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
    title: `${COMPANY_DETAILS.name} – Premium Crackers & Fireworks | Sivakasi`,
    description: COMPANY_DETAILS.description,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: `${COMPANY_DETAILS.name} – Sivakasi Direct Factory Sale`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${COMPANY_DETAILS.name} – Premium Crackers & Fireworks | Sivakasi`,
    description: COMPANY_DETAILS.description,
    images: ["/og-image.jpg"],
  },
  category: "shopping",
};

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full scroll-smooth`}
      suppressHydrationWarning
    >
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
        <main id="main-content" className="flex-1">
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
