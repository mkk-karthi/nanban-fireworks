import type { Metadata } from "next";
import { COMPANY_DETAILS } from "@/config/site";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: `Review your selected fireworks and gift boxes, verify quantities and savings, and place your order directly with ${COMPANY_DETAILS.name}.`,
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${COMPANY_DETAILS.siteUrl}/cart/`,
  },
  openGraph: {
    title: `Shopping Cart | ${COMPANY_DETAILS.name}`,
    description: `Review your fireworks order with ${COMPANY_DETAILS.name}. Sivakasi Direct dispatch.`,
    url: `${COMPANY_DETAILS.siteUrl}/cart/`,
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
