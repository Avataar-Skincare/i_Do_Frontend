import Image from "next/image";

/** Default studio shot (gold ring, white background) — pass `src` for any other ring photo. */
export const RING_GOLD_URL = "https://cdn.avataarskin.com/static/cms/production/NEW_UI_JUNE/ring_img.webp";

export function RingImage({
  src = RING_GOLD_URL,
  className,
  alt = "i do smart ring, gold finish",
}: {
  src?: string;
  className?: string;
  alt?: string;
}) {
  return (
    <div className={["relative aspect-square overflow-hidden", className].filter(Boolean).join(" ")}>
      <Image src={src} alt={alt} fill sizes="(max-width: 768px) 60vw, 520px" className="object-cover" />
    </div>
  );
}
