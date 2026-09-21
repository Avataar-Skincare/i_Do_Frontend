import type { IconName } from "@/components/ui/Icon";

export type ConsultTypeId = "derm" | "dietician";

export const CONSULT_TYPES: Array<{
  id: ConsultTypeId;
  label: string;
  icon: IconName;
  tabBody: string;
  eyebrow: string;
  detailBody: string;
}> = [
  {
    id: "derm",
    label: "Dermatologist",
    icon: "face",
    tabBody: "A skin-first video session with an Avataar dermatologist.",
    eyebrow: "Dermatologist consult",
    detailBody:
      "Bring your Glow, Barrier and risk scores — your dermatologist will read them with you and set a plan for the weeks ahead.",
  },
  {
    id: "dietician",
    label: "Dietician",
    icon: "plate",
    tabBody: "A skin-first nutrition session with an Avataar dietician.",
    eyebrow: "Dietician consult",
    detailBody:
      "Bring your meals and cravings — your dietician will build a skin-first plate around what you already eat.",
  },
];

export const TIME_SLOTS = ["10:00 AM", "11:30 AM", "1:00 PM", "2:30 PM", "4:00 PM", "5:30 PM", "6:30 PM", "7:30 PM"];

export const WHY_IT_WORKS: Array<{ icon: IconName; title: string; body: string }> = [
  { icon: "spark", title: "Read with your data", body: "Your scores and trends, interpreted by an expert — not guesswork." },
  { icon: "list", title: "A real plan", body: "Leave with clear next steps for skincare, food and habits." },
  { icon: "heart", title: "No upsell pressure", body: "Guidance first. It's included with your ring, on us." },
];

export const CONSULT_NOTE =
  "Bookings here are saved to this device for the demo. In production you'd get a calendar invite and reminders.";
