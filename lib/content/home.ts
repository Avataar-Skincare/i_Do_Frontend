import type { IconName } from "@/components/ui/Icon";

export type Tone = "gold" | "sage" | "rust" | "plum";

/** Ported verbatim from reference/i_do_website.html's SCORES array. */
export const SCORES: Array<{
  name: string;
  val: string;
  unit: string;
  bar: number;
  tone: Tone;
  icon: IconName;
  state: string;
  trend: string;
  trendUp: boolean;
}> = [
  { name: "Glow", val: "86", unit: "", bar: 86, tone: "gold", icon: "spark", state: "Good", trend: "+2 today", trendUp: true },
  { name: "Barrier", val: "82", unit: "", bar: 82, tone: "sage", icon: "shield", state: "Strong", trend: "stable", trendUp: false },
  { name: "Inflammation Risk", val: "22", unit: "", bar: 22, tone: "sage", icon: "drop", state: "Low", trend: "3 easing", trendUp: true },
  { name: "Acne Trigger", val: "24", unit: "", bar: 24, tone: "rust", icon: "drop", state: "Low", trend: "2 easing", trendUp: true },
  { name: "Collagen Protection", val: "78", unit: "", bar: 78, tone: "sage", icon: "gem", state: "Good", trend: "+2", trendUp: true },
  { name: "Pigmentation Risk", val: "23", unit: "", bar: 23, tone: "rust", icon: "sun", state: "Low", trend: "3 easing", trendUp: true },
  { name: "Hair Vitality", val: "78", unit: "", bar: 78, tone: "plum", icon: "strand", state: "Good", trend: "+1", trendUp: true },
  { name: "Skin Age vs Bio Age", val: "−0.1", unit: "yrs", bar: 72, tone: "gold", icon: "glass", state: "Good", trend: "0.2 yr younger", trendUp: true },
];

export const APP_FEATURES: Array<{ icon: IconName; title: string; body: string }> = [
  { icon: "spark", title: "Eight skin scores", body: "Glow, Barrier, Collagen, Pigmentation, Acne, Inflammation, Hair and Skin Age — refreshed every morning." },
  { icon: "moon", title: "Cycle & skin-phase intelligence", body: "Know when your skin is most resilient and when to go gentle — mapped to where you are in your cycle." },
  { icon: "chat", title: "Luna, your AI skin coach", body: "Daily skincare, food and movement picks, tuned to your scores, your phase and your day." },
  { icon: "list", title: "Your routine, kept", body: "A prescribed AM/PM routine with reminders, adherence and streaks that actually stick." },
  { icon: "plate", title: "Eat for your glow", body: "Log meals and get skin-first nutrition nudges — protein, antioxidants and the rest." },
  { icon: "people", title: "The Circle", body: "A private space to learn and share, with women on the same journey. You are not alone in this." },
];

export const STEPS: Array<{ title: string; body: string }> = [
  { title: "Wear it", body: "Slip on your i do ring, day and night. At 2.9g of titanium, you will forget it is there." },
  { title: "It learns you", body: "Sleep, heart rate, temperature, HRV and your cycle sync quietly in the background." },
  { title: "You glow", body: "Every morning: eight skin scores and a plan for the day — skincare, food and movement." },
];

export const COMPARE = {
  cols: ["Oura Ring", "Ultrahuman Ring Air"],
  rows: [
    ["Skin scores (Glow, Barrier, Collagen…)", "yes", "no", "no"],
    ["Skin-phase intelligence", "yes", "no", "no"],
    ["Menstrual cycle tracking", "yes", "yes", "partial"],
    ["AI coach for skin, food & movement", "yes", "no", "partial"],
    ["Free dermatologist + dietician consults", "yes", "no", "no"],
    ["Subscription to unlock features", "None", "Required", "None"],
    ["Made for India · COD · ₹ pricing", "yes", "partial", "partial"],
    ["Data processed on-device (DPDP)", "yes", "partial", "partial"],
    ["Price", "₹14,999 one-time", "₹40,000+ *", "₹28,000+ *"],
    ["Warranty", "12 months", "12 months", "12 months"],
  ] as Array<[string, string, string, string]>,
};

export const REVIEWS: Array<{ name: string; loc: string; stars: number; text: string }> = [
  { name: "Ananya R.", loc: "Bengaluru", stars: 5, text: "Finally a ring that talks about my skin, not just my steps. The cycle-phase tips are unreal." },
  { name: "Meghna S.", loc: "Mumbai", stars: 5, text: "The free dermatologist consult after delivery sealed it for me. I felt looked-after, not sold to." },
  { name: "Kritika P.", loc: "New Delhi", stars: 4, text: "Battery genuinely lasts almost a week, and there is no monthly fee hanging over me." },
  { name: "Fatima K.", loc: "Hyderabad", stars: 5, text: "Watching my Glow score climb each week is weirdly motivating. The app is genuinely beautiful." },
  { name: "Sneha V.", loc: "Pune", stars: 5, text: "Wore it through workouts, showers and dishes. It does not budge and it does not scream tech." },
  { name: "Ritu M.", loc: "Jaipur", stars: 4, text: "COD made it easy to trust a new brand, and the sizing kit helped me get the fit exactly right." },
];

export const FAQS: Array<{ q: string; a: string }> = [
  { q: "Which finger should I wear it on, and how do I find my size?", a: "Most people wear i do on the index, middle or ring finger of either hand. Use our size calculator to convert your finger circumference to a ring size in seconds, or order a free sizing kit and try the real widths at home before we ship your ring." },
  { q: "How long does the battery last, and how do I charge it?", a: "A full charge lasts about 4–7 days depending on use, and tops up in roughly an hour on the included magnetic dock. Standby runs 10–15 days, so the odd missed charge is no problem." },
  { q: "Is it waterproof?", a: "Yes. i do is rated 5 ATM, so it is fine for handwashing, showering, rain and swimming. We suggest taking it off for very hot water, saunas and steam rooms." },
  { q: "Does it work with my phone?", a: "i do pairs over Bluetooth 5.1 with iPhone (iOS 12 and above) and Android (5.0 and above). The app is free and there is no subscription." },
  { q: "Is there a subscription?", a: "No — and there never will be. Your ₹14,999 is a one-time price and every feature, including all eight skin scores, cycle intelligence and Luna, is included for life." },
  { q: "What are the free consultations?", a: "Every ring includes one consultation with an Avataar dermatologist and one with a dietician. Once your ring is delivered, you can book both from your account — bring your scores and get a plan built around them." },
  { q: "Is my health data private?", a: "Your data is yours. i do is built for India’s DPDP framework, processes sensitive readings on-device wherever possible, and never sells your data. You can export or delete it at any time." },
  { q: "How fast is delivery, and is Cash on Delivery available?", a: "Prepaid orders ship free across India and typically arrive in 3–7 working days. Cash on Delivery is available for a small ₹50 handling fee." },
  { q: "What about warranty and returns?", a: "Your ring is covered by a 12-month warranty against manufacturing defects. Because of the personal nature of the product we do not offer change-of-mind refunds once a ring is used, but we will always make defects right. Full details are on our Returns & Warranty page." },
  { q: "Is i do a medical device?", a: "No. i do is a wellness and beauty-tech product designed to help you understand and care for your skin and body. It does not diagnose, treat or prevent any medical condition — please see a doctor for medical concerns." },
];
