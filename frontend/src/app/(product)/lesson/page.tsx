"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { completeTodayLesson, getTodayLesson } from "@/features/lesson/lib/lessonApi";
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
    return <RetrievalPhasePlaceholder lesson={lesson} onDone={handleRetrievalDone} />;
  }
  if (phase === "exploration") {
    return <ExplorationPhasePlaceholder lesson={lesson} onDone={handleExplorationDone} />;
  }
  return <AhaPhasePlaceholder completion={completion} />;
}

// Placeholder components — Sprint 11/12/13 flesh these out with real UI.

function RetrievalPhasePlaceholder({
  lesson,
  onDone,
}: {
  lesson: LessonDto;
  onDone: (answers: RetrievalAnswer[]) => void;
}) {
  return (
    <div className="max-w-md mx-auto px-6 py-8 space-y-4">
      <p className="text-xs uppercase tracking-wider text-text-muted">
        Retrieval · {lesson.retrieval.length} to review
      </p>
      <p className="text-sm text-text-secondary">
        (Sprint 11 renders the retrieval quiz here.)
      </p>
      <button
        onClick={() =>
          onDone(
            lesson.retrieval.map((r) => ({
              structureId: r.structureId,
              correct: true,
            })),
          )
        }
        className="px-4 py-2 text-sm font-medium rounded-lg bg-accent text-white"
      >
        Skip to exploration
      </button>
    </div>
  );
}

function ExplorationPhasePlaceholder({
  lesson,
  onDone,
}: {
  lesson: LessonDto;
  onDone: () => void;
}) {
  return (
    <div className="max-w-md mx-auto px-6 py-8 space-y-4">
      <p className="text-xs uppercase tracking-wider text-text-muted">Exploration</p>
      <h1 className="text-xl font-semibold text-text-primary">
        {lesson.explore?.displayName ?? "No explore structure"}
      </h1>
      <p className="text-sm text-text-secondary">
        (Sprint 12 renders etymology reveal + Story Mode explanation + diagram here.)
      </p>
      <button
        onClick={onDone}
        className="px-4 py-2 text-sm font-medium rounded-lg bg-accent text-white"
      >
        Finish lesson
      </button>
    </div>
  );
}

function AhaPhasePlaceholder({ completion }: { completion: LessonCompletionDto | null }) {
  return (
    <div className="max-w-md mx-auto px-6 py-16 text-center space-y-6">
      <h1 className="text-3xl font-bold text-accent-text">
        +{completion?.xpAwarded ?? 0} XP
      </h1>
      <p className="text-sm text-text-secondary">
        Day {completion?.streakDays ?? 1} streak.
      </p>
      <Link href="/today" className="inline-block text-sm text-accent-text hover:underline">
        Done for today
      </Link>
    </div>
  );
}
