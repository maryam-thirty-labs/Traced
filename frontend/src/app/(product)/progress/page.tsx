"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getProgress, getProfile } from "@/features/progression/lib/progressApi";
import { SkeletonLoader } from "@/shared/ui/SkeletonLoader";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LeaderboardSection } from "@/features/leaderboard/components/LeaderboardSection";
import type { ProgressDto, UserProfileDto } from "@/features/progression/types/progress.types";

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressDto | null>(null);
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchProgress = useCallback(() => {
    setLoading(true);
    setError(false);
    Promise.all([getProgress(), getProfile()])
      .then(([progressData, profileData]) => {
        setProgress(progressData);
        setProfile(profileData);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  if (loading) return <SkeletonLoader />;
  if (error) return <ErrorState message="Couldn't load progress" onRetry={fetchProgress} />;
  if (!progress) return null;

  const xpPct = progress.xpToNextLevel > 0
    ? Math.round((progress.totalXp / (progress.totalXp + progress.xpToNextLevel)) * 100)
    : 100;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
      {/* Level card */}
      <div className="rounded-lg border border-border-subtle bg-surface-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Level {progress.currentLevel}</h2>
            <p className="text-xs text-text-secondary">{progress.totalXp} XP total</p>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded bg-accent-muted text-accent-text">
            {progress.xpToNextLevel} XP to next level
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${xpPct}%` }}
          />
        </div>
      </div>

      {/* Mastery bars */}
      {progress.masteryRecords.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text-primary">Mastery</h3>
          {progress.masteryRecords.map((r) => (
            <div key={r.systemCanonicalId} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-text-secondary">{r.systemCanonicalId}</span>
                <span className="text-xs text-text-muted">
                  {r.casesCorrect}/{r.casesAttempted} · {r.masteryPct}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-elevated overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-400 transition-all"
                  style={{ width: `${r.masteryPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent attempts */}
      {progress.recentAttempts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text-primary">Recent Cases</h3>
          <div className="flex flex-col gap-2">
            {progress.recentAttempts.map((a, i) => (
              <div
                key={`${a.caseId}-${i}`}
                className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-card px-4 py-3"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-text-primary">{a.caseTitle}</span>
                  <span className="text-[10px] font-mono text-text-muted">{a.score}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${a.outcome === "CORRECT" ? "text-green-400" : "text-red-400"}`}>
                    {a.outcome}
                  </span>
                  <span className="text-[10px] font-mono text-accent-text">+{a.xpAwarded} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested next */}
      {progress.suggestedNext && (
        <div className="rounded-lg border border-accent-border bg-accent-muted p-4">
          <p className="text-xs text-text-secondary mb-2">Suggested next</p>
          <Link
            href={`/cases/${progress.suggestedNext}`}
            className="text-sm font-medium text-accent-text hover:underline"
          >
            Retry {progress.suggestedNext}
          </Link>
        </div>
      )}

      {/* Leaderboard */}
      <LeaderboardSection userUniversity={profile?.university ?? null} />
    </div>
  );
}
