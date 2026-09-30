import { ORDER_CONFIG } from "@/config/site";
import { formatPrice } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_LIST: FaqItem[] = [
  {
    question: "How do I buy Sivakasi crackers online from Nanban Crackers?",
    answer:
      "Select your favorite crackers, sky shots, sparklers, and gift box combos from our catalog. Once your cart reaches the minimum order of ₹3,000, review your order and generate your instant festive estimate. Our Sivakasi dispatch team will connect with you via WhatsApp or phone to confirm lorry transport booking and dispatch details.",
  },
  {
    question: "What is the minimum order value for Sivakasi direct dispatch?",
    answer: `The minimum order requirement is ${formatPrice(ORDER_CONFIG.minimumOrderAmount)} for factory-direct dispatch. This wholesale threshold ensures safe packaging, heavy-gauge protective carton crating, and cost-effective transport hub logistics directly from Sivakasi.`,
  },
  {
    question: "Where do you deliver crackers?",
    answer:
      "We dispatch orders directly from Sivakasi to authorized transport hubs across Tamil Nadu, Kerala, and Bangalore.",
  },
  {
    question: "Are Nanban Crackers products genuine and authentic?",
    answer:
      "Yes. All our fireworks are 100% genuine factory-fresh stock manufactured directly in Sivakasi, ensuring brilliant colors, excellent effects, and joyful family celebrations.",
  },
  {
    question: "How can I download the Diwali 2026 Crackers Price List PDF?",
    answer:
      "You can add items to your cart and click 'Festive Estimate' at any time to download an instant, beautifully branded PDF price estimate with complete product breakdowns, discounts, and Sivakasi wholesale rates.",
  },
  {
    question: "How is my order confirmed and processed?",
    answer:
      "Our platform operates as a direct factory enquiry and estimate catalog. Once you submit your requirement, our Sivakasi team connects directly with you via phone or WhatsApp to confirm product availability, packaging, and convenient transport dispatch.",
  },
];
