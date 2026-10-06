"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { CONSULT_TYPES, TIME_SLOTS, WHY_IT_WORKS, CONSULT_NOTE, type ConsultTypeId } from "@/lib/content/consults";
import { saveConsult, getMyConsults, cancelConsult, rescheduleConsult, type StoredConsult } from "@/lib/consults-storage";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AuthModal } from "@/components/account/AuthModal";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Day = { key: string; dow: string; date: number; month: string; available: boolean; label: string };

function useNextDays(count: number): Day[] {
  return useMemo(() => {
    const days: Day[] = [];
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

/** Compact day/time picker reused inside a SessionCard's reschedule mode — same rules, smaller footprint. */
function MiniSlotPicker({
  days,
  day,
  time,
  onDay,
  onTime,
  isTimeTaken,
}: {
  days: Day[];
  day: string | null;
  time: string | null;
  onDay: (key: string) => void;
  onTime: (slot: string) => void;
  /** Given the label for the currently selected day, is this slot already one of the customer's own active sessions? */
  isTimeTaken?: (dayLabel: string, slot: string) => boolean;
}) {
  const dayLabel = days.find((d) => d.key === day)?.label;
  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-1 mb-2">
        {days.map((d) => (
          <button
            key={d.key}
            disabled={!d.available}
            onClick={() => onDay(d.key)}
            className={[
              "flex-shrink-0 w-14 rounded-sm border py-2 text-center text-[0.8rem] transition-colors",
              !d.available && "opacity-40 cursor-not-allowed",
              day === d.key ? "bg-nav border-nav text-white" : "border-line-2 bg-surface text-ink",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="font-mono text-[0.6rem] uppercase opacity-70">{d.dow}</div>
            <div className="font-serif text-base leading-tight">{d.date}</div>
          </button>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {TIME_SLOTS.map((slot) => {
          const taken = !!dayLabel && !!isTimeTaken?.(dayLabel, slot);
          return (
            <button
              key={slot}
              disabled={taken}
              onClick={() => onTime(slot)}
              title={taken ? "You already have a session at this time" : undefined}
              className={[
                "rounded-sm border py-1.5 px-2.5 text-[0.8rem] font-semibold transition-colors",
                taken && "opacity-40 cursor-not-allowed",
                time === slot ? "bg-gold border-gold text-white" : "border-line-2 bg-surface text-ink",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {slot}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** One booked session — viewable, cancellable, and independently reschedulable. */
function SessionCard({
  booking,
  days,
  onCancel,
  onReschedule,
  isSlotTaken,
}: {
  booking: StoredConsult;
  days: Day[];
  onCancel: (id: string) => Promise<void>;
  onReschedule: (id: string, dayLabel: string, timeSlot: string) => Promise<void>;
  isSlotTaken: (dayLabel: string, timeSlot: string, excludeId?: string) => boolean;
}) {
  const [rescheduling, setRescheduling] = useState(false);
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelled = booking.status === "CANCELLED";
  const confirmed = booking.status === "CONFIRMED";

  async function handleCancel() {
    setBusy(true);
    setError(null);
    try {
      await onCancel(booking.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't cancel — check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveReschedule() {
    if (!day || !time) return;
    const dayLabel = days.find((d) => d.key === day)!.label;
    setBusy(true);
    setError(null);
    try {
      await onReschedule(booking.id, dayLabel, time);
      setRescheduling(false);
      setDay(null);
      setTime(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't reschedule — check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={[
        "rounded-sm border p-4",
        cancelled ? "bg-bg-2 border-line-2 opacity-70" : confirmed ? "bg-sage-bg border-sage/30" : "bg-gold-tint border-gold-wash",
      ].join(" ")}
    >
      <div className="flex gap-3 items-start">
        <Icon
          name={cancelled ? "close" : confirmed ? "check" : "info"}
          size={18}
          className={["shrink-0 mt-0.5", cancelled ? "text-muted" : confirmed ? "text-sage" : "text-gold-deep"].join(" ")}
        />
        <p className="m-0 text-[0.9rem] text-ink-2 flex-1">
          {cancelled ? (
            <>Cancelled — was {booking.dayLabel} at {booking.timeSlot}.</>
          ) : confirmed ? (
            <>
              Confirmed for {booking.dayLabel} at {booking.timeSlot}
              {booking.doctorName ? ` with ${booking.doctorName}` : ""}.
              {booking.meetingLink ? (
                <>
                  {" "}
                  <a href={booking.meetingLink} target="_blank" rel="noreferrer" className="underline">
                    Join link
                  </a>
                </>
              ) : null}
            </>
          ) : (
            <>Requested {booking.dayLabel} at {booking.timeSlot} — we&rsquo;ll confirm your slot shortly.</>
          )}
        </p>
      </div>

      {!cancelled && !rescheduling && (
        <div className="flex gap-4 mt-3 pl-[30px]">
          <button
            onClick={() => setRescheduling(true)}
            disabled={busy}
            className="text-[0.85rem] font-semibold text-gold-deep underline disabled:opacity-50"
          >
            Reschedule
          </button>
          <button
            onClick={handleCancel}
            disabled={busy}
            className="text-[0.85rem] font-semibold text-error underline disabled:opacity-50"
          >
            {busy ? "Cancelling…" : "Cancel"}
          </button>
        </div>
      )}

      {rescheduling && (
        <div className="mt-4 pl-[30px]">
          <MiniSlotPicker
            days={days}
            day={day}
            time={time}
            onDay={setDay}
            onTime={setTime}
            isTimeTaken={(dayLabel, slot) => isSlotTaken(dayLabel, slot, booking.id)}
          />
          {confirmed && (
            <p className="text-[0.78rem] text-muted mt-2 mb-0">
              Moving a confirmed session sends it back to our team to re-confirm with the doctor at the new time.
            </p>
          )}
          <div className="flex gap-3 mt-3">
            <button
              onClick={handleSaveReschedule}
              disabled={!day || !time || busy}
              className="text-[0.85rem] font-semibold text-white bg-gold rounded-pill py-2 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {busy ? "Saving…" : "Save new time"}
            </button>
            <button
              onClick={() => {
                setRescheduling(false);
                setDay(null);
                setTime(null);
                setError(null);
              }}
              disabled={busy}
              className="text-[0.85rem] font-semibold text-muted underline disabled:opacity-50"
            >
              Never mind
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-[0.8rem] text-error mt-2 pl-[30px]">{error}</p>}
    </div>
  );
}

/** Blocks scroll behind it and closes on Escape/backdrop click — same conventions as the header's mobile drawer. */
export function ConsultBooking() {
  const { user, loading } = useAuth();
  const [type, setType] = useState<ConsultTypeId>("derm");
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [concern, setConcern] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [myConsults, setMyConsults] = useState<StoredConsult[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const days = useNextDays(10);
  const active = CONSULT_TYPES.find((t) => t.id === type)!;
  const sessionsForType = myConsults.filter((c) => c.type === type);
  const isPhoneValid = /^\d{10}$/.test(phone);
  const isEmailValid = /^\S+@\S+\.\S+$/.test(email);
  const selectedDayLabel = day ? days.find((d) => d.key === day)?.label : undefined;

  /**
   * Real-world constraint, not a per-type one: you can't be in two consults at the
   * same moment, so this checks across every active session regardless of type.
   * `excludeId` lets a session's own reschedule picker ignore its own current slot.
   */
  function isSlotTaken(dayLabel: string, timeSlot: string, excludeId?: string): boolean {
    return myConsults.some(
      (c) => c.id !== excludeId && c.status !== "CANCELLED" && c.dayLabel === dayLabel && c.timeSlot === timeSlot
    );
  }

  // Prefill from the account once we know who's logged in — doesn't clobber
  // anything the person already typed while browsing as a guest. Email/phone
  // are collected here independently of the account either way (an account
  // can lack one of them), so this is just a convenience, not a requirement.
  useEffect(() => {
    if (user?.fullName && !name) setName(user.fullName);
    if (user?.email && !email) setEmail(user.email);
    if (user?.phone && !phone) setPhone(user.phone);
  }, [user, name, email, phone]);

  useEffect(() => {
    if (!user) {
      setMyConsults([]);
      return;
    }
    getMyConsults()
      .then(setMyConsults)
      .catch(() => setMyConsults([]));
  }, [user]);

  // Logging in inside the modal re-renders this with a `user` for the first
  // time — if that happened while the modal was open for this exact reason,
  // finish the booking immediately instead of making them click twice.
  useEffect(() => {
    if (showAuthModal && user) {
      setShowAuthModal(false);
      void confirmBooking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function selectType(next: ConsultTypeId) {
    setType(next);
    setSubmitError(null);
  }

  function selectDay(key: string) {
    setDay(key);
    // The previously-picked time might already be taken on this new day — don't
    // let a stale, now-invalid selection sit there looking chosen.
    const newDayLabel = days.find((d) => d.key === key)?.label;
    if (time && newDayLabel && isSlotTaken(newDayLabel, time)) {
      setTime(null);
    }
  }

  async function handleCancelSession(id: string) {
    const updated = await cancelConsult(id);
    setMyConsults((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }

  async function handleRescheduleSession(id: string, dayLabel: string, timeSlot: string) {
    const updated = await rescheduleConsult(id, dayLabel, timeSlot);
    setMyConsults((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }

  async function confirmBooking() {
    if (!day || !time || !name.trim() || !isPhoneValid || !isEmailValid) return;
    const dayLabel = days.find((d) => d.key === day)!.label;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const saved = await saveConsult({
        type,
        dayLabel,
        timeSlot: time,
        concern,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
      });
      setMyConsults((prev) => [saved, ...prev]);
      setDay(null);
      setTime(null);
      setConcern("");
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "Couldn't confirm your booking — check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleConfirmClick() {
    if (!day || !time || !name.trim() || !isPhoneValid || !isEmailValid) return;
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    void confirmBooking();
  }

  if (loading) {
    return <div className="text-center py-16 text-muted">Loading…</div>;
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

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6 items-start">
        <div className="min-w-0 bg-surface border border-line rounded-lg p-8">
          <div className="font-mono text-xs tracking-[0.08em] uppercase text-gold-deep mb-4">{active.eyebrow}</div>
          <p className="text-ink-2 mb-6">{active.detailBody}</p>

          <div className="font-mono text-xs tracking-[0.08em] uppercase text-muted mb-3">Choose a day</div>
          <div className="flex gap-2.5 overflow-x-auto pb-2 mb-6">
            {days.map((d) => (
              <button
                key={d.key}
                disabled={!d.available}
                onClick={() => selectDay(d.key)}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
            {TIME_SLOTS.map((slot) => {
              const taken = !!selectedDayLabel && isSlotTaken(selectedDayLabel, slot);
              return (
                <button
                  key={slot}
                  disabled={taken}
                  onClick={() => setTime(slot)}
                  title={taken ? "You already have a session at this time" : undefined}
                  className={[
                    "rounded-sm border py-3 text-center font-semibold text-sm transition-colors",
                    taken && "opacity-40 cursor-not-allowed",
                    time === slot ? "bg-gold border-gold text-white" : "border-line-2 bg-surface text-ink",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {slot}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-ink-2 mb-2">Your name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full bg-bg-2 border border-line-2 rounded-sm py-3.5 px-4 text-[0.98rem] focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-2 mb-2">Phone number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile"
                inputMode="numeric"
                className="w-full bg-bg-2 border border-line-2 rounded-sm py-3.5 px-4 text-[0.98rem] focus:outline-none focus:border-gold"
              />
              {phone && phone.length < 10 && (
                <p className="text-[0.78rem] text-error mt-1.5">Enter a 10-digit mobile number</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-ink-2 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full bg-bg-2 border border-line-2 rounded-sm py-3.5 px-4 text-[0.98rem] focus:outline-none focus:border-gold"
              />
              {email && !isEmailValid && <p className="text-[0.78rem] text-error mt-1.5">Enter a valid email</p>}
            </div>
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
            onClick={handleConfirmClick}
            disabled={!day || !time || !name.trim() || !isPhoneValid || !isEmailValid || submitting}
            className="w-full bg-gold text-white font-semibold py-4 rounded-pill inline-flex items-center justify-center gap-2 hover:bg-gold-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="cal" size={18} /> {submitting ? "Confirming…" : "Confirm booking"}
          </button>

          {sessionsForType.length > 0 && (
            <div className="mt-8">
              <div className="font-mono text-xs tracking-[0.08em] uppercase text-muted mb-3">
                Your {active.label.toLowerCase()} sessions
              </div>
              <div className="flex flex-col gap-3">
                {sessionsForType.map((booking) => (
                  <SessionCard
                    key={booking.id}
                    booking={booking}
                    days={days}
                    onCancel={handleCancelSession}
                    onReschedule={handleRescheduleSession}
                    isSlotTaken={isSlotTaken}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <WhyItsWorthIt />
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          lead="Log in or create an account to confirm your booking — we'll pick up right where you left off."
        />
      )}
    </div>
  );
}

function WhyItsWorthIt() {
  return (
    <div className="min-w-0 bg-surface border border-line rounded-lg p-7">
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
