"use client";

import { useEffect, useState, useCallback } from "react";
import { listCases } from "@/features/cases/lib/caseApi";
import { CaseCard } from "@/features/cases/components/CaseCard";
import { SkeletonLoader } from "@/shared/ui/SkeletonLoader";
import { ErrorState } from "@/shared/ui/ErrorState";
import type { CaseBrowseItem } from "@/features/cases/types/caseBrowse.types";

export default function CasesPage() {
  const [cases, setCases] = useState<CaseBrowseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchCases = useCallback(() => {
    setLoading(true);
    setError(false);
    listCases()
      .then((data) => {
        setCases(data.content);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Mystery Cases</h1>
        <p className="text-sm text-text-secondary">
          Test your diagnostic reasoning with clinical mystery cases.
        </p>
      </div>

      {loading && <SkeletonLoader />}
      {error && <ErrorState message="Couldn't load cases" onRetry={fetchCases} />}

      {!loading && !error && cases.length === 0 && (
        <p className="text-sm text-text-muted">No cases available yet.</p>
      )}

      {!loading && !error && cases.length > 0 && (
        <div className="grid gap-3">
          {cases.map((c) => (
            <CaseCard key={c.caseId} caseItem={c} />
          ))}
        </div>
      )}
    </div>
  );
}
