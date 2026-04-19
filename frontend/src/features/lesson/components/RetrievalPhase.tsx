"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import type {
  LessonDto,
  RetrievalAnswer,
  RetrievalItem,
} from "../types/lesson.types";

type Props = {
  lesson: LessonDto;
  onDone: (answers: RetrievalAnswer[]) => void;
};

function vibrate(ms: number) {
  if (typeof navigator === "undefined") return;
  const v = (navigator as Navigator & { vibrate?: (p: number) => boolean }).vibrate;
  try {
    v?.call(navigator, ms);
  } catch {
    // Silent fail on browsers without support.
  }
}

export function RetrievalPhase({ lesson, onDone }: Props) {
  const items = lesson.retrieval;
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [answers, setAnswers] = useState<RetrievalAnswer[]>([]);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center space-y-4">
        <p className="text-sm text-text-secondary">
          No retrieval items today. Skipping to exploration.
        </p>
        <button
          onClick={() => onDone([])}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-accent text-white"
        >
          Continue
        </button>
      </div>
    );
  }

  const current: RetrievalItem = items[index];
  const correctIdx = current.options.findIndex((o) => o.correct);

  const choose = (i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    const isCorrect = i === correctIdx;
    const nextAnswers: RetrievalAnswer[] = [
      ...answers,
      { structureId: current.structureId, correct: isCorrect },
    ];
    setAnswers(nextAnswers);
    if (isCorrect) vibrate(20);

    window.setTimeout(() => {
      if (index + 1 >= items.length) {
        onDone(nextAnswers);
      } else {
        setChosen(null);
        setIndex(index + 1);
      }
    }, 1200);
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-text-muted">
          Retrieval
        </span>
        <span className="text-xs font-mono text-text-secondary">
          {index + 1} of {items.length}
        </span>
      </div>

      <h2 className="text-2xl font-semibold text-text-primary">
        {current.displayName}
      </h2>
      <p className="text-sm text-text-secondary">
        Which description fits this structure?
      </p>

      <div className="flex flex-col gap-2">
        {current.options.map((option, i) => {
          const isChosen = chosen === i;
          const isCorrect = i === correctIdx;
          const revealed = chosen !== null;
          let variant = "border-border-default bg-surface-card hover:bg-surface-elevated";
          if (revealed && isCorrect) {
            variant = "border-green-400/50 bg-green-400/10 text-green-400";
          } else if (isChosen && !isCorrect) {
            variant = "border-red-400/50 bg-red-400/10 text-red-400";
          } else if (revealed) {
            variant = "border-border-subtle bg-surface-card opacity-60";
          }
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={chosen !== null}
              className={`text-left px-4 py-3 rounded-lg border transition-colors ${variant}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-sm leading-relaxed flex-1">{option.text}</span>
                {revealed && isCorrect && <Check size={16} className="shrink-0 mt-0.5" />}
                {isChosen && !isCorrect && <X size={16} className="shrink-0 mt-0.5" />}
              </div>
            </button>
          );
        })}
      </div>

      {chosen !== null && chosen !== correctIdx && (
        <p className="text-xs text-text-secondary italic">
          Correct answer: {current.options[correctIdx].text}
        </p>
      )}
    </div>
  );
}
