"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  getGlobalLeaderboard,
  getUniversityLeaderboard,
  getFriendsLeaderboard,
  getMyRank,
} from "../lib/leaderboardApi";
import type { LeaderboardEntry, Period, Scope } from "../types/leaderboard.types";

const TABS: { key: Scope; label: string }[] = [
  { key: "global", label: "Global" },
  { key: "university", label: "My university" },
  { key: "friends", label: "Friends" },
];

function EntryRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg px-3 py-2 ${
        entry.isMe
          ? "border border-accent-border bg-accent-muted"
          : "border border-border-subtle bg-surface-card"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xs font-mono text-text-muted w-6 text-right">{entry.rank}</span>
        <div className="flex flex-col min-w-0">
          <span className={`text-sm truncate ${entry.isMe ? "text-accent-text font-medium" : "text-text-primary"}`}>
            {entry.displayName}
            {entry.isMe && <span className="text-[10px] ml-1.5 text-text-muted">you</span>}
          </span>
          <span className="text-[10px] text-text-muted">
            Lv {entry.currentLevel}
            {entry.currentStreak > 0 && ` \u00b7 ${entry.currentStreak}\u{1F525}`}
            {entry.university && ` \u00b7 ${entry.university}`}
          </span>
        </div>
      </div>
      <span className="text-sm font-semibold text-accent-text shrink-0">
        {entry.xp} XP
      </span>
    </div>
  );
}

export function LeaderboardSection({ userUniversity }: { userUniversity: string | null }) {
  const [scope, setScope] = useState<Scope>("global");
  const [period, setPeriod] = useState<Period>("weekly");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRankEntry, setMyRankEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let list: LeaderboardEntry[] = [];
      if (scope === "global") list = await getGlobalLeaderboard(period);
      else if (scope === "university") list = await getUniversityLeaderboard(period);
      else if (scope === "friends") list = await getFriendsLeaderboard(period);
      setEntries(list);

      const my = await getMyRank(period, scope);
      setMyRankEntry(my.me ?? null);
    } catch {
      setEntries([]);
      setMyRankEntry(null);
    } finally {
      setLoading(false);
    }
  }, [scope, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showUniversityEmpty = scope === "university" && !userUniversity;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Leaderboard</h3>
        <button
          onClick={() => setPeriod((p) => (p === "weekly" ? "alltime" : "weekly"))}
          className="text-[10px] font-medium px-2 py-0.5 rounded bg-surface-elevated text-text-secondary hover:text-text-primary"
        >
          {period === "weekly" ? "This week" : "All time"}
        </button>
      </div>

      <div className="flex gap-1 border-b border-border-subtle">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setScope(t.key)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              scope === t.key
                ? "text-accent-text border-b-2 border-accent"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-xs text-text-muted px-3 py-4">Loading...</p>}

      {!loading && myRankEntry && (
        <EntryRow entry={{ ...myRankEntry, isMe: true }} />
      )}

      {!loading && showUniversityEmpty && (
        <div className="rounded-lg border border-border-subtle bg-surface-card px-4 py-6 text-center space-y-2">
          <p className="text-xs text-text-muted">Add your university in profile settings.</p>
          <Link href="/profile" className="text-xs text-accent-text hover:underline">
            Go to profile
          </Link>
        </div>
      )}

      {!loading && !showUniversityEmpty && entries.length === 0 && (
        <p className="text-xs text-text-muted px-3 py-4">No entries yet.</p>
      )}

      {!loading && entries.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {entries.map((e) => (
            <EntryRow key={`${e.rank}-${e.displayName}`} entry={e} />
          ))}
        </div>
      )}
    </div>
  );
}
