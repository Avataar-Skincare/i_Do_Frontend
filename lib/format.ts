/** Amounts are stored in paise (integers). `paise` of 1499900 renders as "₹14,999". */
export function formatINR(paise: number): string {
  const rupees = Math.round(paise) / 100;
  return "₹" + rupees.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

/** "05 Dec, 23:59 IST": the target dates the API sends (ISO with offset), shown in Indian time. */
export function formatIstDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", timeZone: "Asia/Kolkata" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
  return `${date}, ${time} IST`;
}

/** Whole days from `nowMs` until `iso`, rounded up; 0 once it has passed. */
export function daysUntil(iso: string, nowMs: number): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - nowMs) / 86_400_000));
}
