"use client";

import type { AnatomyPartDto } from "../types/anatomy.types";

type AnatomyNamesTabProps = {
  aliases: AnatomyPartDto["aliases"];
};

export function AnatomyNamesTab({ aliases }: AnatomyNamesTabProps) {
  if (aliases.length === 0) {
    return <p className="text-sm text-text-muted px-4 py-3">No aliases found.</p>;
  }

  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      {aliases.map((alias) => (
        <div
          key={alias.canonical}
          className="rounded-lg border border-border-subtle bg-surface-card p-3 space-y-1"
        >
          <h4 className="text-sm font-semibold text-text-primary">{alias.canonical}</h4>
          <p className="text-xs text-text-secondary">
            {alias.alternatives.join(" · ")}
          </p>
        </div>
      ))}
    </div>
  );
}
