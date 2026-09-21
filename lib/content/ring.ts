import type { IconName } from "@/components/ui/Icon";

export const RING_PHOTOS = {
  wickerBackdrop: "https://cdn.avataarskin.com/static/cms/production/NEW_UI_JUNE/ring_Img2.webp",
  onBoxEdge: "https://cdn.avataarskin.com/static/cms/production/NEW_UI_JUNE/ring_img3.webp",
};

export const ESSENTIALS: Array<{ label: string; value: string; unit: string }> = [
  { label: "Material", value: "Titanium", unit: "+ resin" },
  { label: "Weight", value: "2.9", unit: "g" },
  { label: "Water rating", value: "5", unit: "ATM" },
  { label: "Band width", value: "8", unit: "mm" },
  { label: "Battery life", value: "4–7", unit: "days" },
  { label: "Standby", value: "10–15", unit: "days" },
  { label: "Full charge", value: "~1", unit: "hour" },
  { label: "Bluetooth", value: "5.1", unit: "LE" },
];

export const SENSORS: Array<{ icon: IconName; title: string; body: string }> = [
  {
    icon: "sun",
    title: "Skin temperature",
    body: "Accurate to ±0.005°C. Overnight temperature shifts help map your cycle phase and flag when your skin barrier is under strain.",
  },
  {
    icon: "heart",
    title: "Optical heart rate",
    body: "Resting and continuous heart rate reveal recovery, stress load and sleep quality — all of which show up on your skin.",
  },
  {
    icon: "drop",
    title: "Blood oxygen (SpO₂)",
    body: "A window into overnight breathing and circulation, part of the picture behind your Glow and Barrier scores.",
  },
  {
    icon: "bolt",
    title: "Heart-rate variability",
    body: "HRV tracks how well you're recovering. Low HRV days are when your skin most needs a gentle routine.",
  },
];

export const BATTERY_FEATURES: Array<{ icon: IconName; text: string }> = [
  { icon: "battery", text: "4–7 day battery life" },
  { icon: "clock", text: "~1 hour full charge" },
  { icon: "drop", text: "5 ATM — shower & swim" },
  { icon: "refresh", text: "10–15 day standby" },
];
