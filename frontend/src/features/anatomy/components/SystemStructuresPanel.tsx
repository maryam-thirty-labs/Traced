"use client";

import { useEffect, useMemo, useState } from "react";
import { Circle, Sparkles } from "lucide-react";
import { get } from "@/shared/lib/api/http";

type StructureRow = {
  canonicalId: string;
  displayName: string;
  region: string;
};

type Props = {
  systemCanonicalId: string;
  exploredCanonicalIds: Set<string>;
  onSelect: (canonicalId: string) => void;
};

export function SystemStructuresPanel({
  systemCanonicalId,
  exploredCanonicalIds,
  onSelect,
}: Props) {
  const [structures, setStructures] = useState<StructureRow[] | null>(null);

  useEffect(() => {
    // No dedicated systems/{id}/structures endpoint yet; fall through to AnatomogramCanvas.
    // When Sprint 33/34 content lands, a proper endpoint will feed this.
    get<StructureRow[]>(`/api/anatomy/systems/${encodeURIComponent(systemCanonicalId)}/structures`)
      .then(setStructures)
      .catch(() => setStructures([]));
  }, [systemCanonicalId]);

  const sorted = useMemo(() => {
    if (!structures) return [];
    return [...structures].sort((a, b) => {
      const aExp = exploredCanonicalIds.has(a.canonicalId);
      const bExp = exploredCanonicalIds.has(b.canonicalId);
      if (aExp === bExp) return a.displayName.localeCompare(b.displayName);
      return aExp ? 1 : -1;
    });
  }, [structures, exploredCanonicalIds]);

  if (!structures || structures.length === 0) return null;

  return (
    <div className="w-[240px] rounded-xl border border-border-default bg-surface-card p-2 max-h-[60vh] overflow-y-auto">
      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        Structures
      </div>
      <ul className="flex flex-col">
        {sorted.map((s) => {
          const explored = exploredCanonicalIds.has(s.canonicalId);
          return (
            <li key={s.canonicalId}>
              <button
                onClick={() => onSelect(s.canonicalId)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-sm text-text-primary hover:bg-surface-elevated rounded transition-colors"
              >
                {explored ? (
                  <Sparkles size={12} className="text-accent-text shrink-0" />
                ) : (
                  <Circle size={12} className="text-text-muted shrink-0" />
                )}
                <span className="truncate">{s.displayName}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
