"use client";

import type { AnatomySystem } from "../types/anatomy.types";

const SYSTEMS: { value: AnatomySystem; label: string }[] = [
  { value: "digestive", label: "Digestive" },
  { value: "skeletal", label: "Skeletal" },
  { value: "cardiovascular", label: "Cardiovascular" },
  { value: "nervous", label: "Nervous" },
  { value: "respiratory", label: "Respiratory" },
  { value: "muscular", label: "Muscular" },
  { value: "vascular", label: "Vascular" },
];

type SystemFilterPillsProps = {
  selectedSystem: AnatomySystem;
  onSystemChange: (system: AnatomySystem) => void;
};

export function SystemFilterPills({
  selectedSystem,
  onSystemChange,
}: SystemFilterPillsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-surface-panel/80 backdrop-blur-sm border border-border-subtle">
      {SYSTEMS.map(({ value, label }) => {
        const isActive = value === selectedSystem;
        return (
          <button
            key={value}
            onClick={() => onSystemChange(value)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              isActive
                ? "bg-accent text-white"
                : "text-text-muted hover:text-text-secondary hover:bg-surface-elevated"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
