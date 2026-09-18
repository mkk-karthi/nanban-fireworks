// import type { Metadata } from "next";

/**
 * Cart page layout (server component).
 * SEO metadata currently commented out.
 */
/*
export const metadata: Metadata = {
  title: "Shopping Cart",
  description:
    "Review your selected fireworks, gift boxes, and crackers. Generate a festive PDF estimate and place your Sivakasi factory dispatch order.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://nanban-fireworks.pages.dev/cart",
  },
  openGraph: {
    url: "https://nanban-fireworks.pages.dev/cart",
    title: "Shopping Cart | MKK Fireworks",
    description:
      "Your fireworks cart – review items and place a Sivakasi factory dispatch order.",
  },
};
*/

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
