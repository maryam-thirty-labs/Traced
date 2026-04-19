"use client";

import { useEffect, useState } from "react";
import { get } from "@/shared/lib/api/http";

export type SystemSummary = {
  id: string;
  canonicalId: string;
  name: string;
  displayOrder: number;
  structureCount: number;
  exploredCount: number;
};

// System colours per CLAUDE.md design system.
const SYSTEM_COLOR: Record<string, string> = {
  Cardiovascular: "#A82828",
  Nervous: "#8F5F0F",
  Respiratory: "#1A5C96",
  Digestive: "#5E6E1F",
  Musculoskeletal: "#3B4F8C",
  Skeletal: "#3B4F8C",
  Muscular: "#3B4F8C",
  Endocrine: "#1A6B6B",
  Immune: "#2D6A3F",
  Reproductive: "#8C3060",
  Vascular: "#A82828",
};

type Props = {
  onSelect: (sys: SystemSummary) => void;
  activeCanonicalId: string | null;
};

export function SystemTiles({ onSelect, activeCanonicalId }: Props) {
  const [systems, setSystems] = useState<SystemSummary[] | null>(null);

  useEffect(() => {
    get<SystemSummary[]>("/api/anatomy/systems")
      .then(setSystems)
      .catch(() => setSystems([]));
  }, []);

  if (!systems || systems.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {systems.map((sys) => {
        const color = SYSTEM_COLOR[sys.name] ?? "#5A2B94";
        const isActive = activeCanonicalId === sys.canonicalId;
        return (
          <button
            key={sys.id}
            onClick={() => onSelect(sys)}
            className={`text-left p-3 rounded-lg border transition-colors ${
              isActive
                ? "border-accent-border bg-accent-muted"
                : "border-border-subtle bg-surface-card hover:bg-surface-elevated"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm font-semibold text-text-primary">
                {sys.name}
              </span>
            </div>
            <div className="mt-1 text-[10px] text-text-muted">
              {sys.exploredCount} / {sys.structureCount} explored
            </div>
          </button>
        );
      })}
    </div>
  );
}
