import type { ConsultTypeId } from "@/lib/content/consults";
import { apiGet, apiPost } from "@/lib/api";
import { getClientId } from "@/lib/client-id";

export type StoredConsult = {
  id: string;
  clientId: string;
  type: ConsultTypeId;
  dayLabel: string;
  timeSlot: string;
  concern: string;
  createdAt: string;
};

export function getConsults(): Promise<StoredConsult[]> {
  return apiGet<StoredConsult[]>(`/consults?clientId=${getClientId()}`);
}

/** Only one active booking per type — the backend replaces any existing booking of the same type. */
export function saveConsult(input: Omit<StoredConsult, "id" | "clientId" | "createdAt">): Promise<StoredConsult> {
  return apiPost<StoredConsult>("/consults", { ...input, clientId: getClientId() });
}
