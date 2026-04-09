"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo } from "react";
import type { AnatomySystem } from "../types/anatomy.types";
import {
  resolveCanonicalId,
  getSupportedAnatomogramIds,
} from "../lib/anatomogramAdapter";

const Anatomogram = dynamic(() => import("anatomogram"), { ssr: false });

type AnatomogramCanvasProps = {
  selectedSystem: AnatomySystem;
  selectedCanonicalId: string | null;
  onPartSelect: (canonicalId: string | null) => void;
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

  const selectIds = useMemo(() => {
    if (!selectedCanonicalId) return [];
    const entry = supportedIds.find(
      (id) => resolveCanonicalId(id) === selectedCanonicalId,
    );
    return entry ? [entry] : [];
  }, [selectedCanonicalId, supportedIds]);

  const handleClick = useCallback(
    (ids: string[]) => {
      const clicked = ids[0];
      if (!clicked) {
        onPartSelect(null);
        return;
      }
      onPartSelect(resolveCanonicalId(clicked));
    },
    [onPartSelect],
  );

  return (
    <div className="flex items-center justify-center h-full">
      <Anatomogram
        species="homo_sapiens"
        showIds={supportedIds}
        highlightIds={[]}
        selectIds={selectIds}
        onClick={handleClick}
        showColour="grey"
        highlightColour="#7c5cfc"
        selectColour="#9070ff"
      />
    </div>
  );
}
