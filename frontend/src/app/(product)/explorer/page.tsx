"use client";

import { useEffect, useState } from "react";
import { useAnatomySelection } from "@/features/anatomy/hooks/useAnatomySelection";
import { AnatomogramCanvas } from "@/features/anatomy/components/AnatomogramCanvas";
import { AnatomyDetailDrawer } from "@/features/anatomy/components/AnatomyDetailDrawer";
import { SystemFilterPills } from "@/features/anatomy/components/SystemFilterPills";
import { SpecialityToggle } from "@/features/speciality/components/SpecialityToggle";
import { useSpecialityContext } from "@/features/speciality/hooks/useSpecialityContext";
import { getSpeciality } from "@/features/speciality/lib/specialityApi";

export default function ExplorerPage() {
  const {
    selectedSystem,
    selectedCanonicalId,
    selectPart,
    selectSystem,
    clearSelection,
  } = useAnatomySelection();

  const { activeSpecialityId } = useSpecialityContext();
  const [focusCanonicalIds, setFocusCanonicalIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!activeSpecialityId) {
      setFocusCanonicalIds(new Set());
      return;
    }
    getSpeciality(activeSpecialityId)
      .then((detail) => {
        setFocusCanonicalIds(new Set(detail.focusAnatomy.map((f) => f.anatomyCanonicalId)));
      })
      .catch(() => setFocusCanonicalIds(new Set()));
  }, [activeSpecialityId]);

  return (
    <div className="relative h-full">
      <div className="absolute top-3 left-3 z-10">
        <SystemFilterPills
          selectedSystem={selectedSystem}
          onSystemChange={selectSystem}
        />
      </div>

      <div className="absolute top-3 right-3 z-10">
        <SpecialityToggle />
      </div>

      <AnatomogramCanvas
        selectedSystem={selectedSystem}
        selectedCanonicalId={selectedCanonicalId}
        onPartSelect={selectPart}
        specialityFocusCanonicalIds={focusCanonicalIds}
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
