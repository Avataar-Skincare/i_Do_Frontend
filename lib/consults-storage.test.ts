import { describe, it, expect } from "vitest";
import { mockApi } from "@/tests/fetch-mock";
import { cancelConsult, consultWhen, getMyConsults, rescheduleConsult, saveConsult } from "@/lib/consults-storage";
import contractConsults from "@/tests/contract/consults-mine.json";

describe("consult calls", () => {
  it("lists my consults", async () => {
    mockApi({ "GET /consults/mine": { body: contractConsults } });
    expect((await getMyConsults())[0].doctorName).toBe("Dr. A. Kapoor");
  });

  it("books, cancels and reschedules one session at a time", async () => {
    const api = mockApi({
      "POST /consults": { status: 201, body: {} },
      "PATCH /consults/c1/cancel": { body: {} },
      "PATCH /consults/c1/reschedule": { body: {} },
    });
    await saveConsult({ name: "A", phone: "9876543210", email: "a@x.in", type: "derm", dayLabel: "Thu 12 Nov", timeSlot: "10:00 AM", concern: "sleep" });
    await cancelConsult("c1");
    await rescheduleConsult("c1", "Fri 13 Nov", "11:00 AM");
    expect(api.calls.map((c) => `${c.method} ${c.path}`)).toEqual(["POST /consults", "PATCH /consults/c1/cancel", "PATCH /consults/c1/reschedule"]);
    expect(api.calls[2].body).toEqual({ dayLabel: "Fri 13 Nov", timeSlot: "11:00 AM" });
  });
});

describe("consultWhen", () => {
  it("prefers the partner's confirmed time, in IST", () => {
    expect(consultWhen({ appointmentAt: "2026-11-12T10:00:00+05:30", appointmentDate: "2026-11-12", timeSlot: "10:00 AM" })).toBe("12 Nov, 10:00 IST");
  });
  it("before confirmation shows the requested day and slot", () => {
    expect(consultWhen({ appointmentAt: null, appointmentDate: "2026-11-12", timeSlot: "10:00 AM" })).toBe("12 Nov · 10:00 AM");
  });
  it("still reads the booking screen's own day label", () => {
    expect(consultWhen({ dayLabel: "Thu 12 Nov", timeSlot: "10:00 AM" })).toBe("Thu 12 Nov · 10:00 AM");
  });
});
