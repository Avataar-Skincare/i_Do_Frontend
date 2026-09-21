import Image from "next/image";
import { SITE } from "@/lib/content/site";

const LOGO_URL = "https://cdn.avataarskin.com/static/cms/production/NEW_UI_JUNE/download.webp";
// Intrinsic size of the source file (858x400) — kept for correct aspect ratio.
const INTRINSIC_WIDTH = 858;
const INTRINSIC_HEIGHT = 400;

/**
 * The real "i do by Avataar" wordmark. Renders dark ink text on a
 * transparent background, so it only reads correctly on light surfaces
 * (header, mobile drawer) — not the dark footer/nav sections.
 */
export function Logo({ height = 38, className }: { height?: number; className?: string }) {
  const width = Math.round((INTRINSIC_WIDTH / INTRINSIC_HEIGHT) * height);
  return (
    <Image
      src={LOGO_URL}
      alt={`${SITE.brand} by ${SITE.parent}`}
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
