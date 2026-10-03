import type { Metadata } from "next";
import { Suspense } from "react";
import { Section } from "@/components/ui/Section";
import { ResetPasswordForm } from "@/components/account/ResetPasswordForm";
import { SITE } from "@/lib/content/site";

export const metadata: Metadata = {
  title: `Reset your password — ${SITE.brand} by ${SITE.parent}`,
};

export default function ResetPasswordPage() {
  return (
    <Section size="sm">
      <Suspense fallback={<div className="text-center py-16 text-muted">Loading…</div>}>
        <ResetPasswordForm />
      </Suspense>
    </Section>
  );
}
