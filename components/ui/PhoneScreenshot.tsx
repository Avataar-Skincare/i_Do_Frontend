import Image from "next/image";

/** A real app screenshot in the phone-bezel frame used across the home page and "The App" tab. */
export function PhoneScreenshot({
  src,
  alt,
  caption,
  className,
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
}) {
  return (
    <figure className={["m-0 w-full max-w-[300px] text-center", className].filter(Boolean).join(" ")}>
      <div className="relative rounded-[38px] bg-nav p-2.5 shadow-lg">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-9 h-1.5 rounded-full bg-white/14 z-10" />
        <div className="relative aspect-[9/19] overflow-hidden rounded-[30px]">
          <Image src={src} alt={alt} fill sizes="300px" className="object-cover" />
        </div>
      </div>
      {caption && (
        <figcaption className="mt-3.5 text-[0.82rem] text-muted font-mono tracking-[0.04em]">{caption}</figcaption>
      )}
    </figure>
  );
}
