"use client";

import type { AnatomyPartDto } from "../types/anatomy.types";

type AnatomyMechanismsTabProps = {
  mechanisms: AnatomyPartDto["mechanisms"];
};

export function AnatomyMechanismsTab({ mechanisms }: AnatomyMechanismsTabProps) {
  if (mechanisms.length === 0) {
    return <p className="text-sm text-text-muted px-4 py-3">No mechanisms linked.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2 px-4 py-3">
      {mechanisms.map((mechanism) => (
        <span
          key={mechanism.canonicalId}
          className="text-xs px-2 py-1 rounded-lg border border-border-subtle bg-surface-card text-text-secondary"
        >
          {mechanism.name}
        </span>
      ))}
    </div>
  );
}
