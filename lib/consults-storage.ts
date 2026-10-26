import type { ConsultTypeId } from "@/lib/content/consults";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { formatIstDateTime } from "@/lib/format";

export type ConsultStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export type StoredConsult = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  type: ConsultTypeId;
  /** The booking screen's own wording of the day. The API now sends `appointmentDate` instead. */
  dayLabel?: string;
  /** API contract: the day the customer asked for (YYYY-MM-DD). */
  appointmentDate?: string;
  timeSlot: string;
  /** Set by the partner on confirm, in IST. Prefer this over the requested day once it exists. */
  appointmentAt?: string | null;
  entitlementId?: string;
  concern: string;
  status: ConsultStatus;
  doctorName: string | null;
  meetingLink: string | null;
  confirmedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
};

/** "12 Nov, 10:00 IST" once confirmed; otherwise the day and slot the customer asked for. */
export function consultWhen(c: Pick<StoredConsult, "appointmentAt" | "appointmentDate" | "dayLabel" | "timeSlot">): string {
  if (c.appointmentAt) return formatIstDateTime(c.appointmentAt);
  const day = c.appointmentDate
    ? new Date(`${c.appointmentDate}T00:00:00+05:30`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" })
    : c.dayLabel;
  return [day, c.timeSlot].filter(Boolean).join(" · ");
}

/**
 * Booking requires a logged-in account — staff (in partner-app) need a real
 * name/phone/email to act on the request, which an anonymous visitor can't
 * provide. `email` is collected here independently of the account (same as
 * `name`/`phone`) rather than read from the account's own email — an account
 * can now sign up with just a phone, so it might not have one. A customer
 * can hold any number of sessions per type at once — each one is tracked,
 * cancelled and rescheduled independently (see `cancelConsult` / `rescheduleConsult`).
 */
export function saveConsult(
  input: Omit<
    StoredConsult,
    "id" | "userId" | "status" | "doctorName" | "meetingLink" | "createdAt" | "dayLabel" | "appointmentDate" | "appointmentAt" | "entitlementId" | "confirmedAt" | "completedAt"
  > & { dayLabel: string },
): Promise<StoredConsult> {
  return apiPost<StoredConsult>("/consults", input);
}

/** Requires a logged-in user — call only when `useAuth().user` is set. */
export function getMyConsults(): Promise<StoredConsult[]> {
  return apiGet<StoredConsult[]>("/consults/mine");
}

export function cancelConsult(id: string): Promise<StoredConsult> {
  return apiPatch<StoredConsult>(`/consults/${id}/cancel`, {});
}

/**
 * Moves this one session — doesn't touch any of the customer's other sessions.
 * If it was already CONFIRMED, the backend drops it back to PENDING (the
 * previously-assigned doctor may not be free at the new time) until ops
 * re-confirms it.
 */
export function rescheduleConsult(id: string, dayLabel: string, timeSlot: string): Promise<StoredConsult> {
  return apiPatch<StoredConsult>(`/consults/${id}/reschedule`, { dayLabel, timeSlot });
}
