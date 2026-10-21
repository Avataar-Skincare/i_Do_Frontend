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
        p: `You may access, correct, export or delete your personal data, and withdraw consent, at any time ${SITE.email ? `by writing to ${SITE.email}` : "through the contact form on our Support page"}. You may also nominate a person to exercise these rights on your behalf.`,
      },
      { h2: "Retention" },
      {
        p: "We keep your data only as long as needed for the purposes above or as required by law, after which it is deleted or anonymised.",
      },
      { h2: "Grievance officer" },
      {
        p: `For any privacy concern, contact our Grievance Officer ${SITE.email ? `at ${SITE.email}` : "through the contact form on our Support page"}${SITE.address ? `, or write to ${SITE.address}` : ""}.`,
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
          "Your sizing kit ships first. Your ring ships after you submit your size from your account.",
          "Prepaid orders — free shipping, typically delivered in 4–7 working days.",
          `Cash on Delivery (COD) — available for a ₹100 handling fee, paid in full when your sizing kit is delivered, with the same 4–7 working-day timeline. The ₹100 fee is never refunded.`,
        ],
      },
      { h2: "Tracking" },
      { p: "Once dispatched, you will receive tracking details by SMS and email, and you can follow your order any time from Track order or your account." },
      { h2: "Delays" },
      {
        p: `Deliveries may occasionally be delayed by weather, regional restrictions or courier constraints. If your order is significantly delayed, ${SITE.email ? `write to ${SITE.email}` : "use the contact form on our Support page"} and we will help.`,
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
        p: "If your order arrives damaged, defective or incorrect, report it from your account within 7 days of delivery with a box-opening video and photos, and we will arrange a replacement. Damaged or wrong items are replaced, not refunded.",
      },
      { h2: "Change-of-mind returns" },
      {
        p: "Because the ring is a personal, skin-contact device, a delivered ring cannot be returned for a refund, including a sealed, unopened box. There is no size exchange.",
      },
      { h2: "Cancelling and refunds" },
      {
        ul: [
          "Whatever has reached you is not refunded; the rest of the amount you paid is.",
          "If you cancel after receiving the sizing kit, you are refunded the amount paid minus the sizing kit's price. Cash on Delivery customers share a UPI ID or bank account for the refund.",
          "If you paid online and never accept the sizing kit, you are refunded in full.",
          "If you refuse your ring at delivery, you are refunded the amount paid minus the sizing kit's price, once the ring is back with us.",
          "The ₹100 Cash on Delivery fee is never refunded.",
          "Once your ring has shipped, the order can no longer be cancelled.",
        ],
      },
      { h2: "Sizing" },
      {
        p: "A sizing kit is included with your ring and ships first. Use the sizers at home, then submit your size from your account. Once submitted, your size is locked and cannot be changed, so please confirm it carefully. There is no size exchange.",
      },
      { h2: "The 15-day target" },
      {
        p: "After your sizing kit is delivered, please submit your size within 15 days. This is a target, not a deadline: your order is not cancelled if you take longer. We will keep reminding you, our team may call to help, and we ship your ring as soon as you send your size. If you decide to cancel after the 15 days, the same refund applies as for any cancellation after the kit.",
      },
      { h2: "How to reach us" },
      { p: `${SITE.email ? `Email ${SITE.email}` : "Use the contact form on our Support page"}${SITE.waNumber ? " or WhatsApp us" : ""} and our team will take it from there. Support hours: ${SITE.supportHours}.` },
    ],
  },
};

export type LegalSlug = keyof typeof LEGAL_DOCS;
