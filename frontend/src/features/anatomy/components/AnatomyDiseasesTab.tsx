"use client";

import Link from "next/link";
import type { AnatomyPartDto } from "../types/anatomy.types";

type Disease = AnatomyPartDto["diseases"][number];

const COMMONNESS_COLORS: Record<Disease["commonness"], string> = {
  VERY_COMMON: "text-green-400 bg-green-400/10",
  COMMON: "text-green-300 bg-green-300/10",
  LESS_COMMON: "text-amber-400 bg-amber-400/10",
  RARE: "text-red-400 bg-red-400/10",
};

function DiseaseCard({ disease }: { disease: Disease }) {
  const etymologyLine = disease.etymology
    .map((e) => `${e.part} (${e.meaning})`)
    .join(" + ");

  return (
    <Link
      href={`/diseases/${disease.canonicalId}`}
      className="rounded-lg border border-border-subtle bg-surface-card p-3 space-y-2 cursor-pointer hover:border-accent-border hover:bg-accent-muted/20 transition-colors block"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text-primary">{disease.name}</h4>
        <span
          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${COMMONNESS_COLORS[disease.commonness]}`}
        >
          {disease.commonness.replace("_", " ")}
        </span>
      </div>

      <p className="text-xs italic text-text-muted">{etymologyLine}</p>
      <p className="text-xs text-text-secondary">{disease.plainEnglish}</p>

      {disease.mechanismNames.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {disease.mechanismNames.map((name) => (
            <span
              key={name}
              className="text-[10px] px-1.5 py-0.5 rounded bg-accent-muted text-accent-text"
            >
              {name}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

type AnatomyDiseasesTabProps = {
  diseases: AnatomyPartDto["diseases"];
};

export function AnatomyDiseasesTab({ diseases }: AnatomyDiseasesTabProps) {
  if (diseases.length === 0) {
    return <p className="text-sm text-text-muted px-4 py-3">No diseases linked.</p>;
  }

  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      {diseases.map((disease) => (
        <DiseaseCard key={disease.canonicalId} disease={disease} />
      ))}
    </div>
  );
}
