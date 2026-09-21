import type { IconName } from "@/components/ui/Icon";

export const ABOUT_RING_PHOTO = "https://cdn.avataarskin.com/static/cms/production/NEW_UI_JUNE/ring_img4.webp";

export const BELIEF = {
  eyebrow: "Our belief",
  title: "Skin is a signal, not a vanity",
  paragraphs: [
    "Your skin reflects your sleep, your hormones, your stress and your plate. Read those signals well, and you can act early — gently, and in rhythm with your body. That's the whole idea behind i do.",
    "No subscriptions. No fear-mongering. No step counts pretending to be skincare. Just a beautiful ring, eight honest scores, and real experts when you want them.",
  ],
};

export const PROMISES: Array<{ icon: IconName; title: string; body: string }> = [
  { icon: "spark", title: "Skin-first, always", body: "Every feature earns its place by helping your skin — not by padding a spec sheet." },
  { icon: "heart", title: "No subscription", body: "One fair price. Every feature included, for the life of your ring." },
  { icon: "lock", title: "Your data is yours", body: "Built for India's DPDP framework, processed on-device where possible, never sold." },
  { icon: "face", title: "Humans in the loop", body: "Real dermatologists and dieticians, included — because software should know its limits." },
];
