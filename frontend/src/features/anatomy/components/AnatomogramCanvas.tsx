"use client";

import { useCallback, useMemo } from "react";
import type { AnatomySystem } from "../types/anatomy.types";
import {
  resolveCanonicalId,
  getSupportedAnatomogramIds,
} from "../lib/anatomogramAdapter";

type AnatomogramCanvasProps = {
  selectedSystem: AnatomySystem;
  selectedCanonicalId: string | null;
  onPartSelect: (canonicalId: string | null) => void;
};

/**
 * Display labels for ontology IDs. Only used for rendering inside this component.
 * The adapter remains the single translation point for canonical IDs.
 */
const PART_LABELS: Record<string, string> = {
  UBERON_0002110: "Gallbladder",
  UBERON_0002107: "Liver",
  UBERON_0000945: "Stomach",
  UBERON_0000160: "Intestine",
  UBERON_0001264: "Pancreas",
  UBERON_0001043: "Esophagus",
  UBERON_0001155: "Colon",
  UBERON_0001052: "Rectum",
  UBERON_0000981: "Femur",
  UBERON_0002481: "Humerus",
  UBERON_0004537: "Cervical Spine",
  UBERON_0003690: "Pelvis",
  UBERON_0001474: "Patella",
  UBERON_0000948: "Heart",
  UBERON_0001621: "Coronary Artery",
  UBERON_0000947: "Aorta",
};

/** SVG positions for each part per system — approximate torso layout */
const PART_POSITIONS: Record<string, { cx: number; cy: number }> = {
  // Digestive (centered in torso)
  UBERON_0001043: { cx: 200, cy: 80 },   // Esophagus
  UBERON_0000945: { cx: 230, cy: 140 },  // Stomach
  UBERON_0002107: { cx: 160, cy: 150 },  // Liver
  UBERON_0002110: { cx: 155, cy: 185 },  // Gallbladder
  UBERON_0001264: { cx: 230, cy: 195 },  // Pancreas
  UBERON_0000160: { cx: 200, cy: 250 },  // Intestine
  UBERON_0001155: { cx: 200, cy: 310 },  // Colon
  UBERON_0001052: { cx: 200, cy: 370 },  // Rectum
  // Skeletal
  UBERON_0004537: { cx: 200, cy: 60 },   // Cervical Spine
  UBERON_0002481: { cx: 120, cy: 160 },  // Humerus
  UBERON_0003690: { cx: 200, cy: 300 },  // Pelvis
  UBERON_0000981: { cx: 170, cy: 390 },  // Femur
  UBERON_0001474: { cx: 170, cy: 460 },  // Patella
  // Cardiovascular
  UBERON_0000948: { cx: 220, cy: 130 },  // Heart
  UBERON_0001621: { cx: 195, cy: 155 },  // Coronary Artery
  UBERON_0000947: { cx: 200, cy: 210 },  // Aorta
};

export function AnatomogramCanvas({
  selectedSystem,
  selectedCanonicalId,
  onPartSelect,
}: AnatomogramCanvasProps) {
  const supportedIds = useMemo(
    () => getSupportedAnatomogramIds(selectedSystem),
    [selectedSystem],
  );

  const handlePartClick = useCallback(
    (anatomogramId: string) => {
      const canonicalId = resolveCanonicalId(anatomogramId);
      onPartSelect(canonicalId);
    },
    [onPartSelect],
  );

  return (
    <div className="flex items-center justify-center h-full">
      <svg
        viewBox="0 0 400 520"
        className="h-[85vh] max-w-full"
        role="img"
        aria-label="Anatomy body map"
      >
        {/* Body silhouette */}
        <ellipse cx="200" cy="35" rx="35" ry="40" fill="#1a1a28" />
        <rect x="165" y="55" width="70" height="15" rx="5" fill="#1a1a28" />
        <path
          d="M170 70 Q140 80 110 160 L125 165 Q150 100 175 85 L175 300 Q175 340 160 400 L155 500 L185 500 L195 350 L205 350 L215 500 L245 500 L240 400 Q225 340 225 300 L225 85 Q250 100 275 165 L290 160 Q260 80 230 70 Z"
          fill="#1a1a28"
        />

        {/* Clickable organ spots */}
        {supportedIds.map((id) => {
          const pos = PART_POSITIONS[id];
          if (!pos) return null;
          const canonicalId = resolveCanonicalId(id);
          const isSelected = canonicalId === selectedCanonicalId;
          const label = PART_LABELS[id] ?? id;

          return (
            <g
              key={id}
              onClick={() => handlePartClick(id)}
              className="cursor-pointer"
              role="button"
              aria-label={label}
            >
              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={isSelected ? 18 : 14}
                fill={isSelected ? "#7c5cfc" : "#7c5cfc33"}
                stroke={isSelected ? "#9070ff" : "#7c5cfc66"}
                strokeWidth={isSelected ? 2.5 : 1.5}
                className="transition-all duration-200"
              />
              <text
                x={pos.cx}
                y={pos.cy + 28}
                textAnchor="middle"
                fill={isSelected ? "#e8e4ff" : "#8080a8"}
                fontSize="10"
                className="pointer-events-none select-none"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
