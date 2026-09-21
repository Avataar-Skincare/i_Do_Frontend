import type { ReactNode } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";

export function PageHead({
  crumbs,
  title,
  lede,
}: {
  crumbs: Array<{ label: string; href?: string }>;
  title: ReactNode;
  lede?: ReactNode;
}) {
  return (
    <div className="pt-11 pb-3">
      <Container>
        <Breadcrumb items={crumbs} />
        <h1 className="font-serif font-medium text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.03] tracking-[-0.01em]">
          {title}
        </h1>
        {lede && <p className="text-ink-2 max-w-[64ch] mt-3.5 text-[1.05rem]">{lede}</p>}
      </Container>
    </div>
  );
}
