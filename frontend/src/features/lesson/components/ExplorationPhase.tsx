"use client";

import { EtymologyReveal } from "./EtymologyReveal";
import { AnatomyExplainTab } from "@/features/anatomy/components/AnatomyExplainTab";
import type { LessonDto } from "../types/lesson.types";

const SYSTEM_COLOR: Record<string, string> = {
  Cardiovascular: "#A82828",
  Nervous: "#8F5F0F",
  Respiratory: "#1A5C96",
  Digestive: "#5E6E1F",
  Musculoskeletal: "#3B4F8C",
  Endocrine: "#1A6B6B",
  Immune: "#2D6A3F",
  Reproductive: "#8C3060",
};

type Props = {
  lesson: LessonDto;
  onDone: () => void;
};

export function ExplorationPhase({ lesson, onDone }: Props) {
  const explore = lesson.explore;

  if (!explore) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center space-y-4">
        <p className="text-sm text-text-secondary italic">
          No explore structure today — content pending.
        </p>
        <button
          onClick={onDone}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-accent text-white"
        >
          Continue
        </button>
      </div>
    );
  }

  const accent = SYSTEM_COLOR[explore.system] ?? "#5A2B94";

  return (
    <div className="max-w-xl mx-auto px-6 py-8 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-text-muted">Explore</p>
        <h1
          className="mt-1 text-3xl font-semibold"
          style={{ color: accent, fontFamily: "var(--font-display)" }}
        >
          {explore.displayName}
        </h1>
      </div>

      <EtymologyReveal
        root={explore.etymologyPreviewRoot}
        origin={null}
        meaning={null}
      />

      <div className="rounded-xl border border-border-subtle bg-surface-card">
        <AnatomyExplainTab canonicalId={explore.canonicalId} />
      </div>

      {/* Diagram label interaction is Sprint 12 extended content — currently stubbed. */}
      <div className="rounded-xl border border-dashed border-border-default p-5 text-center">
        <p className="text-xs text-text-muted italic">
          Diagram label interaction arrives with illustrated structure assets.
        </p>
      </div>

      <button
        onClick={onDone}
        className="w-full py-3 text-sm font-semibold rounded-lg bg-accent text-white"
      >
        Finish lesson
      </button>
    </div>
  );
}
