/**
 * The prototype uses base64-embedded placeholder photography (ring shots, app
 * screenshots) — fake images CLAUDE.md explicitly flags as not real content.
 * This renders a labeled placeholder in the same slot so layout/aspect ratio
 * ports correctly; swap for real photography before shipping.
 */
export function ImagePlaceholder({
  label,
  className,
  aspect = "aspect-square",
}: {
  label: string;
  className?: string;
  aspect?: string;
}) {
  return (
    <div
      className={[
        aspect,
        "flex items-center justify-center text-center px-4",
        "bg-gradient-to-br from-gold-tint to-bg-3 text-gold-soft",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="font-mono text-[0.68rem] tracking-[0.08em] uppercase opacity-70">
        {label}
      </span>
    </div>
  );
}
