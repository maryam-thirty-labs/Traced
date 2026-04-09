"use client";

import { useState } from "react";
import type { CaseDetailDto } from "../types/case.types";

type CasePlayerProps = {
  caseData: CaseDetailDto;
  onSubmit: (answers: Record<string, string>) => void;
};

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "text-green-400 bg-green-400/10",
  MEDIUM: "text-amber-400 bg-amber-400/10",
  HARD: "text-red-400 bg-red-400/10",
};

export function CasePlayer({ caseData, onSubmit }: CasePlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const question = caseData.questions[currentStep];
  const totalSteps = caseData.questions.length;
  const allAnswered = Object.keys(answers).length === totalSteps;
  const currentAnswered = question ? !!answers[question.questionId] : false;

  function selectOption(questionId: string, optionKey: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-text-primary">{caseData.title}</h1>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${DIFFICULTY_COLORS[caseData.difficulty] ?? ""}`}>
            {caseData.difficulty}
          </span>
        </div>
        <p className="text-sm text-text-secondary">{caseData.subtitle}</p>
      </div>

      {/* Vignette */}
      {caseData.vignette && (
        <div className="rounded-lg border border-border-subtle bg-surface-card p-4 space-y-2">
          <h3 className="text-xs font-semibold uppercase text-text-muted">Patient Presentation</h3>
          <p className="text-sm leading-relaxed text-text-secondary">
            {caseData.vignette.fullVignetteText}
          </p>
        </div>
      )}

      {/* Clue grid */}
      {caseData.clues.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {caseData.clues.map((clue) => (
            <div
              key={clue.displayOrder}
              className={`rounded-lg border p-3 ${
                clue.isAbnormal
                  ? "border-red-400/30 bg-red-400/5"
                  : "border-border-subtle bg-surface-card"
              }`}
            >
              <span className="text-[10px] uppercase text-text-muted">{clue.label}</span>
              <p className={`text-sm font-medium ${clue.isAbnormal ? "text-red-400" : "text-text-primary"}`}>
                {clue.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Progress dots */}
      <div className="flex items-center gap-1.5 justify-center">
        {caseData.questions.map((q, i) => (
          <button
            key={q.questionId}
            onClick={() => setCurrentStep(i)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i === currentStep
                ? "bg-accent"
                : answers[q.questionId]
                  ? "bg-accent/50"
                  : "bg-surface-elevated"
            }`}
          />
        ))}
      </div>

      {/* Question */}
      {question && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text-primary">
            Q{question.stepNumber}. {question.questionText}
          </h3>
          <div className="flex flex-col gap-2">
            {question.options.map((opt) => {
              const isSelected = answers[question.questionId] === opt.optionKey;
              return (
                <button
                  key={opt.optionKey}
                  onClick={() => selectOption(question.questionId, opt.optionKey)}
                  className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                    isSelected
                      ? "border-accent bg-accent-muted text-accent-text"
                      : "border-border-subtle bg-surface-card text-text-secondary hover:border-accent-border"
                  }`}
                >
                  <span className="font-medium mr-2">{opt.optionKey}.</span>
                  {opt.optionText}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation + Submit */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          className="text-xs text-text-muted hover:text-text-secondary disabled:opacity-30"
        >
          Previous
        </button>

        {currentStep < totalSteps - 1 ? (
          <button
            onClick={() => setCurrentStep((s) => s + 1)}
            disabled={!currentAnswered}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-surface-elevated text-text-secondary hover:text-text-primary disabled:opacity-30"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => onSubmit(answers)}
            disabled={!allAnswered}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-accent text-white disabled:opacity-30"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}
