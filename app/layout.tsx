import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "./_components/layout/Header";
import { Footer } from "./_components/layout/Footer";
import { CartFab } from "./_components/common/CartFab";
import { AosInitializer } from "./_components/common/AosInitializer";

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

// ─── Site-Wide Metadata (SEO Updates Currently Commented Out) ─────────────────

export const metadata: Metadata = {
  title: "MKK Fireworks – Premium Crackers & Fireworks | Sivakasi",
  description:
    "Buy premium quality fireworks, sparklers, sky shots, rockets, and gift boxes at MKK Fireworks. Best prices direct from Sivakasi factory. Minimum order ₹3,000.",
  /*
  metadataBase: new URL("https://nanban-fireworks.pages.dev"),
  title: {
    default: "MKK Fireworks – Premium Crackers & Fireworks | Sivakasi",
    template: "%s | MKK Fireworks",
  },
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
  authors: [{ name: "MKK Fireworks", url: "https://nanban-fireworks.pages.dev" }],
  creator: "MKK Creation",
  publisher: "MKK Fireworks",
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
    canonical: "https://nanban-fireworks.pages.dev",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://nanban-fireworks.pages.dev",
    siteName: "MKK Fireworks",
    title: "MKK Fireworks – Premium Crackers & Fireworks | Sivakasi",
    description:
      "Premium fireworks, sparklers, sky shots, rockets, and gift boxes. Best factory prices from Sivakasi, Tamil Nadu. Minimum order ₹3,000.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MKK Fireworks – Sivakasi Direct Factory Sale",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MKK Fireworks – Premium Crackers & Fireworks | Sivakasi",
    description:
      "Buy premium fireworks direct from Sivakasi factory. Sparklers, sky shots, rockets, gift boxes and more. Min order ₹3,000.",
    images: ["/og-image.jpg"],
  },
  category: "shopping",
  */
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
