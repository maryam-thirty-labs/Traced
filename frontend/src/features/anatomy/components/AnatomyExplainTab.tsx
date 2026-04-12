"use client";

import { useEffect, useState, useCallback } from "react";
import { post } from "@/shared/lib/api/http";
import { SkeletonLoader } from "@/shared/ui/SkeletonLoader";
import { ErrorState } from "@/shared/ui/ErrorState";
import { useSpecialityContext } from "@/features/speciality/hooks/useSpecialityContext";
import { getSpeciality } from "@/features/speciality/lib/specialityApi";

type GroundedExplanation = {
  explanationText: string;
  citedClaimIds: string[];
  citedChunkIds: string[];
  confidenceLabel: string;
  contradictionNotice: string | null;
};

const CONFIDENCE_STYLES: Record<string, string> = {
  HIGH: "text-green-400 bg-green-400/10",
  MEDIUM: "text-amber-400 bg-amber-400/10",
  LOW: "text-amber-400 bg-amber-400/10",
  UNCERTAIN: "text-red-400 bg-red-400/10",
};

type AnatomyExplainTabProps = {
  canonicalId: string;
};

export function AnatomyExplainTab({ canonicalId }: AnatomyExplainTabProps) {
  const { activeSpecialityId } = useSpecialityContext();
  const [explanation, setExplanation] = useState<GroundedExplanation | null>(null);
  const [specialityDisplayName, setSpecialityDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchExplanation = useCallback(() => {
    setLoading(true);
    setError(false);

    const request = activeSpecialityId
      ? post<GroundedExplanation>("/api/explanations/speciality", {
          anatomyPartCanonicalId: canonicalId,
          specialityCanonicalId: activeSpecialityId,
        })
      : post<GroundedExplanation>("/api/explanations/anatomy", { canonicalId });

    request
      .then((data) => {
        setExplanation(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [canonicalId, activeSpecialityId]);

  // Fetch speciality display name when active
  useEffect(() => {
    if (!activeSpecialityId) {
      setSpecialityDisplayName(null);
      return;
    }
    getSpeciality(activeSpecialityId)
      .then((s) => setSpecialityDisplayName(s.displayName))
      .catch(() => setSpecialityDisplayName(null));
  }, [activeSpecialityId]);

  // Refetch on canonicalId or speciality change
  useEffect(() => {
    fetchExplanation();
  }, [fetchExplanation]);

  if (loading) return <SkeletonLoader />;
  if (error) return <ErrorState message="Couldn't load explanation" onRetry={fetchExplanation} />;
  if (!explanation) return null;

  const isUncertain = explanation.confidenceLabel === "UNCERTAIN";

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      {/* Speciality badge */}
      {specialityDisplayName && (
        <div className="rounded-lg border border-accent-border bg-accent-muted px-3 py-2">
          <p className="text-[10px] text-text-muted">Through the lens of</p>
          <p className="text-xs font-semibold text-accent-text">{specialityDisplayName}</p>
        </div>
      )}

      {/* Confidence badge */}
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${CONFIDENCE_STYLES[explanation.confidenceLabel] ?? ""}`}>
          {explanation.confidenceLabel}
        </span>
        {explanation.citedClaimIds.length > 0 && (
          <span className="text-[10px] text-text-muted">
            {explanation.citedClaimIds.length} source{explanation.citedClaimIds.length !== 1 ? "s" : ""} cited
          </span>
        )}
      </div>

      {isUncertain && (
        <div className="rounded-lg border border-red-400/30 bg-red-400/5 p-3">
          <p className="text-xs text-red-400 font-medium">Insufficient Evidence</p>
          <p className="text-xs text-text-secondary mt-1">
            Not enough approved claims to generate a grounded explanation.
          </p>
        </div>
      )}

      {explanation.contradictionNotice && (
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-3">
          <p className="text-xs text-amber-400 font-medium">Conflicting Evidence</p>
          <p className="text-xs text-text-secondary mt-1">{explanation.contradictionNotice}</p>
        </div>
      )}

      <p className="text-sm leading-relaxed text-text-secondary whitespace-pre-line">
        {explanation.explanationText}
      </p>

      {explanation.citedClaimIds.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {explanation.citedClaimIds.map((id) => (
            <span
              key={id}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted"
            >
              {id.slice(0, 8)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
