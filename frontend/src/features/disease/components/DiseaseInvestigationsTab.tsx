"use client";

import { useEffect, useState } from "react";
import { get } from "@/shared/lib/api/http";
import { SkeletonLoader } from "@/shared/ui/SkeletonLoader";
import { EmptyState } from "@/shared/ui/EmptyState";

type Investigation = {
  investigationName: string;
  rationale: string;
  displayOrder: number;
};

export function DiseaseInvestigationsTab({ diseaseCanonicalId }: { diseaseCanonicalId: string }) {
  const [items, setItems] = useState<Investigation[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    get<Investigation[]>(`/api/diseases/${diseaseCanonicalId}/investigations`)
      .then((data) => {
        if (!cancelled) {
          setItems(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [diseaseCanonicalId]);

  if (loading) return <SkeletonLoader />;
  if (!items || items.length === 0) {
    return <EmptyState message="No investigations recorded yet" />;
  }

  return (
    <ol className="flex flex-col gap-3 max-w-2xl">
      {items.map((item, idx) => (
        <li
          key={`${item.displayOrder}-${item.investigationName}`}
          className="rounded-lg border border-border-subtle bg-surface-card p-4 flex gap-3"
        >
          <div className="h-7 w-7 shrink-0 rounded-full bg-accent-muted text-accent-text flex items-center justify-center text-xs font-semibold">
            {idx + 1}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-text-primary">{item.investigationName}</h3>
            <p className="text-xs text-text-secondary leading-relaxed mt-1">{item.rationale}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
