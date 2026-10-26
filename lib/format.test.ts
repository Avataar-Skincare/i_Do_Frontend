import { describe, it, expect } from "vitest";
import { formatINR, formatIstDateTime, formatIstDate, daysUntil } from "@/lib/format";

describe("formatINR", () => {
  it("renders paise as rupees with Indian grouping", () => {
    expect(formatINR(1499900)).toBe("₹14,999");
    expect(formatINR(10000)).toBe("₹100");
    expect(formatINR(0)).toBe("₹0");
    expect(formatINR(12345600)).toBe("₹1,23,456");
    expect(formatINR(12345678)).toBe("₹1,23,457"); // rounds to the nearest rupee
  });
});

describe("formatIstDateTime", () => {
  it("shows the target date in Indian time whatever the offset sent", () => {
    expect(formatIstDateTime("2026-12-05T23:59:00+05:30")).toBe("05 Dec, 23:59 IST");
    expect(formatIstDateTime("2026-12-05T18:29:00Z")).toBe("05 Dec, 23:59 IST");
  });
});

describe("daysUntil", () => {
  const now = Date.parse("2026-10-24T00:00:00Z");
  it("rounds partial days up", () => {
    expect(daysUntil("2026-10-25T01:00:00Z", now)).toBe(2);
    expect(daysUntil("2026-10-25T00:00:00Z", now)).toBe(1);
  });
  it("is 0 once passed", () => {
    expect(daysUntil("2026-10-20T00:00:00Z", now)).toBe(0);
  });
});

describe("formatIstDate", () => {
  it("shows the calendar day in Indian time, even when UTC is still the day before", () => {
    expect(formatIstDate("2026-10-27T17:05:00+05:30")).toBe("27 Oct");
    expect(formatIstDate("2026-10-26T20:00:00Z")).toBe("27 Oct");
  });
});
