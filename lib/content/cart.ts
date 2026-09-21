import type { IconName } from "@/components/ui/Icon";

export const BAG_PERKS: Array<{ icon: IconName; text: string }> = [
  { icon: "face", text: "2 free expert consults after delivery" },
  { icon: "truck", text: "Free delivery · COD available (+₹50)" },
  { icon: "shield", text: "12-month warranty" },
  { icon: "lock", text: "Secure checkout · DPDP-ready" },
];

export const CHECKOUT_PERKS: Array<{ icon: IconName; text: string }> = [
  { icon: "face", text: "Unlocks 2 free consults" },
  { icon: "truck", text: "Ships in 3–7 working days" },
  { icon: "lock", text: "DPDP-ready · data stays yours" },
];

export const CHECKOUT_DEMO_NOTE =
  "This is a demo checkout — no real payment is processed and no card details are taken. Orders are saved to this device so you can see the full flow.";
