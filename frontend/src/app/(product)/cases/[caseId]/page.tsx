"use client";

import { useEffect, useState, useCallback, use } from "react";
import { getCaseDetail } from "@/features/cases/lib/caseApi";
import { CasePlayer } from "@/features/cases/components/CasePlayer";
import { SkeletonLoader } from "@/shared/ui/SkeletonLoader";
import { ErrorState } from "@/shared/ui/ErrorState";
import type { CaseDetailDto } from "@/features/cases/types/case.types";

export default function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = use(params);
  const [caseData, setCaseData] = useState<CaseDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(false);
    getCaseDetail(caseId)
      .then((data) => {
        setCaseData(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [caseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleSubmit(answers: Record<string, string>) {
    // Submission handled in Sprint 3.18
    console.log("Submit answers:", answers);
  }

  if (loading) return <SkeletonLoader />;
  if (error) return <ErrorState onRetry={fetchData} />;
  if (!caseData) return null;

  return <CasePlayer caseData={caseData} onSubmit={handleSubmit} />;
}
