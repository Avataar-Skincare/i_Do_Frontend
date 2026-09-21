import type { IconName } from "@/components/ui/Icon";
import { RING_GOLD_URL } from "@/components/ui/RingImage";

export const PRODUCT = {
  name: "i do — the skin-first smart ring",
  tagline: "Eight skin scores. Cycle intelligence. Free expert consults. No subscription.",
};

const CDN = "https://cdn.avataarskin.com/static/cms/production/NEW_UI_JUNE";

/**
 * All 6 slots are real photos of the Gold finish. Silver and Space Black have no
 * photography yet — the finish picker still shows their swatch colors, but selecting
 * them doesn't change this gallery until those shots exist.
 */
export const GALLERY: Array<{ src: string; alt: string }> = [
  { src: RING_GOLD_URL, alt: "i do smart ring, gold finish, studio shot" },
  { src: `${CDN}/ring_1.webp`, alt: "i do smart ring, gold finish, underside sensor view" },
  { src: `${CDN}/ring_2.webp`, alt: "i do smart ring, gold finish, paired rings" },
  { src: `${CDN}/ring_3.webp`, alt: "i do smart ring, gold finish, on a woven backdrop" },
  { src: `${CDN}/ring_4.webp`, alt: "i do smart ring packaging, gold/silver/space black" },
  { src: `${CDN}/ring_5.webp`, alt: "i do smart ring, gold finish, resting on its box" },
];

export const HIGHLIGHTS: Array<{ icon: IconName; text: string }> = [
  { icon: "gem", text: "2.9g titanium" },
  { icon: "heart", text: "No subscription" },
  { icon: "face", text: "2 free expert consults" },
  { icon: "truck", text: "Free 3–7 day delivery" },
];

export const CONSULT_CALLOUT = {
  title: "Two free consults, on us",
  body: "Every ring includes a session with an Avataar dermatologist and a dietician. Book both from your account once your ring arrives.",
};

export const WHATS_IN_THE_BOX = [
  "i do smart ring (your chosen finish & size)",
  "Magnetic charging dock + USB-C cable",
  "Quick-start guide & skin-first welcome",
  "Access to the i do app (iOS & Android)",
];

export const SPECIFICATIONS: Array<[string, string]> = [
  ["Material", "Aerospace-grade titanium + resin inner"],
  ["Weight", "~2.9 g"],
  ["Water resistance", "5 ATM"],
  ["Battery life", "4–7 days (10–15 day standby)"],
  ["Charging", "Magnetic dock · ~1 hour full charge"],
  ["Sensors", "Skin temperature (±0.005°C), optical heart rate, SpO₂, HRV"],
  ["Connectivity", "Bluetooth 5.1 LE · iOS 12+ / Android 5.0+"],
  ["Sizes", "US 6–13 · 8mm band width"],
];

export const SHIPPING_TEXT =
  "Prepaid orders ship free and typically arrive in 3–7 working days. Cash on Delivery is available for a ₹50 handling fee. You'll get tracking by SMS and email.";

export const WARRANTY_TEXT =
  "Covered by a 12-month warranty against manufacturing defects. Because it's a personal skin-contact device, change-of-mind returns aren't available once worn — see";

export const WHY_I_DO: Array<{ icon: IconName; tone: "gold" | "sage" | "plum"; title: string; body: string }> = [
  { icon: "spark", tone: "gold", title: "Skin-first, always", body: "Eight scores built around your skin — not a step count with skincare bolted on." },
  { icon: "moon", tone: "sage", title: "Cycle-aware", body: "Your routine adapts to your phase, so you push actives at the right time and soothe at the right time." },
  { icon: "face", tone: "plum", title: "Real humans", body: "Free dermatologist and dietician consults, because an app should know when to hand you to an expert." },
];
