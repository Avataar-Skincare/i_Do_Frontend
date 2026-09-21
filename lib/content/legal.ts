import { SITE } from "@/lib/content/site";

type Block = { h2: string } | { p: string } | { ul: string[] };

export const LEGAL_DOCS: Record<string, { title: string; blocks: Block[] }> = {
  privacy: {
    title: "Privacy Policy",
    blocks: [
      {
        p: `This Privacy Policy explains how ${SITE.legalName} ("we", "us"), operator of ${SITE.brand} by ${SITE.parent}, collects, uses and protects your personal data when you use our website, ring and app. It is designed to align with India's Digital Personal Data Protection Act, 2023 (DPDP).`,
      },
      { h2: "What we collect" },
      {
        ul: [
          "Account & order data — name, contact details, shipping address and order history you provide at checkout.",
          "Health & wellness data — readings from your ring (such as heart rate, temperature, sleep and cycle inputs) used to generate your scores.",
          "Usage data — how you interact with our website and app, for reliability and improvement.",
        ],
      },
      { h2: "How we use it" },
      {
        p: "We use your data to fulfil orders, provide and personalise your scores and recommendations, arrange your consultations, offer support, and meet legal obligations. We do not sell your personal data.",
      },
      { h2: "On-device processing" },
      {
        p: "Wherever technically possible, sensitive readings are processed on your device. Data synced to our systems is encrypted in transit and at rest.",
      },
      { h2: "Your rights" },
      {
        p: `You may access, correct, export or delete your personal data, and withdraw consent, at any time by writing to ${SITE.email}. You may also nominate a person to exercise these rights on your behalf.`,
      },
      { h2: "Retention" },
      {
        p: "We keep your data only as long as needed for the purposes above or as required by law, after which it is deleted or anonymised.",
      },
      { h2: "Grievance officer" },
      {
        p: `For any privacy concern, contact our Grievance Officer at ${SITE.email} or ${SITE.address}.`,
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    blocks: [
      {
        p: `These Terms govern your use of the ${SITE.brand} website, products and app, operated by ${SITE.legalName}. By placing an order or using our services, you agree to them.`,
      },
      { h2: "Orders & pricing" },
      {
        p: "All prices are in Indian Rupees and inclusive of applicable taxes unless stated otherwise. We may correct pricing errors and cancel affected orders with a full refund of any amount paid.",
      },
      { h2: "The product" },
      {
        p: `${SITE.brand} is a wellness and beauty-tech product. It does not diagnose, treat, cure or prevent any disease, and it is not a substitute for professional medical advice. Always consult a qualified professional for medical concerns.`,
      },
      { h2: "Accounts" },
      {
        p: "You are responsible for the accuracy of the information you provide and for activity under your account. Keep your login details secure.",
      },
      { h2: "Intellectual property" },
      {
        p: `All content, trademarks and software associated with ${SITE.brand} are owned by us or our licensors and may not be used without permission.`,
      },
      { h2: "Limitation of liability" },
      {
        p: "To the extent permitted by law, our liability for any claim relating to the product or services is limited to the amount you paid for the relevant order.",
      },
      { h2: "Governing law" },
      { p: "These Terms are governed by the laws of India, with exclusive jurisdiction of the courts at [City], India." },
    ],
  },
  shipping: {
    title: "Shipping Policy",
    blocks: [
      { h2: "Where we ship" },
      { p: "We ship across India to all serviceable pincodes." },
      { h2: "Charges & timelines" },
      {
        ul: [
          "Prepaid orders — free shipping, typically delivered in 3–7 working days.",
          `Cash on Delivery (COD) — available for a ₹50 handling fee, with the same 3–7 working-day timeline.`,
        ],
      },
      { h2: "Tracking" },
      { p: "Once dispatched, you will receive tracking details by SMS and email, and you can follow your order any time from Track order or your account." },
      { h2: "Delays" },
      {
        p: `Deliveries may occasionally be delayed by weather, regional restrictions or courier constraints. If your order is significantly delayed, write to ${SITE.email} and we will help.`,
      },
    ],
  },
  returns: {
    title: "Returns & Warranty",
    blocks: [
      { h2: "12-month warranty" },
      {
        p: `Your ${SITE.brand} ring is covered against manufacturing defects for 12 months from delivery. If your ring develops a covered fault, we will repair or replace it at no cost.`,
      },
      { h2: "Damaged or wrong item" },
      {
        p: "If your order arrives damaged, defective or incorrect, contact us within 7 days of delivery with your order ID and a photo, and we will arrange a replacement.",
      },
      { h2: "Change-of-mind returns" },
      {
        p: "Because the ring is a personal, skin-contact device, we are unable to accept change-of-mind returns once a ring has been worn or its hygiene seal is broken. Unopened rings may be returned within 7 days of delivery, subject to inspection.",
      },
      { h2: "Sizing" },
      {
        p: "To avoid sizing issues, use our size calculator or order a free sizing kit before your ring ships. If your ring does not fit, contact us and we will help you find the right size.",
      },
      { h2: "How to reach us" },
      { p: `Email ${SITE.email} or WhatsApp us and our team will take it from there.` },
    ],
  },
};

export type LegalSlug = keyof typeof LEGAL_DOCS;
