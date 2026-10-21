/**
 * Site-wide config ported from reference/i_do_website.html's CONFIG object.
 * Fields marked "placeholder" below were marked as such in the prototype
 * itself (`/* placeholder — replace *\/`) — real values are still needed
 * before launch (see CLAUDE.md's "known open decisions").
 */
export const SITE = {
  brand: "i do",
  parent: "Avataar",
  legalName: "Misya Beauty Tech Pvt. Ltd.",
  priceInPaise: 1499900,
  mrpInPaise: 1999900,
  codFeeInPaise: 10000, // confirmed 15 Oct: ₹100 COD handling fee, never refunded
  // Business facts still owed by the business (Website Decisions → "Facts we need", due 22 Oct).
  // null = not confirmed: the UI hides that contact instead of showing a fake one.
  // Fill these in with the real values (waNumber is digits only, e.g. "919876543210").
  email: null as string | null,
  phone: null as string | null,
  waNumber: null as string | null,
  address: null as string | null,
  gstin: null as string | null,
  cin: null as string | null,
  domain: "idowellness.ai", // confirmed 2026-09-24 — registered domain
  avataarUrl: "https://avataarskin.com", // placeholder cross-link
  // Unconfirmed figures. Keep hidden until the business confirms they are real
  // (LLD §12: social_proof_enabled defaults to off).
  supportHours: "Monday to Saturday, 10:00 to 18:00",
  socialProofEnabled: false,
  rating: 4.6,
  customers: "30,000+",
  cities: "18+",
};

export const NAV: Array<[href: string, label: string]> = [
  ["/shop", "Shop"],
  ["/ring", "The Ring"],
  ["/app", "The App"],
  ["/consults", "Consults"],
  ["/about", "About"],
  ["/journal", "Journal"],
];

export const WHATSAPP_MESSAGE = "Hi! I have a question about the i do smart ring.";
