"use client";

import { useEffect, useState } from "react";

type Props = {
  root: string | null;
  origin: string | null;
  meaning: string | null;
  exampleUsage?: string | null;
};

type Stage = "idle" | "holding" | "origin" | "root" | "meaning" | "examples";

const TIMELINE: Array<{ at: number; stage: Stage }> = [
  { at: 0, stage: "idle" },
  { at: 0, stage: "holding" }, // 250ms anticipation hold — non-negotiable.
  { at: 250, stage: "origin" },
  { at: 500, stage: "root" },
  { at: 900, stage: "meaning" },
  { at: 1200, stage: "examples" },
];

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function EtymologyReveal({ root, origin, meaning, exampleUsage }: Props) {
  const reduceMotion = prefersReducedMotion();
  const [stage, setStage] = useState<Stage>(reduceMotion ? "examples" : "idle");

  useEffect(() => {
    if (reduceMotion) {
      setStage("examples");
      return;
    }
    const timers = TIMELINE.map(({ at, stage: s }) =>
      window.setTimeout(() => setStage(s), at),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reduceMotion]);

  const show = (min: Stage) => {
    const order: Stage[] = ["idle", "holding", "origin", "root", "meaning", "examples"];
    return order.indexOf(stage) >= order.indexOf(min);
  };

  if (!root) {
    return (
      <div className="rounded-xl border border-accent-border bg-surface-card p-6 text-sm text-text-muted italic">
        Etymology pending for this structure.
      </div>
    );
  }

  return (
    <div
      className="rounded-xl bg-white p-8 border shadow-sm"
      style={{ borderColor: "rgba(90,43,148,0.2)", borderRadius: 12 }}
    >
      <div
        className="text-[11px] font-semibold uppercase tracking-[0.08em] transition-opacity duration-300"
        style={{ color: "#9B95B8", opacity: show("origin") ? 1 : 0 }}
      >
        {origin ?? ""}
      </div>
      <div
        className="mt-2 italic transition-opacity duration-500"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 56,
          lineHeight: 1.1,
          color: "#5A2B94",
          opacity: show("root") ? 1 : 0,
          transform: show("root") ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 400ms ease, transform 400ms ease",
        }}
      >
        {root}
      </div>
      <p
        className="mt-4 transition-opacity duration-300"
        style={{
          fontSize: 16,
          color: "#16112E",
          opacity: show("meaning") ? 1 : 0,
        }}
      >
        {meaning ?? ""}
      </p>
      {exampleUsage && (
        <p
          className="mt-3 italic transition-opacity duration-300"
          style={{ fontSize: 13, color: "#5C5472", opacity: show("examples") ? 1 : 0 }}
        >
          {exampleUsage}
        </p>
      )}
    </div>
  );
}
