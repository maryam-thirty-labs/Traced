"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { completeTodayLesson, getTodayLesson } from "@/features/lesson/lib/lessonApi";
import { RetrievalPhase } from "@/features/lesson/components/RetrievalPhase";
import { ExplorationPhase } from "@/features/lesson/components/ExplorationPhase";
import { AhaPhase } from "@/features/lesson/components/AhaPhase";
import { SkeletonLoader } from "@/shared/ui/SkeletonLoader";
import { ErrorState } from "@/shared/ui/ErrorState";
import type {
  LessonCompletionDto,
  LessonDto,
  RetrievalAnswer,
} from "@/features/lesson/types/lesson.types";
import { useMe } from "@/shared/lib/auth/MeContext";

type Phase = "retrieval" | "exploration" | "aha";

export default function LessonPage() {
  const [lesson, setLesson] = useState<LessonDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [phase, setPhase] = useState<Phase>("retrieval");
  const [answers, setAnswers] = useState<RetrievalAnswer[]>([]);
  const [completion, setCompletion] = useState<LessonCompletionDto | null>(null);
  const { refresh } = useMe();

  const fetchLesson = useCallback(() => {
    setLoading(true);
    setError(false);
    getTodayLesson()
      .then((data) => {
        setLesson(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  const handleRetrievalDone = useCallback((collected: RetrievalAnswer[]) => {
    setAnswers(collected);
    setPhase("exploration");
  }, []);

  const handleExplorationDone = useCallback(async () => {
    try {
      const result = await completeTodayLesson(answers);
      setCompletion(result);
      setPhase("aha");
      // Refresh me so progressive-home flags and streak update.
      refresh();
    } catch {
      setError(true);
    }
  }, [answers, refresh]);

  if (loading) return <SkeletonLoader />;
  if (error) return <ErrorState message="Couldn't load your lesson" onRetry={fetchLesson} />;
  if (!lesson) return null;

  if (lesson.completed) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center space-y-6">
        <div className="flex justify-center">
          <Flame size={48} className="text-amber-400" />
        </div>
        <h1 className="text-2xl font-semibold text-text-primary">
          You&apos;ve done today&apos;s lesson
        </h1>
        <p className="text-sm text-text-secondary">
          Come back tomorrow to keep your streak going.
        </p>
        <Link
          href="/today"
          className="inline-block text-sm text-accent-text hover:underline"
        >
          Back to Today
        </Link>
      </div>
    );
  }

  if (phase === "retrieval") {
    return <RetrievalPhase lesson={lesson} onDone={handleRetrievalDone} />;
  }
  if (phase === "exploration") {
    return <ExplorationPhase lesson={lesson} onDone={handleExplorationDone} />;
  }
  return <AhaPhase lesson={lesson} completion={completion} />;
}
