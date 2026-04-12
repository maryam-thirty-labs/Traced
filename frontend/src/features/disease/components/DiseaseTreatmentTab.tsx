"use client";

import { useEffect, useState } from "react";
import { get } from "@/shared/lib/api/http";
import { SkeletonLoader } from "@/shared/ui/SkeletonLoader";
import { EmptyState } from "@/shared/ui/EmptyState";

type TreatmentWithRole = {
  canonicalId: string;
  name: string;
  treatmentClass: string;
  treatmentRole: string;
  lineOfTherapy: number | null;
};

const ROLE_LABELS: Record<string, string> = {
  CAUSE_TARGETING: "Targets the cause",
  DISEASE_MODIFYING: "Disease-modifying",
  SYMPTOMATIC: "Symptomatic relief",
  SUPPORTIVE: "Supportive",
  PREVENTIVE: "Preventive",
};

const ROLE_STYLES: Record<string, string> = {
  CAUSE_TARGETING: "text-green-400 bg-green-400/10 border-green-400/30",
  DISEASE_MODIFYING: "text-accent-text bg-accent-muted border-accent-border",
  SYMPTOMATIC: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  SUPPORTIVE: "text-text-secondary bg-surface-elevated border-border-subtle",
  PREVENTIVE: "text-green-300 bg-green-300/10 border-green-300/30",
};

export function DiseaseTreatmentTab({ diseaseCanonicalId }: { diseaseCanonicalId: string }) {
  const [treatments, setTreatments] = useState<TreatmentWithRole[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    get<TreatmentWithRole[]>(`/api/diseases/${diseaseCanonicalId}/treatments`)
      .then((data) => {
        if (!cancelled) {
          setTreatments(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTreatments([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [diseaseCanonicalId]);

  if (loading) return <SkeletonLoader />;
  if (!treatments || treatments.length === 0) {
    return <EmptyState message="No treatments recorded yet" />;
  }

  return (
    <div className="flex flex-col gap-3 max-w-2xl">
      {treatments.map((t) => {
        const roleLabel = ROLE_LABELS[t.treatmentRole] ?? t.treatmentRole;
        const roleStyle = ROLE_STYLES[t.treatmentRole] ?? ROLE_STYLES.SUPPORTIVE;
        return (
          <div
            key={`${t.canonicalId}-${t.treatmentRole}`}
            className="rounded-lg border border-border-subtle bg-surface-card p-4 space-y-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-text-primary">{t.name}</h3>
                {t.treatmentClass && (
                  <p className="text-xs text-text-muted">{t.treatmentClass}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${roleStyle}`}>
                  {roleLabel}
                </span>
                {t.lineOfTherapy != null && (
                  <span className="text-[10px] text-text-muted">Line {t.lineOfTherapy}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
