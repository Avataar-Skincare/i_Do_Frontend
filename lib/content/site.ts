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
  codFeeInPaise: 5000,
  email: "care@idobyavataar.com", // placeholder
  phone: "+91 90000 00000", // placeholder
  waNumber: "919000000000", // placeholder
  address: "Misya Beauty Tech Pvt. Ltd., [Registered address], India", // placeholder
  gstin: "[GSTIN]", // placeholder
  cin: "[CIN]", // placeholder
  domain: "idowellness.ai", // confirmed 2026-09-24 — registered domain
  avataarUrl: "https://avataarskin.com", // placeholder cross-link
  rating: 4.6,
  customers: "30,000+",
  cities: "18+",
};

export const NAV: Array<[href: string, label: string]> = [
  ["/shop", "Shop"],
  ["/ring", "The Ring"],
  ["/app", "The App"],
  ["/sizing", "Sizing"],
  ["/consults", "Consults"],
  ["/about", "About"],
  ["/journal", "Journal"],
];

export const WHATSAPP_MESSAGE = "Hi! I have a question about the i do smart ring.";
