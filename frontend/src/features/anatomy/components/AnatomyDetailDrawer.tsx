"use client";

import { X } from "lucide-react";
import { getMockAnatomyPart } from "../lib/anatomyMocks";

type AnatomyDetailDrawerProps = {
  canonicalId: string;
  onClose: () => void;
};

export function AnatomyDetailDrawer({
  canonicalId,
  onClose,
}: AnatomyDetailDrawerProps) {
  const part = getMockAnatomyPart(canonicalId);

  if (!part) return null;

  return (
    <aside
      data-testid="anatomy-drawer"
      className="fixed right-0 top-0 h-full w-[340px] border-l border-border-default bg-surface-panel overflow-y-auto z-10"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-text-muted">{part.system} / {part.region}</span>
          <h2 className="text-base font-semibold text-text-primary">{part.displayName}</h2>
          <span className="text-xs font-mono text-text-ghost">{part.canonicalId}</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close drawer"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-elevated transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="px-4 py-3">
        <p className="text-sm leading-relaxed text-text-secondary">{part.overview}</p>
      </div>
    </aside>
  );
}
