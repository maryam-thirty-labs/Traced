"use client";

import { useState } from "react";
import { CountdownBar } from "./CountdownBar";

type Option = { canonicalId: string; displayName: string };

type TraceSystemRoundProps = {
  payload: {
    system: string;
    shuffledOptions: Option[];
    expectedLength: number;
  };
  roundTimerSeconds?: number;
  onSubmit: (sequence: string[]) => Promise<void>;
  correctSequence: string[] | null; // null while round active
};

export function TraceSystemRound({
  payload,
  roundTimerSeconds = 60,
  onSubmit,
  correctSequence,
}: TraceSystemRoundProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const roundActive = correctSequence === null;
  const allChosen = selected.length === payload.expectedLength;

  function toggle(id: string) {
    if (submitted || !roundActive) return;
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= payload.expectedLength) return prev;
      return [...prev, id];
    });
  }

  async function handleSubmit() {
    if (submitted || !allChosen) return;
    await onSubmit(selected);
    setSubmitted(true);
  }

  function optionStatus(id: string): "default" | "selected" | "correct" | "wrong" {
    if (correctSequence !== null) {
      const mySelectionIdx = selected.indexOf(id);
      const correctIdx = correctSequence.indexOf(id);
      if (mySelectionIdx !== -1 && correctIdx === mySelectionIdx) return "correct";
      if (mySelectionIdx !== -1 && correctIdx !== mySelectionIdx) return "wrong";
      return "default";
    }
    return selected.includes(id) ? "selected" : "default";
  }

  const statusClass: Record<string, string> = {
    default: "border-border-subtle bg-surface-card text-text-secondary",
    selected: "border-accent bg-accent-muted text-accent-text",
    correct: "border-green-400 bg-green-400/10 text-green-400",
    wrong: "border-red-400 bg-red-400/10 text-red-400",
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <h2 className="text-sm font-semibold text-text-primary">
        Trace the system: tap organs in anatomical order
      </h2>

      <CountdownBar durationSeconds={roundTimerSeconds} />

      {/* Progress dots */}
      <div className="flex items-center gap-1.5 justify-center">
        {Array.from({ length: payload.expectedLength }).map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i < selected.length ? "bg-accent" : "bg-surface-elevated"
            }`}
          />
        ))}
      </div>

      {/* Organ grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {payload.shuffledOptions.map((opt) => {
          const status = optionStatus(opt.canonicalId);
          const orderIdx = selected.indexOf(opt.canonicalId);
          return (
            <button
              key={opt.canonicalId}
              onClick={() => toggle(opt.canonicalId)}
              disabled={submitted || !roundActive}
              className={`relative text-left px-3 py-3 rounded-lg border text-sm transition-colors ${statusClass[status]}`}
            >
              <span>{opt.displayName}</span>
              {orderIdx !== -1 && (
                <span className="absolute top-1.5 right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent text-white">
                  {orderIdx + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!allChosen || submitted || !roundActive}
        className="w-full py-2 text-sm font-medium rounded-lg bg-accent text-white disabled:opacity-30"
      >
        {submitted ? "Submitted" : allChosen ? "Submit sequence" : `${selected.length} / ${payload.expectedLength} selected`}
      </button>
    </div>
  );
}
