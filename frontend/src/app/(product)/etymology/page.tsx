"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Lock, Search } from "lucide-react";
import { getGarden } from "@/features/etymology/lib/etymologyApi";
import { SkeletonLoader } from "@/shared/ui/SkeletonLoader";
import { ErrorState } from "@/shared/ui/ErrorState";
import type {
  EtymologyEntry,
  EtymologyGardenDto,
  Origin,
} from "@/features/etymology/types/etymology.types";

const FILTERS: Array<{ key: Origin; label: string }> = [
  { key: "all", label: "All" },
  { key: "Greek", label: "Greek" },
  { key: "Latin", label: "Latin" },
  { key: "Arabic", label: "Arabic" },
  { key: "Eponym", label: "Eponyms" },
];

export default function EtymologyGardenPage() {
  const [data, setData] = useState<EtymologyGardenDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<Origin>("all");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<EtymologyEntry | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(false);
    getGarden()
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.roots.filter((r) => {
      if (filter !== "all" && r.origin !== filter) return false;
      if (!q) return true;
      return (
        r.root.toLowerCase().includes(q) ||
        (r.meaning?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [data, filter, query]);

  if (loading) return <SkeletonLoader />;
  if (error || !data) return <ErrorState message="Couldn't load your garden" onRetry={fetchData} />;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <header className="space-y-2">
        <h1
          className="text-2xl font-semibold text-text-primary"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Etymology Garden
        </h1>
        <p className="text-sm text-text-secondary">
          <span className="font-semibold text-accent-text">{data.collected}</span>{" "}
          <span>/ {data.totalRoots} roots collected</span>
        </p>
      </header>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === f.key
                  ? "bg-accent-muted text-accent-text"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-default bg-surface-card w-64 max-w-full">
          <Search size={14} className="text-text-muted shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by root or meaning"
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>
      </div>

      {data.roots.length === 0 && (
        <p className="text-sm text-text-muted italic">
          No roots yet. Complete a lesson to collect your first one.
        </p>
      )}

      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {filtered.map((r) => (
          <button
            key={r.id}
            onClick={() => setActive(r)}
            className={`text-left p-3 rounded-xl border transition-transform ${
              r.collected
                ? "border-accent-border bg-accent-muted hover:-translate-y-0.5"
                : "border-border-subtle bg-surface-card opacity-70"
            }`}
          >
            {r.collected ? (
              <>
                <div
                  className="text-lg italic text-accent-text"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {r.root}
                </div>
                {r.origin && (
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-1">
                    {r.origin}
                  </div>
                )}
                {r.meaning && (
                  <div className="text-xs text-text-secondary mt-1 line-clamp-2">
                    {r.meaning}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-20 text-text-muted">
                <Lock size={14} />
                <span className="text-[10px] mt-1 font-mono">
                  {r.root.replace(/./g, "•")}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {active && <RootDetailDrawer entry={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function RootDetailDrawer({ entry, onClose }: { entry: EtymologyEntry; onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-md w-full rounded-xl border border-border-default bg-surface-card p-6 space-y-3"
      >
        {entry.collected ? (
          <>
            <div
              className="text-4xl italic text-accent-text"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {entry.root}
            </div>
            {entry.origin && (
              <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                {entry.origin}
              </div>
            )}
            {entry.meaning && (
              <p className="text-sm text-text-primary">{entry.meaning}</p>
            )}
            {entry.exampleUsage && (
              <p className="text-xs text-text-secondary italic">{entry.exampleUsage}</p>
            )}
            {entry.exampleStructures && entry.exampleStructures.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {entry.exampleStructures.map((s) => (
                  <span
                    key={s}
                    className="text-[10px] px-2 py-0.5 rounded bg-surface-elevated text-text-secondary"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-text-secondary">
            Complete a lesson featuring this structure to unlock.
          </p>
        )}
        <button
          onClick={onClose}
          className="w-full py-2 text-sm font-medium rounded-lg border border-border-default text-text-secondary hover:text-text-primary"
        >
          Close
        </button>
      </div>
    </div>
  );
}
