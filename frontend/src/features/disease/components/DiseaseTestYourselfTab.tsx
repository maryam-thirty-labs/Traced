"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { get } from "@/shared/lib/api/http";
import { SkeletonLoader } from "@/shared/ui/SkeletonLoader";
import { EmptyState } from "@/shared/ui/EmptyState";

type CaseSummary = {
  caseId: string;
  title: string;
  subtitle: string;
  difficulty: string;
  xpReward: number;
};

const DIFFICULTY_STYLES: Record<string, string> = {
  EASY: "text-green-400 bg-green-400/10 border-green-400/30",
  MEDIUM: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  HARD: "text-red-400 bg-red-400/10 border-red-400/30",
};

export function DiseaseTestYourselfTab({ diseaseCanonicalId }: { diseaseCanonicalId: string }) {
  const [cases, setCases] = useState<CaseSummary[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    get<CaseSummary[]>(`/api/diseases/${diseaseCanonicalId}/cases`)
      .then((data) => {
        if (!cancelled) {
          setCases(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCases([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [diseaseCanonicalId]);

  if (loading) return <SkeletonLoader />;
  if (!cases || cases.length === 0) {
    return <EmptyState message="No cases yet — check back soon" />;
  }

  return (
    <div className="flex flex-col gap-3 max-w-2xl">
      {cases.map((c) => {
        const difficultyStyle =
          DIFFICULTY_STYLES[c.difficulty.toUpperCase()] ?? DIFFICULTY_STYLES.MEDIUM;
        return (
          <Link
            key={c.caseId}
            href={`/cases/${c.caseId}`}
            className="rounded-lg border border-border-subtle bg-surface-card p-4 space-y-2 hover:border-accent-border hover:bg-accent-muted/20 transition-colors block"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-text-primary">{c.title}</h3>
                {c.subtitle && (
                  <p className="text-xs text-text-secondary mt-0.5">{c.subtitle}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded border ${difficultyStyle}`}
                >
                  {c.difficulty}
                </span>
                <span className="text-[10px] text-accent-text">+{c.xpReward} XP</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
