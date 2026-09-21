import Link from "next/link";

export function Breadcrumb({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <div className="font-mono text-[0.8rem] tracking-[0.04em] text-muted mb-3.5">
      {items.map((item, i) => (
        <span key={item.label}>
          {item.href ? (
            <Link href={item.href} className="hover:text-gold-deep">
              {item.label}
            </Link>
          ) : (
            item.label
          )}
          {i < items.length - 1 && " / "}
        </span>
      ))}
    </div>
  );
}
