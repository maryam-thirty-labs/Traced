"use client";

import Link from "next/link";
import type { AnatomyPartDto } from "../types/anatomy.types";

type CaseItem = AnatomyPartDto["cases"][number];

const DIFFICULTY_COLORS: Record<CaseItem["difficulty"], string> = {
  easy: "text-green-400 bg-green-400/10",
  medium: "text-amber-400 bg-amber-400/10",
  hard: "text-red-400 bg-red-400/10",
};

function CaseRow({ caseItem, index }: { caseItem: CaseItem; index: number }) {
  return (
    <Link
      href={`/cases/${caseItem.caseId}`}
      className="flex items-start gap-3 rounded-lg border border-border-subtle bg-surface-card p-3 hover:border-accent-border transition-colors"
    >
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent-muted text-accent-text text-xs font-bold shrink-0">
        {index + 1}
      </span>
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-text-primary truncate">{caseItem.title}</h4>
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${DIFFICULTY_COLORS[caseItem.difficulty]}`}
          >
            {caseItem.difficulty}
          </span>
        </div>
        <p className="text-xs text-text-secondary line-clamp-2">{caseItem.subtitle}</p>
        <span className="text-[10px] text-accent-text">{caseItem.xpReward} XP</span>
      </div>
    </Link>
  );
}

type AnatomyCasesTabProps = {
  cases: AnatomyPartDto["cases"];
};

export function AnatomyCasesTab({ cases }: AnatomyCasesTabProps) {
  if (cases.length === 0) {
    return <p className="text-sm text-text-muted px-4 py-3">No cases available.</p>;
  }

  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      {cases.map((caseItem, i) => (
        <CaseRow key={caseItem.caseId} caseItem={caseItem} index={i} />
      ))}
    </div>
  );
}
