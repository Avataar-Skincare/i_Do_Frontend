import type { ConsultTypeId } from "@/lib/content/consults";
import { apiGet, apiPatch, apiPost, withAuth } from "@/lib/api";
import { getAuthToken } from "@/lib/auth-context";

export type ConsultStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export type StoredConsult = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  type: ConsultTypeId;
  dayLabel: string;
  timeSlot: string;
  concern: string;
  status: ConsultStatus;
  doctorName: string | null;
  meetingLink: string | null;
  createdAt: string;
};

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
  input: Omit<StoredConsult, "id" | "userId" | "status" | "doctorName" | "meetingLink" | "createdAt">,
): Promise<StoredConsult> {
  return apiPost<StoredConsult>("/consults", input, withAuth(getAuthToken()));
}

/** Requires a logged-in user — call only when `useAuth().user` is set. */
export function getMyConsults(): Promise<StoredConsult[]> {
  return apiGet<StoredConsult[]>("/consults/mine", withAuth(getAuthToken()));
}

export function cancelConsult(id: string): Promise<StoredConsult> {
  return apiPatch<StoredConsult>(`/consults/${id}/cancel`, {}, withAuth(getAuthToken()));
}

/**
 * Moves this one session — doesn't touch any of the customer's other sessions.
 * If it was already CONFIRMED, the backend drops it back to PENDING (the
 * previously-assigned doctor may not be free at the new time) until ops
 * re-confirms it.
 */
export function rescheduleConsult(id: string, dayLabel: string, timeSlot: string): Promise<StoredConsult> {
  return apiPatch<StoredConsult>(`/consults/${id}/reschedule`, { dayLabel, timeSlot }, withAuth(getAuthToken()));
}
