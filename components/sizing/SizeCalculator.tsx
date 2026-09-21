"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";
import { Note } from "@/components/ui/Note";
import { SIZES } from "@/lib/content/product";
import { SIZING_TIP } from "@/lib/content/sizing";

type Mode = "circumference" | "diameter";

function nearestSize(valueMm: number, mode: Mode) {
  const key = mode === "circumference" ? "circ" : "id";
  return SIZES.reduce((best, size) =>
    Math.abs(size[key] - valueMm) < Math.abs(best[key] - valueMm) ? size : best
  );
}

export function SizeCalculator() {
  const [mode, setMode] = useState<Mode>("circumference");
  const [value, setValue] = useState("");
  const [result, setResult] = useState<{ us: number; measured: number } | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = parseFloat(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    const match = nearestSize(parsed, mode);
    setResult({ us: match.us, measured: parsed });
  }

  function switchMode(next: Mode) {
    setMode(next);
    setResult(null);
  }

  return (
    <div className="bg-surface border border-line rounded-lg p-8">
      <div className="inline-flex bg-bg-3 rounded-pill p-1 mb-6">
        {(["circumference", "diameter"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={[
              "py-2 px-4.5 rounded-pill text-sm font-semibold capitalize transition-colors",
              mode === m ? "bg-nav text-white" : "text-muted",
            ].join(" ")}
          >
            {m}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <label className="block font-mono text-xs tracking-[0.08em] uppercase text-muted mb-2">
          Finger {mode} (mm)
        </label>
        <div className="flex gap-3 items-end flex-wrap">
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 57.2"
            className="flex-1 min-w-[160px] bg-bg-2 border border-line-2 rounded-sm py-3.5 px-4 text-[1.05rem] focus:outline-none focus:border-gold"
          />
          <button type="submit" className="bg-gold text-white font-semibold py-3.5 px-6 rounded-pill hover:bg-gold-deep transition-colors">
            Calculate
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-6 bg-gold-tint border border-gold-wash rounded-card p-6 text-center">
          <div className="font-serif text-5xl font-medium leading-none text-gold-deep">
            US {result.us}
          </div>
          <div className="text-[0.86rem] text-ink-2 mt-2">
            Best fit for {result.measured} mm {mode}
          </div>
        </div>
      )}

      <div className="mt-4.5">
        <Note>{SIZING_TIP}</Note>
      </div>

      <div className="flex gap-3 flex-wrap mt-6">
        <LinkButton href="/shop" variant="ghost">
          <Icon name="box" size={16} /> Free sizing kit
        </LinkButton>
        <LinkButton href="/shop" variant="dark">
          Shop the ring
        </LinkButton>
      </div>
    </div>
  );
}
