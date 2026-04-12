"use client";

import { useState } from "react";
import { CountdownBar } from "./CountdownBar";

type Option = { optionKey: string; diseaseName: string };

type MysteryDiagnosisRoundProps = {
  payload: {
    presentingComplaint: string;
    fullVignetteText: string;
    patientAge?: number;
    patientSex?: string;
    options: Option[];
    difficulty: string;
  };
  roundTimerSeconds?: number;
  opponentsAnswered: string[]; // display names of opponents who have answered
  onSubmit: (selectedOptionKey: string) => Promise<void>;
  correctOptionKey: string | null; // null while round active
};

const DIFFICULTY_COLOR: Record<string, string> = {
  EASY: "text-green-400 bg-green-400/10",
  MEDIUM: "text-amber-400 bg-amber-400/10",
  HARD: "text-red-400 bg-red-400/10",
};

export function MysteryDiagnosisRound({
  payload,
  roundTimerSeconds = 60,
  opponentsAnswered,
  onSubmit,
  correctOptionKey,
}: MysteryDiagnosisRoundProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const roundActive = correctOptionKey === null;

  async function pick(optionKey: string) {
    if (submitted || !roundActive) return;
    setSelected(optionKey);
    setSubmitted(true);
    await onSubmit(optionKey);
  }

  function optionState(key: string): "default" | "selected" | "correct" | "wrong" {
    if (correctOptionKey === null) {
      return selected === key ? "selected" : "default";
    }
    if (key === correctOptionKey) return "correct";
    if (selected === key && key !== correctOptionKey) return "wrong";
    return "default";
  }

  const stateClass: Record<string, string> = {
    default: "border-border-subtle bg-surface-card text-text-secondary hover:border-accent-border",
    selected: "border-accent bg-accent-muted text-accent-text",
    correct: "border-green-400 bg-green-400/10 text-green-400",
    wrong: "border-red-400 bg-red-400/10 text-red-400",
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-text-primary">Mystery Diagnosis</h2>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${DIFFICULTY_COLOR[payload.difficulty] ?? ""}`}>
          {payload.difficulty}
        </span>
      </div>

      {/* Clinical case card */}
      <div className="rounded-lg border border-border-subtle bg-surface-card p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          {payload.patientAge !== undefined && <span>Age {payload.patientAge}</span>}
          {payload.patientSex && <span>\u00b7 {payload.patientSex}</span>}
        </div>
        <p className="text-sm font-medium text-accent-text">{payload.presentingComplaint}</p>
        <p className="text-sm text-text-secondary leading-relaxed">{payload.fullVignetteText}</p>
      </div>

      <CountdownBar durationSeconds={roundTimerSeconds} />

      {/* Opponent status */}
      {opponentsAnswered.length > 0 && (
        <div className="rounded-lg bg-surface-elevated px-3 py-2 text-xs text-text-muted">
          <span>Answered: </span>
          {opponentsAnswered.join(", ")}
        </div>
      )}

      {/* Options */}
      <div className="space-y-2">
        {payload.options.map((opt) => {
          const state = optionState(opt.optionKey);
          return (
            <button
              key={opt.optionKey}
              onClick={() => pick(opt.optionKey)}
              disabled={submitted || !roundActive}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${stateClass[state]} disabled:cursor-not-allowed`}
            >
              <span className="font-medium mr-2">{opt.optionKey}.</span>
              {opt.diseaseName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
