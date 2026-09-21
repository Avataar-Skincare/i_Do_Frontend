"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { CONSULT_TYPES, TIME_SLOTS, WHY_IT_WORKS, CONSULT_NOTE, type ConsultTypeId } from "@/lib/content/consults";
import { saveConsult } from "@/lib/consults-storage";
import { ApiError } from "@/lib/api";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function useNextDays(count: number) {
  return useMemo(() => {
    const days = [];
    const start = new Date();
    start.setDate(start.getDate() + 1);
    for (let i = 0; i < count; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({
        key: d.toISOString().slice(0, 10),
        dow: DOW[d.getDay()],
        date: d.getDate(),
        month: MONTHS[d.getMonth()],
        available: d.getDay() !== 0, // closed Sundays
        label: `${DOW[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`,
      });
    }
    return days;
  }, [count]);
}

export function ConsultBooking() {
  const [type, setType] = useState<ConsultTypeId>("derm");
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [concern, setConcern] = useState("");
  const [confirmed, setConfirmed] = useState<{ dayLabel: string; timeSlot: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const days = useNextDays(10);
  const active = CONSULT_TYPES.find((t) => t.id === type)!;

  function selectType(next: ConsultTypeId) {
    setType(next);
    setConfirmed(null);
    setSubmitError(null);
  }

  async function confirmBooking() {
    if (!day || !time) return;
    const dayLabel = days.find((d) => d.key === day)!.label;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await saveConsult({ type, dayLabel, timeSlot: time, concern });
      setConfirmed({ dayLabel, timeSlot: time });
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "Couldn't confirm your booking — check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {CONSULT_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => selectType(t.id)}
            className={[
              "flex items-start gap-4 text-left p-6 rounded-card border-[1.5px] transition-colors",
              type === t.id ? "border-gold bg-gold-tint" : "border-line-2 bg-surface",
            ].join(" ")}
          >
            <span className="w-11 h-11 shrink-0 rounded-full bg-surface shadow-sm grid place-items-center text-ink">
              <Icon name={t.icon} size={20} />
            </span>
            <div>
              <h3 className="text-lg font-semibold mb-1">{t.label}</h3>
              <p className="text-muted text-[0.94rem] m-0">{t.tabBody}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
        <div className="bg-surface border border-line rounded-lg p-8">
          {confirmed ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-sage-bg text-sage grid place-items-center mx-auto mb-4">
                <Icon name="check" size={26} />
              </div>
              <h3 className="text-2xl font-serif mb-2">Booking confirmed</h3>
              <p className="text-ink-2">
                Your {active.label.toLowerCase()} consult is set for {confirmed.dayLabel} at{" "}
                {confirmed.timeSlot}.
              </p>
            </div>
          ) : (
            <>
              <div className="font-mono text-xs tracking-[0.08em] uppercase text-gold-deep mb-4">
                {active.eyebrow}
              </div>
              <p className="text-ink-2 mb-6">{active.detailBody}</p>

              <div className="font-mono text-xs tracking-[0.08em] uppercase text-muted mb-3">Choose a day</div>
              <div className="flex gap-2.5 overflow-x-auto pb-2 mb-6">
                {days.map((d) => (
                  <button
                    key={d.key}
                    disabled={!d.available}
                    onClick={() => setDay(d.key)}
                    className={[
                      "flex-shrink-0 w-[74px] rounded-sm border py-3 text-center transition-colors",
                      !d.available && "opacity-40 cursor-not-allowed",
                      day === d.key ? "bg-nav border-nav text-white" : "border-line-2 bg-surface text-ink",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className="font-mono text-[0.68rem] tracking-[0.06em] uppercase opacity-70">{d.dow}</div>
                    <div className="font-serif text-2xl leading-tight mt-0.5">{d.date}</div>
                    <div className="text-[0.68rem] opacity-70">{d.month}</div>
                  </button>
                ))}
              </div>

              <div className="font-mono text-xs tracking-[0.08em] uppercase text-muted mb-3">Choose a time</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setTime(slot)}
                    className={[
                      "rounded-sm border py-3 text-center font-semibold text-sm transition-colors",
                      time === slot ? "bg-gold border-gold text-white" : "border-line-2 bg-surface text-ink",
                    ].join(" ")}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              <label className="block text-sm font-medium text-ink-2 mb-2">
                What&rsquo;s on your mind? <span className="text-muted font-normal">(optional)</span>
              </label>
              <textarea
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                placeholder="e.g. breakouts before my period, dullness, hair fall…"
                rows={3}
                className="w-full bg-bg-2 border border-line-2 rounded-sm py-3.5 px-4 text-[0.98rem] resize-y mb-6 focus:outline-none focus:border-gold"
              />

              {submitError && <p className="text-[0.85rem] text-error mb-3.5">{submitError}</p>}
              <button
                onClick={confirmBooking}
                disabled={!day || !time || submitting}
                className="w-full bg-gold text-white font-semibold py-4 rounded-pill inline-flex items-center justify-center gap-2 hover:bg-gold-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon name="cal" size={18} /> {submitting ? "Confirming…" : "Confirm booking"}
              </button>
            </>
          )}
        </div>

        <WhyItsWorthIt />
      </div>
    </div>
  );
}

function WhyItsWorthIt() {
  return (
    <div className="bg-surface border border-line rounded-lg p-7">
      <h3 className="text-xl font-semibold mb-5">Why it&rsquo;s worth it</h3>
      <div className="flex flex-col gap-5">
        {WHY_IT_WORKS.map((item) => (
          <div key={item.title} className="flex gap-3.5">
            <span className="w-10 h-10 shrink-0 rounded-xl bg-gold-tint text-gold-deep grid place-items-center">
              <Icon name={item.icon} size={18} />
            </span>
            <div>
              <h4 className="text-base font-semibold mb-1">{item.title}</h4>
              <p className="text-ink-2 text-[0.94rem] m-0">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 bg-gold-tint border border-gold-wash rounded-sm p-4 flex gap-3 items-start text-[0.9rem] text-ink-2">
        <Icon name="info" size={18} className="text-gold-deep shrink-0 mt-0.5" />
        <p className="m-0">{CONSULT_NOTE}</p>
      </div>
    </div>
  );
}
