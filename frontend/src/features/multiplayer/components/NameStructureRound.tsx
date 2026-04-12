"use client";

import { useState } from "react";
import { CountdownBar } from "./CountdownBar";

type NameStructureRoundProps = {
  payload: {
    canonicalId: string;
    regionHint: string;
    system: string;
  };
  roundTimerSeconds?: number;
  onSubmit: (answer: string) => Promise<void>;
  correctAnswer: string | null; // null while round active
};

export function NameStructureRound({
  payload,
  roundTimerSeconds = 30,
  onSubmit,
  correctAnswer,
}: NameStructureRoundProps) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitted || !answer.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(answer.trim());
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  const roundActive = correctAnswer === null;

  return (
    <div className="max-w-xl mx-auto px-6 py-8 space-y-6">
      <h2 className="text-sm font-semibold text-text-primary">Name the highlighted structure</h2>

      <div className="rounded-lg border border-border-subtle bg-surface-card p-6 text-center space-y-2">
        <p className="text-xs text-text-muted">Region hint</p>
        <p className="text-lg font-medium text-text-primary">{payload.regionHint}</p>
        <p className="text-[10px] font-mono text-text-ghost mt-2">{payload.canonicalId}</p>
      </div>

      <CountdownBar durationSeconds={roundTimerSeconds} />

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={submitted || !roundActive}
          placeholder="Type the structure name..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-border-default bg-surface-card text-text-primary focus:border-accent focus:outline-none disabled:opacity-50"
          autoFocus
        />
        <button
          type="submit"
          disabled={submitted || !answer.trim() || submitting || !roundActive}
          className="w-full py-2 text-sm font-medium rounded-lg bg-accent text-white disabled:opacity-30"
        >
          {submitted ? "Answer submitted" : submitting ? "Submitting..." : "Submit"}
        </button>
      </form>

      {!roundActive && correctAnswer && (
        <div className="rounded-lg border border-green-400/30 bg-green-400/10 p-4 text-center">
          <p className="text-xs text-text-muted">Correct answer</p>
          <p className="text-sm font-semibold text-green-400">{correctAnswer}</p>
        </div>
      )}
    </div>
  );
}
