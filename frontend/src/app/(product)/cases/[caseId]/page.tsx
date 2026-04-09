"use client";

import { useEffect, useState, useCallback, use } from "react";
import { getCaseDetail, submitCase } from "@/features/cases/lib/caseApi";
import type { SubmissionResult } from "@/features/cases/lib/caseApi";
import { CasePlayer } from "@/features/cases/components/CasePlayer";
import { CaseResult } from "@/features/cases/components/CaseResult";
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
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  async function handleSubmit(answerMap: Record<string, string>) {
    if (!caseData) return;
    setSubmitting(true);

    const answers = Object.entries(answerMap).map(([questionId, selectedOptionKey]) => ({
      questionId,
      selectedOptionKey,
    }));

    try {
      // TODO: replace with real user profile ID from auth context
      const res = await submitCase(caseId, answers, "00000000-0000-0000-0000-000000000000");
      setResult(res);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || submitting) return <SkeletonLoader />;
  if (error) return <ErrorState onRetry={fetchData} />;
  if (result && caseData) return <CaseResult result={result} caseTitle={caseData.title} />;
  if (!caseData) return null;

  return <CasePlayer caseData={caseData} onSubmit={handleSubmit} />;
}
