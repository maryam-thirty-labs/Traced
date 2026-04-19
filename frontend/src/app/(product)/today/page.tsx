"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Sparkles, Lock } from "lucide-react";
import { getProfile, getProgress } from "@/features/progression/lib/progressApi";
import { getGlobalLeaderboard, getMyRank } from "@/features/leaderboard/lib/leaderboardApi";
import { SkeletonLoader } from "@/shared/ui/SkeletonLoader";
import { ErrorState } from "@/shared/ui/ErrorState";
import type { ProgressDto, UserProfileDto } from "@/features/progression/types/progress.types";
import type { LeaderboardEntry } from "@/features/leaderboard/types/leaderboard.types";

const CASE_STREAK_REQUIREMENT = 3;
const TOTAL_ROOTS_TARGET = 500;

export default function TodayPage() {
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [progress, setProgress] = useState<ProgressDto | null>(null);
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [p, pr, top, rank] = await Promise.all([
        getProfile(),
        getProgress(),
        getGlobalLeaderboard("alltime"),
        getMyRank("alltime", "global").catch(() => ({ me: null, surrounding: [] })),
      ]);
      setProfile(p);
      setProgress(pr);
      setLeaders(top.slice(0, 3));
      setMyRank(rank.me);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  if (loading) return <SkeletonLoader />;
  if (error || !profile || !progress) {
    return <ErrorState message="Couldn't load your progress" onRetry={fetchAll} />;
  }

  const xpPct =
    progress.xpToNextLevel > 0
      ? Math.round((progress.totalXp / (progress.totalXp + progress.xpToNextLevel)) * 100)
      : 100;

  const streakDays = profile.currentStreak;
  const caseUnlocked = streakDays >= CASE_STREAK_REQUIREMENT;

  // roots_collected not available until Sprint 15 (etymology garden endpoint).
  // structures_explored not available until Sprint 7 (anatomy_structure_progress).
  const rootsCollected = 0;
  const structuresExplored = 0;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      {/* Streak hero */}
      <section className="rounded-xl border border-border-subtle bg-surface-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Flame size={28} className="text-amber-400" />
            <span className="text-4xl font-bold text-amber-400 tabular-nums leading-none">
              {streakDays}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-text-muted">Streak</span>
            <span className="text-sm text-text-secondary">
              {streakDays === 0 ? "Start today" : streakDays === 1 ? "day" : "days"}
            </span>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs uppercase tracking-wider text-text-muted">
              Level {progress.currentLevel}
            </div>
            <div className="text-xs text-text-secondary">
              {progress.totalXp} XP · {progress.xpToNextLevel} to next
            </div>
          </div>
        </div>

        <div className="w-full h-2 rounded-full bg-surface-elevated overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${xpPct}%` }}
          />
        </div>

        <button
          onClick={() => showToast("Daily lesson coming soon")}
          className="w-full py-3 text-sm font-semibold rounded-lg bg-accent text-white opacity-60 cursor-not-allowed"
          disabled
          aria-disabled
        >
          Start today&apos;s lesson
        </button>
      </section>

      {/* Weekly mystery case tile */}
      <section
        className={`rounded-xl border p-5 space-y-2 ${
          caseUnlocked
            ? "border-accent-border bg-accent-muted"
            : "border-border-subtle bg-surface-card"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent-text" />
            <h3 className="text-sm font-semibold text-text-primary">This week&apos;s mystery case</h3>
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-surface-elevated text-text-secondary">
            Medium
          </span>
        </div>
        <p className="text-xs text-text-secondary">
          A clinical vignette to diagnose. Identify the affected structure from symptoms.
        </p>
        {caseUnlocked ? (
          <button
            onClick={() => showToast("Mystery cases arrive in Phase 4")}
            className="mt-2 text-xs font-medium text-accent-text"
          >
            Coming soon →
          </button>
        ) : (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
            <Lock size={12} />
            <span>
              Keep your streak. Unlocks at {CASE_STREAK_REQUIREMENT} days (you&apos;re at{" "}
              {streakDays}).
            </span>
          </div>
        )}
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border-subtle bg-surface-card p-4">
          <div className="text-xs uppercase tracking-wider text-text-muted">Roots collected</div>
          <div className="text-lg font-bold text-text-primary mt-1">
            {rootsCollected}
            <span className="text-sm font-normal text-text-muted"> / {TOTAL_ROOTS_TARGET}</span>
          </div>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface-card p-4">
          <div className="text-xs uppercase tracking-wider text-text-muted">Structures explored</div>
          <div className="text-lg font-bold text-text-primary mt-1">{structuresExplored}</div>
        </div>
      </section>

      {/* Leaderboard top 3 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Leaderboard</h3>
          <Link href="/profile" className="text-xs text-accent-text hover:underline">
            See all →
          </Link>
        </div>

        <div className="flex flex-col gap-1.5">
          {leaders.map((e) => (
            <div
              key={`${e.rank}-${e.displayName}`}
              className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-card px-3 py-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono text-text-muted w-6 text-right">{e.rank}</span>
                <span className="text-sm text-text-primary truncate">{e.displayName}</span>
              </div>
              <span className="text-sm font-mono font-semibold text-accent-text shrink-0">
                {e.xp} XP
              </span>
            </div>
          ))}
          {myRank && myRank.rank > 3 && (
            <div className="flex items-center justify-between rounded-lg border border-accent-border bg-accent-muted px-3 py-2">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono text-text-muted w-6 text-right">
                  {myRank.rank}
                </span>
                <span className="text-sm text-accent-text truncate">
                  {myRank.displayName}
                  <span className="text-[10px] ml-1.5 text-text-muted">you</span>
                </span>
              </div>
              <span className="text-sm font-mono font-semibold text-accent-text shrink-0">
                {myRank.xp} XP
              </span>
            </div>
          )}
        </div>
      </section>

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-surface-elevated border border-border-default text-sm text-text-primary shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
