"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { post } from "@/shared/lib/api/http";
import { SkeletonLoader } from "@/shared/ui/SkeletonLoader";
import { ErrorState } from "@/shared/ui/ErrorState";
import { useSpecialityContext } from "@/features/speciality/hooks/useSpecialityContext";
import { getSpeciality } from "@/features/speciality/lib/specialityApi";
import { useEvidenceMode } from "@/shared/lib/preferences/evidenceMode";
import { useMe } from "@/shared/lib/auth/MeContext";
import type { UserBackground } from "@/shared/lib/auth/auth";

type CitedSource = {
  title: string;
  sourceType: string | null;
  jurisdiction: string | null;
  freshness: string | null;
};

// Raw clinical shape (Evidence Mode / speciality).
type GroundedExplanation = {
  explanationText: string;
  citedClaimIds: string[];
  citedChunkIds: string[];
  citedSources: CitedSource[] | null;
  confidenceLabel: string;
  contradictionNotice: string | null;
};

// Adaptive shape (Story Mode).
type AdaptiveExplanation = {
  adaptedText: string;
  ahaFact: string | null;
  citations: CitedSource[] | null;
  userBackgroundApplied: string;
};

type Display =
  | { mode: "adaptive"; adaptive: AdaptiveExplanation }
  | { mode: "grounded"; grounded: GroundedExplanation };

const CONFIDENCE_STYLES: Record<string, string> = {
  HIGH: "text-green-400 bg-green-400/10",
  MEDIUM: "text-amber-400 bg-amber-400/10",
  LOW: "text-amber-400 bg-amber-400/10",
  UNCERTAIN: "text-red-400 bg-red-400/10",
};

const DEFAULT_BACKGROUND: UserBackground = "curious_adult";

type AnatomyExplainTabProps = {
  canonicalId: string;
};

export function AnatomyExplainTab({ canonicalId }: AnatomyExplainTabProps) {
  const { activeSpecialityId } = useSpecialityContext();
  const { me } = useMe();
  const [display, setDisplay] = useState<Display | null>(null);
  const [specialityDisplayName, setSpecialityDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const evidenceMode = useEvidenceMode();

  const userBackground: UserBackground = me?.background ?? DEFAULT_BACKGROUND;

  // Adaptive (Story Mode) is used when there's no speciality overlay AND
  // Evidence Mode is off. Otherwise keep the clinical/grounded path so
  // confidence, contradictions, and raw claims are visible.
  const useAdaptive = !activeSpecialityId && !evidenceMode;

  const fetchExplanation = useCallback(() => {
    setLoading(true);
    setError(false);

    const request: Promise<Display> = useAdaptive
      ? post<AdaptiveExplanation>("/api/intelligence/explanations/adaptive", {
          structureId: canonicalId,
          userBackground,
        }).then((data) => ({ mode: "adaptive", adaptive: data }))
      : activeSpecialityId
        ? post<GroundedExplanation>("/api/explanations/speciality", {
            anatomyPartCanonicalId: canonicalId,
            specialityCanonicalId: activeSpecialityId,
          }).then((data) => ({ mode: "grounded", grounded: data }))
        : post<GroundedExplanation>("/api/explanations/anatomy", { canonicalId })
            .then((data) => ({ mode: "grounded", grounded: data }));

    request
      .then((d) => {
        setDisplay(d);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [canonicalId, activeSpecialityId, useAdaptive, userBackground]);

  useEffect(() => {
    if (!activeSpecialityId) {
      setSpecialityDisplayName(null);
      return;
    }
    getSpeciality(activeSpecialityId)
      .then((s) => setSpecialityDisplayName(s.displayName))
      .catch(() => setSpecialityDisplayName(null));
  }, [activeSpecialityId]);

  useEffect(() => {
    fetchExplanation();
  }, [fetchExplanation]);

  if (loading) return <SkeletonLoader />;
  if (error) return <ErrorState message="Couldn't load explanation" onRetry={fetchExplanation} />;
  if (!display) return null;

  const text =
    display.mode === "adaptive" ? display.adaptive.adaptedText : display.grounded.explanationText;
  const sources: CitedSource[] =
    (display.mode === "adaptive" ? display.adaptive.citations : display.grounded.citedSources) ?? [];
  const citedChunkIds = display.mode === "grounded" ? display.grounded.citedChunkIds : [];
  const citedClaimIds = display.mode === "grounded" ? display.grounded.citedClaimIds : [];
  const confidenceLabel = display.mode === "grounded" ? display.grounded.confidenceLabel : null;
  const contradictionNotice =
    display.mode === "grounded" ? display.grounded.contradictionNotice : null;
  const ahaFact = display.mode === "adaptive" ? display.adaptive.ahaFact : null;
  const isUncertain = confidenceLabel === "UNCERTAIN";
  const sourceCount = sources.length || citedChunkIds.length;

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      {specialityDisplayName && (
        <div className="rounded-lg border border-accent-border bg-accent-muted px-3 py-2">
          <p className="text-[10px] text-text-muted">Through the lens of</p>
          <p className="text-xs font-semibold text-accent-text">{specialityDisplayName}</p>
        </div>
      )}

      {evidenceMode && display.mode === "grounded" && (
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
              CONFIDENCE_STYLES[confidenceLabel ?? ""] ?? ""
            }`}
          >
            {confidenceLabel}
          </span>
          {sourceCount > 0 && (
            <span className="text-[10px] text-text-muted">
              {sourceCount} source{sourceCount !== 1 ? "s" : ""} cited
            </span>
          )}
        </div>
      )}

      {isUncertain && (
        <div className="rounded-lg border border-red-400/30 bg-red-400/5 p-3">
          <p className="text-xs text-red-400 font-medium">Insufficient Evidence</p>
          <p className="text-xs text-text-secondary mt-1">
            Not enough approved claims to generate a grounded explanation.
          </p>
        </div>
      )}

      {contradictionNotice && (
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-3">
          <p className="text-xs text-amber-400 font-medium">Conflicting Evidence</p>
          <p className="text-xs text-text-secondary mt-1">{contradictionNotice}</p>
        </div>
      )}

      <p className="text-sm leading-relaxed text-text-secondary whitespace-pre-line">{text}</p>

      {ahaFact && (
        <p
          className="text-sm italic"
          style={{ color: "#5A2B94", fontFamily: "var(--font-display)" }}
        >
          {ahaFact}
        </p>
      )}

      <p className="text-[10px] text-text-muted italic mt-1">This is not medical advice.</p>

      {sourceCount > 0 && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setSourcesOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-text-muted hover:text-text-secondary"
            aria-expanded={sourcesOpen}
          >
            {sourcesOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            Sources ({sourceCount})
          </button>
          {sourcesOpen && (
            <ul className="mt-2 flex flex-col gap-1.5">
              {sources.length > 0
                ? sources.map((s, i) => (
                    <li
                      key={`${s.title}-${i}`}
                      className="text-xs text-text-secondary border-l-2 border-border-subtle pl-2"
                    >
                      <span className="font-medium text-text-primary">{s.title}</span>
                      {s.sourceType && <span className="text-text-muted"> · {s.sourceType}</span>}
                      {s.freshness && <span className="text-text-muted"> · {s.freshness}</span>}
                    </li>
                  ))
                : citedChunkIds.map((id) => (
                    <li
                      key={id}
                      className="text-[11px] font-mono text-text-muted border-l-2 border-border-subtle pl-2"
                    >
                      {id}
                    </li>
                  ))}
            </ul>
          )}
        </div>
      )}

      {evidenceMode && citedClaimIds.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {citedClaimIds.map((id) => (
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
