"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { apiPost, ApiError } from "@/lib/api";

type Fields = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = { name: "", email: "", message: "" };

function validate(fields: Fields): Errors {
  const errors: Errors = {};
  if (!fields.name.trim()) errors.name = "Please enter your name";
  if (!/^\S+@\S+\.\S+$/.test(fields.email)) errors.email = "Enter a valid email";
  if (!fields.message.trim()) errors.message = "Please add a message";
  return errors;
}

function inputClass(hasError: boolean) {
  return [
    "w-full bg-bg-2 border-[1.5px] rounded-sm py-3.5 px-4 text-[0.98rem] focus:outline-none focus:border-gold",
    hasError ? "border-[color:var(--color-error)]" : "border-line-2",
  ].join(" ");
}

export function ContactForm() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function setField(key: keyof Fields, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await apiPost("/contact", fields);
      setSent(true);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "Couldn't send your message — check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="bg-surface border border-line rounded-lg p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-sage-bg text-sage grid place-items-center mx-auto mb-4">
          <Icon name="check" size={26} />
        </div>
        <h3 className="text-2xl font-serif mb-2">Message received</h3>
        <p className="text-ink-2 m-0">
          Thanks, {fields.name.split(" ")[0]} — we&rsquo;ll get back to you at {fields.email} soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-lg p-7.5 flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Name" required error={errors.name}>
          <input value={fields.name} onChange={(e) => setField("name", e.target.value)} placeholder="Your name" className={inputClass(!!errors.name)} />
        </Field>
        <Field label="Email" required error={errors.email}>
          <input
            type="email"
            value={fields.email}
            onChange={(e) => setField("email", e.target.value)}
            placeholder="you@email.com"
            className={inputClass(!!errors.email)}
          />
        </Field>
      </div>
      <Field label="How can we help?" required error={errors.message}>
        <textarea
          value={fields.message}
          onChange={(e) => setField("message", e.target.value)}
          placeholder="Tell us what's going on…"
          rows={4}
          className={`${inputClass(!!errors.message)} resize-y`}
        />
      </Field>
      {submitError && <p className="text-[0.85rem] text-error m-0">{submitError}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="self-start bg-gold text-white font-semibold py-3.5 px-7 rounded-pill hover:bg-gold-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-[0.82rem] font-medium text-ink-2 mb-1.5">
        {label} {required && <span className="text-gold-deep">*</span>}
      </label>
      {children}
      {error && <p className="text-[0.78rem] text-error mt-1.5">{error}</p>}
    </div>
  );
}
