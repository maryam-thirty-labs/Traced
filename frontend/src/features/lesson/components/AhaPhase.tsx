"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Flame, Share2 } from "lucide-react";
import { shareOrDownloadCard } from "@/features/etymology/lib/shareCard";
import type { EtymologyEntry } from "@/features/etymology/types/etymology.types";
import type { LessonCompletionDto, LessonDto } from "../types/lesson.types";

const AHA_FACTS: Record<string, string> = {
  ANAT_HEART_001:
    "Your heart beats 100,000 times a day without you thinking about it once.",
  ANAT_LIVER_001:
    "Your liver regenerates — even a quarter of it is enough to regrow the whole thing.",
  ANAT_LUNG_001:
    "Your lungs have enough surface area, unfolded, to cover a tennis court.",
};

type Props = {
  lesson: LessonDto;
  completion: LessonCompletionDto | null;
};

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useCountUp(target: number, durationMs = 900) {
  const [value, setValue] = useState(prefersReducedMotion() ? target : 0);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(target * t));
      if (t < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [target, durationMs]);
  return value;
}

async function sharePlainText(text: string) {
  const shareData: ShareData = { title: "Traced", text };
  const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
  if (nav.share) {
    try {
      await nav.share(shareData);
      return;
    } catch {
      // User cancelled or share failed — fall through to clipboard.
    }
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard unavailable; silently fail.
  }
}

async function shareLessonCard(entry: EtymologyEntry, fallbackText: string) {
  try {
    await shareOrDownloadCard(entry);
  } catch {
    await sharePlainText(fallbackText);
  }
}

export function AhaPhase({ lesson, completion }: Props) {
  const xp = useCountUp(completion?.xpAwarded ?? 0);
  const explore = lesson.explore;
  const ahaFact =
    explore ? AHA_FACTS[explore.canonicalId] : null;

  const shareText = explore
    ? `Did you know? "${explore.displayName}" I just learned its etymology on Traced.`
    : "I just completed today's lesson on Traced.";

  // Pre-build a lightweight EtymologyEntry for the share card. Origin / meaning
  // stay null until the lesson generator (Sprint 8+) wires real root metadata.
  const shareEntry = useMemo<EtymologyEntry | null>(() => {
    if (!explore || !explore.etymologyPreviewRoot) return null;
    return {
      id: explore.etymologyRootId ?? explore.structureId,
      root: explore.etymologyPreviewRoot,
      origin: null,
      meaning: null,
      exampleStructures: [explore.displayName],
      exampleUsage: null,
      collected: true,
      collectedAt: null,
    };
  }, [explore]);

  return (
    <div className="max-w-xl mx-auto px-6 py-10 space-y-8 text-center">
      <div className="space-y-2">
        <div
          className="text-6xl font-bold text-accent-text tabular-nums"
          style={{ fontFeatureSettings: "'tnum'" }}
        >
          +{xp}
        </div>
        <div className="text-xs uppercase tracking-wider text-text-muted">XP</div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Flame size={20} className="text-amber-400" />
        <span className="text-2xl font-bold text-amber-400">
          Day {completion?.streakDays ?? 1}
        </span>
      </div>

      {ahaFact && (
        <p
          className="max-w-md mx-auto text-lg leading-relaxed text-text-primary italic"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {ahaFact}
        </p>
      )}

      {explore && completion?.etymologyRootId && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent-border bg-accent-muted text-xs font-medium text-accent-text">
          Etymology collected
        </div>
      )}

      <button
        onClick={() => (shareEntry ? shareLessonCard(shareEntry, shareText) : sharePlainText(shareText))}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg border border-border-default bg-surface-card text-text-primary hover:bg-surface-elevated transition-colors"
      >
        <Share2 size={14} />
        Share
      </button>

      <div className="pt-4">
        <Link
          href="/today"
          className="inline-block w-full max-w-xs py-3 text-sm font-semibold rounded-lg bg-accent text-white"
        >
          Done for today
        </Link>
      </div>
    </div>
  );
}
