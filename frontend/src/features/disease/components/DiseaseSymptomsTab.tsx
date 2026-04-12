"use client";

import { useEffect, useState } from "react";
import { SkeletonLoader } from "@/shared/ui/SkeletonLoader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { getDiseaseSymptoms, type DiseaseSymptom } from "../lib/diseaseApi";

const SEVERITY_STYLES: Record<DiseaseSymptom["severity"], string> = {
  CARDINAL: "text-red-400 bg-red-400/10 border-red-400/30",
  COMMON: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  VARIABLE: "text-text-muted bg-surface-elevated border-border-subtle",
};

export function DiseaseSymptomsTab({ diseaseCanonicalId }: { diseaseCanonicalId: string }) {
  const [symptoms, setSymptoms] = useState<DiseaseSymptom[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDiseaseSymptoms(diseaseCanonicalId)
      .then((s) => {
        if (!cancelled) {
          setSymptoms(s);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSymptoms([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [diseaseCanonicalId]);

  if (loading) return <SkeletonLoader />;
  if (!symptoms || symptoms.length === 0) {
    return <EmptyState message="No symptoms data available yet" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
      {symptoms.map((s) => (
        <div
          key={s.symptomName}
          className="rounded-lg border border-border-subtle bg-surface-card p-4 space-y-2"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{s.emoji}</span>
              <h3 className="text-sm font-semibold text-text-primary">{s.symptomName}</h3>
            </div>
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${SEVERITY_STYLES[s.severity]}`}
            >
              {s.severity}
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">{s.description}</p>
        </div>
      ))}
    </div>
  );
}
