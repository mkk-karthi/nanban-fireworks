import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "./_components/layout/Header";
import { Footer } from "./_components/layout/Footer";
import { CartFab } from "./_components/common/CartFab";

// Typography
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// Metadata
export const metadata: Metadata = {
  title: "MKK Fireworks – Premium Crackers & Fireworks | Sivakasi",
  description:
    "Buy premium quality fireworks, sparklers, sky shots, rockets, and gift boxes at MKK Fireworks. Best prices from Sivakasi. Minimum order ₹3,000.",
};

import { AosInitializer } from "./_components/common/AosInitializer";

// Root Layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full scroll-smooth`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-amber-50 text-gray-900 antialiased"
        suppressHydrationWarning
      >
        <AosInitializer />
        {/* Site-wide header */}
        <Header />

        {/* Page content */}
        <main className="flex-1">{children}</main>

        {/* Site-wide footer */}
        <Footer />

        {/* Floating cart button – appears after first item added */}
        <CartFab />
      </body>
    </html>
  );
}
