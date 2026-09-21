/** Shared across pages that show the ring's finishes/sizes (home, /ring, /shop, /sizing). */

/** Ported from reference/i_do_website.html's FIN array. */
export const FINISHES: Array<{ id: string; name: string; swatch: string; note: string }> = [
  { id: "gold", name: "Gold", swatch: "radial-gradient(circle at 32% 28%, #EBD9A8, #C0A15B 62%, #9A7D3C)", note: "14K gold-tone finish" },
  { id: "silver", name: "Silver", swatch: "radial-gradient(circle at 32% 28%, #F2F3F4, #C7C9CC 60%, #9AA0A4)", note: "Brushed titanium" },
  { id: "black", name: "Space Black", swatch: "radial-gradient(circle at 32% 28%, #54555A, #2B2B2E 62%, #161618)", note: "Matte space black" },
];

/** Ported from reference/i_do_website.html's SIZES array (K3 v2.1 sizing, mm). */
export const SIZES: Array<{ us: number; circ: number; id: number; od: number }> = [
  { us: 6, circ: 51.8, id: 16.5, od: 22.4 },
  { us: 7, circ: 54.7, id: 17.4, od: 23.3 },
  { us: 8, circ: 57.2, id: 18.2, od: 24.1 },
  { us: 9, circ: 59.7, id: 19.0, od: 24.9 },
  { us: 10, circ: 62.5, id: 19.9, od: 25.8 },
  { us: 11, circ: 65.0, id: 20.7, od: 26.6 },
  { us: 12, circ: 67.5, id: 21.5, od: 27.4 },
  { us: 13, circ: 70.1, id: 22.3, od: 28.2 },
];
