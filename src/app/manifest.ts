import type { MetadataRoute } from "next";
import { COMPANY_DETAILS } from "@/config/site";

export const dynamic = "force-static";

/**
 * Web App Manifest for Nanban Crackers
 * Next.js App Router automatically exposes this at /manifest.webmanifest
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${COMPANY_DETAILS.name} – Sivakasi Direct Sale`,
    short_name: COMPANY_DETAILS.shortName,
    description: COMPANY_DETAILS.description,
    start_url: "/",
    display: "standalone",
    background_color: "#FFFBF0",
    theme_color: "#C8102E",
    orientation: "portrait",
    categories: ["shopping", "lifestyle", "festive"],
    icons: [
      {
        src: "/images/logo.png",
        sizes: "192x192 512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/logo.png",
        sizes: "192x192 512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
