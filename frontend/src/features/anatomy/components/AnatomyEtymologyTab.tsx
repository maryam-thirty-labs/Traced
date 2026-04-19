"use client";

import { useEffect, useRef, useState } from "react";
import { markExplored, getNextAction } from "@/features/learning/lib/learningApi";
import type { NextRootPreview } from "@/features/learning/lib/learningApi";

const DWELL_THRESHOLD_MS = 5000;
const EXPLORED_CACHE_KEY = "traced_explored_structures";

type Props = {
  canonicalId: string;
  initialNextRoot?: NextRootPreview | null;
};

function cacheExplored(canonicalId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(EXPLORED_CACHE_KEY);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    if (!list.includes(canonicalId)) {
      list.push(canonicalId);
      localStorage.setItem(EXPLORED_CACHE_KEY, JSON.stringify(list));
    }
  } catch {
    // localStorage unavailable / parse error — ignore.
  }
}

export function AnatomyEtymologyTab({ canonicalId, initialNextRoot }: Props) {
  const [nextRoot, setNextRoot] = useState<NextRootPreview | null>(initialNextRoot ?? null);
  const sentRef = useRef(false);

  // Fire-the-dwell-write after DWELL_THRESHOLD_MS on first view per structure.
  useEffect(() => {
    if (sentRef.current) return;
    const t = window.setTimeout(async () => {
      sentRef.current = true;
      try {
        await markExplored(canonicalId, "EXPLORER");
        cacheExplored(canonicalId);
        // Refresh next-action to pick up the new exploredStructureIds + root preview.
        const next = await getNextAction();
        if (next.nextRootPreview) setNextRoot(next.nextRootPreview);
      } catch {
        // Silent — illumination will sync on next mount.
      }
    }, DWELL_THRESHOLD_MS);
    return () => window.clearTimeout(t);
  }, [canonicalId]);

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      <p className="text-sm text-text-secondary italic">
        Etymology content arrives with the lesson loop (Phase 1).
      </p>

      <div className="mt-auto border-t border-border-subtle pt-3">
        <p className="text-xs uppercase tracking-wider text-text-muted">
          Tomorrow&apos;s root
        </p>
        {nextRoot ? (
          <p className="text-sm text-text-secondary mt-1">
            Tomorrow: your next root word is{" "}
            <span
              className="italic"
              style={{ color: "#5A2B94", fontFamily: "var(--font-display)" }}
            >
              {nextRoot.root}
            </span>
            , {nextRoot.origin} for &ldquo;{nextRoot.meaning}&rdquo;.
          </p>
        ) : (
          <p className="text-sm text-text-secondary mt-1">
            Tomorrow: <span className="italic">[loading…]</span>
          </p>
        )}
        <button
          type="button"
          className="mt-2 text-xs font-medium text-accent-text hover:underline"
        >
          Set a reminder →
        </button>
      </div>
    </div>
  );
}
