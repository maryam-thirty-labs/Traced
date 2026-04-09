"use client";

import Link from "next/link";
import type { SubmissionResult } from "../lib/caseApi";

type CaseResultProps = {
  result: SubmissionResult;
  caseTitle: string;
};

export function CaseResult({ result, caseTitle }: CaseResultProps) {
  const isCorrect = result.outcome === "CORRECT";

  return (
    <div className="flex flex-col items-center gap-6 max-w-md mx-auto px-6 py-12 text-center">
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
          <span className="text-lg font-bold text-text-primary">{result.score}%</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-lg border border-border-subtle bg-surface-card p-3">
          <span className="text-xs text-text-muted">XP Earned</span>
          <span className="text-lg font-bold text-accent-text">+{result.xpAwarded}</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-lg border border-border-subtle bg-surface-card p-3">
          <span className="text-xs text-text-muted">Level</span>
          <span className="text-lg font-bold text-text-primary">{result.currentLevel}</span>
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
