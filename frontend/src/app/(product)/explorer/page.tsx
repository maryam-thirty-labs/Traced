"use client";

import { useAnatomySelection } from "@/features/anatomy/hooks/useAnatomySelection";
import { AnatomogramCanvas } from "@/features/anatomy/components/AnatomogramCanvas";
import { AnatomyDetailDrawer } from "@/features/anatomy/components/AnatomyDetailDrawer";
import { SystemFilterPills } from "@/features/anatomy/components/SystemFilterPills";

export default function ExplorerPage() {
  const {
    selectedSystem,
    selectedCanonicalId,
    selectPart,
    selectSystem,
    clearSelection,
  } = useAnatomySelection();

  return (
    <div className="relative h-full">
      <div className="absolute top-3 left-3 z-10">
        <SystemFilterPills
          selectedSystem={selectedSystem}
          onSystemChange={selectSystem}
        />
      </div>

      <AnatomogramCanvas
        selectedSystem={selectedSystem}
        selectedCanonicalId={selectedCanonicalId}
        onPartSelect={selectPart}
      />

      {selectedCanonicalId && (
        <AnatomyDetailDrawer
          canonicalId={selectedCanonicalId}
          onClose={clearSelection}
        />
      )}
    </div>
  );
}
