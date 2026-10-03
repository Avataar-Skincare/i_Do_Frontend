import type { Metadata } from "next";
import { Suspense } from "react";
import { Section } from "@/components/ui/Section";
import { AccountClient } from "@/components/account/AccountClient";
import { SITE } from "@/lib/content/site";

export const metadata: Metadata = {
  title: `Account — ${SITE.brand} by ${SITE.parent}`,
};

export default function AccountPage() {
  return (
    <Section size="sm">
      <Suspense fallback={<div className="text-center py-16 text-muted">Loading…</div>}>
        <AccountClient />
      </Suspense>
    </Section>
  );
}
