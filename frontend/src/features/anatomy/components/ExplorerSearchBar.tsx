"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

const PLACEHOLDERS = ["vagus nerve", "atrial fibrillation", "fascia", "cerebellum"];

export type SearchResult = {
  canonicalId: string;
  displayName: string;
};

type Props = {
  results: SearchResult[];
  onSelect: (canonicalId: string) => void;
};

export function ExplorerSearchBar({ results, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const t = window.setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
    }, 2800);
    return () => window.clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return results
      .filter((r) => r.displayName.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, results]);

  const showDropdown = focused && query.length > 0;

  return (
    <div className="relative w-64">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-default bg-surface-card">
        <Search size={14} className="text-text-muted shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          placeholder={PLACEHOLDERS[placeholderIdx]}
          className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
        />
      </div>
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-1 rounded-lg border border-border-default bg-surface-card shadow-lg max-h-64 overflow-y-auto z-30">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-xs text-text-muted italic">No matches.</p>
          ) : (
            filtered.map((r) => (
              <button
                key={r.canonicalId}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(r.canonicalId);
                  setQuery("");
                }}
                className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-elevated transition-colors"
              >
                {r.displayName}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
