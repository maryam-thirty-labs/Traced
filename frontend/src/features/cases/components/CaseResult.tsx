"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SubmissionResult } from "../lib/caseApi";

type CaseResultProps = {
  result: SubmissionResult;
  caseTitle: string;
  previousLevel?: number;
};

function useCountUp(target: number, durationMs = 800): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }

    const startTime = performance.now();
    let raf: number;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

export function CaseResult({ result, caseTitle, previousLevel }: CaseResultProps) {
  const isCorrect = result.outcome === "CORRECT";
  const animatedXp = useCountUp(result.xpAwarded);
  const showLevelUp = previousLevel !== undefined && result.currentLevel > previousLevel;
  const [levelUpVisible, setLevelUpVisible] = useState(false);

  useEffect(() => {
    if (showLevelUp) {
      const timer = setTimeout(() => setLevelUpVisible(true), 900);
      return () => clearTimeout(timer);
    }
  }, [showLevelUp]);

  return (
    <div className="flex flex-col items-center gap-6 max-w-md mx-auto px-6 py-12 text-center">
      {/* Level up banner */}
      {levelUpVisible && (
        <div className="w-full rounded-lg p-4 bg-accent-muted border border-accent-border animate-pulse">
          <p className="text-sm font-bold text-accent-text">
            Level Up! You are now Level {result.currentLevel}
          </p>
        </div>
      )}

      {/* Outcome banner */}
      <div
        className={`w-full rounded-lg p-6 ${
          isCorrect ? "bg-green-400/10 border border-green-400/30" : "bg-red-400/10 border border-red-400/30"
        }`}
      >
        <h2
          className={`text-2xl font-bold ${isCorrect ? "text-green-400" : "text-red-400"}`}
        >
          {isCorrect ? "Correct!" : "Incorrect"}
        </h2>
        <p className="text-sm text-text-secondary mt-1">{caseTitle}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 w-full">
        <div className="flex flex-col items-center gap-1 rounded-lg border border-border-subtle bg-surface-card p-3">
          <span className="text-xs text-text-muted">Score</span>
          <span className="text-lg font-mono font-bold text-text-primary">{result.score}%</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-lg border border-border-subtle bg-surface-card p-3">
          <span className="text-xs text-text-muted">XP Earned</span>
          <span className="text-lg font-mono font-bold text-accent-text">+{animatedXp}</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-lg border border-border-subtle bg-surface-card p-3">
          <span className="text-xs text-text-muted">Level</span>
          <span className="text-lg font-mono font-bold text-text-primary">{result.currentLevel}</span>
        </div>
      </div>

      {/* Questions breakdown */}
      <p className="text-sm text-text-secondary">
        {result.correctCount} of {result.totalQuestions} questions correct
      </p>

      {/* Total XP */}
      <p className="text-xs text-text-muted">
        Total XP: {result.totalXp}
      </p>

      {/* Navigation */}
      <div className="flex gap-3">
        <Link
          href="/explorer"
          className="px-4 py-2 text-xs font-medium rounded-lg border border-border-subtle text-text-secondary hover:text-text-primary"
        >
          Back to Explorer
        </Link>
        <Link
          href="/cases"
          className="px-4 py-2 text-xs font-medium rounded-lg bg-accent text-white"
        >
          More Cases
        </Link>
      </div>
    </div>
  );
}
