"use client";

import { useCallback, useEffect, useState } from "react";
import { getGlobalLeaderboard, getMyRank } from "../lib/leaderboardApi";
import type { LeaderboardEntry } from "../types/leaderboard.types";

const LEADERBOARD_PERIOD = "alltime" as const;
const TOP_LIMIT = 20;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function EntryRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${
        entry.isMe
          ? "border border-accent-border bg-accent-muted"
          : "border border-border-subtle bg-surface-card"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xs font-bold text-text-muted w-6 text-right tabular-nums">
          {entry.rank}
        </span>
        <span className="w-7 h-7 rounded-full bg-surface-elevated text-text-secondary text-[10px] font-bold flex items-center justify-center shrink-0">
          {initials(entry.displayName)}
        </span>
        <div className="flex flex-col min-w-0">
          <span
            className={`text-sm truncate ${
              entry.isMe ? "text-accent-text font-semibold" : "text-text-primary"
            }`}
          >
            {entry.displayName}
            {entry.isMe && <span className="text-[10px] ml-1.5 text-text-muted">you</span>}
          </span>
          <span className="text-[10px] text-text-muted">
            Lv {entry.currentLevel}
            {entry.currentStreak > 0 && ` · ${entry.currentStreak} day streak`}
          </span>
        </div>
      </div>
      <span className="text-sm font-bold text-accent-text shrink-0 tabular-nums">
        {entry.xp} XP
      </span>
    </div>
  );
}

// Kept for backwards compatibility with callers that still pass userUniversity.
export function LeaderboardSection(_props?: { userUniversity?: string | null }) {
  void _props;
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRankEntry, setMyRankEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getGlobalLeaderboard(LEADERBOARD_PERIOD);
      setEntries(list.slice(0, TOP_LIMIT));

      const my = await getMyRank(LEADERBOARD_PERIOD, "global");
      setMyRankEntry(my.me ?? null);
    } catch {
      setEntries([]);
      setMyRankEntry(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const inTopN = myRankEntry && myRankEntry.rank <= TOP_LIMIT;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Leaderboard</h3>
        {myRankEntry && !inTopN && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-muted text-accent-text">
            Your rank: #{myRankEntry.rank}
          </span>
        )}
      </div>

      {loading && <p className="text-xs text-text-muted px-3 py-4">Loading…</p>}

      {!loading && entries.length === 0 && (
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
