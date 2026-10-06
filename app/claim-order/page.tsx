import type { Metadata } from "next";
import { Suspense } from "react";
import { Section } from "@/components/ui/Section";
import { ClaimOrderForm } from "@/components/claim-order/ClaimOrderForm";
import { SITE } from "@/lib/content/site";

export const metadata: Metadata = {
  title: `Create your account — ${SITE.brand} by ${SITE.parent}`,
};

export default function ClaimOrderPage() {
  return (
    <Section size="sm">
      <Suspense fallback={<div className="text-center py-16 text-muted">Loading…</div>}>
        <ClaimOrderForm />
      </Suspense>
    </Section>
  );
}
