"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Flame } from "lucide-react";
import {
  getWeeklyCase,
  submitCase,
  type SubmissionResult,
  type WeeklyCaseResponse,
} from "@/features/cases/lib/caseApi";
import { CasePlayer } from "@/features/cases/components/CasePlayer";
import { CaseResult } from "@/features/cases/components/CaseResult";
import { SkeletonLoader } from "@/shared/ui/SkeletonLoader";
import { ErrorState } from "@/shared/ui/ErrorState";
import { getSession } from "@/shared/lib/auth/auth";

export default function WeeklyCasePage() {
  const [state, setState] = useState<WeeklyCaseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  const fetchCase = useCallback(() => {
    setLoading(true);
    setError(false);
    getWeeklyCase()
      .then((r) => {
        setState(r);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  async function handleSubmit(answerMap: Record<string, string>) {
    if (!state?.caseDetail) return;
    setSubmitting(true);
    try {
      const session = getSession();
      const answers = Object.entries(answerMap).map(([questionId, selectedOptionKey]) => ({
        questionId,
        selectedOptionKey,
      }));
      const res = await submitCase(
        state.caseDetail.caseId,
        answers,
        session?.userId ?? "00000000-0000-0000-0000-000000000000",
      );
      setResult(res);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || submitting) return <SkeletonLoader />;
  if (error) return <ErrorState message="Couldn't load this week's case" onRetry={fetchCase} />;
  if (!state) return null;

  if (!state.available) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center space-y-4">
        <Lock size={28} className="mx-auto text-text-muted" />
        <h1 className="text-xl font-semibold text-text-primary">Keep your streak</h1>
        <p className="text-sm text-text-secondary">
          This week&apos;s mystery case unlocks at a {state.streakRequired}-day streak.
        </p>
        <div className="inline-flex items-center gap-2 text-amber-400">
          <Flame size={16} />
          <span className="text-sm font-semibold">Day {state.currentStreak}</span>
        </div>
        <div className="pt-4">
          <Link
            href="/today"
            className="inline-block px-4 py-2 text-sm font-medium rounded-lg bg-accent text-white"
          >
            Back to Today
          </Link>
        </div>
      </div>
    );
  }

  if (!state.caseDetail) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center text-sm text-text-muted italic">
        No case scheduled for this week yet.
      </div>
    );
  }

  if (result) {
    return <CaseResult result={result} caseTitle={state.caseDetail.title} />;
  }

  return <CasePlayer caseData={state.caseDetail} onSubmit={handleSubmit} />;
}
