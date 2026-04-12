"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import type { CaseBrowseItem } from "../types/caseBrowse.types";

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "text-green-400 bg-green-400/10 glow-green",
  MEDIUM: "text-amber-400 bg-amber-400/10 glow-amber",
  HARD: "text-red-400 bg-red-400/10 glow-red",
  easy: "text-green-400 bg-green-400/10 glow-green",
  medium: "text-amber-400 bg-amber-400/10 glow-amber",
  hard: "text-red-400 bg-red-400/10 glow-red",
};

type CaseCardProps = {
  caseItem: CaseBrowseItem;
  locked?: boolean;
};

export function CaseCard({ caseItem, locked = false }: CaseCardProps) {
  const content = (
    <div
      className={`rounded-lg border p-4 space-y-2 transition-colors ${
        locked
          ? "border-border-subtle bg-surface-card opacity-50 cursor-not-allowed"
          : "border-border-subtle bg-surface-card hover:border-accent-border cursor-pointer"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary truncate">{caseItem.title}</h3>
        <div className="flex items-center gap-1.5 shrink-0">
          {locked && <Lock size={12} className="text-text-muted" />}
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${DIFFICULTY_COLORS[caseItem.difficulty] ?? ""}`}>
            {caseItem.difficulty}
          </span>
        </div>
      </div>
      <p className="text-xs text-text-secondary line-clamp-2">{caseItem.subtitle}</p>
      <span className="text-[10px] text-accent-text">{caseItem.xpReward} XP</span>
    </div>
  );

  if (locked) return content;

  return (
    <Link href={`/cases/${caseItem.caseId}`}>
      {content}
    </Link>
  );
}
