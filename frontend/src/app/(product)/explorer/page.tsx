"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAnatomySelection } from "@/features/anatomy/hooks/useAnatomySelection";
import { AnatomogramCanvas } from "@/features/anatomy/components/AnatomogramCanvas";
import { AnatomyDetailDrawer } from "@/features/anatomy/components/AnatomyDetailDrawer";
import { SystemFilterPills } from "@/features/anatomy/components/SystemFilterPills";
import { SpecialityToggle } from "@/features/speciality/components/SpecialityToggle";
import { useSpecialityContext } from "@/features/speciality/hooks/useSpecialityContext";
import { getSpeciality } from "@/features/speciality/lib/specialityApi";
import {
  ExplorerOnboarding,
  markExplorerOnboardingDismissed,
} from "@/features/anatomy/components/ExplorerOnboarding";
import { ExplorerSearchBar } from "@/features/anatomy/components/ExplorerSearchBar";
import { SystemTiles } from "@/features/anatomy/components/SystemTiles";
import { listKnownStructures } from "@/features/anatomy/lib/anatomogramAdapter";
import { useMe } from "@/shared/lib/auth/MeContext";
import type { AnatomySystem } from "@/features/anatomy/types/anatomy.types";
import { getNextAction } from "@/features/learning/lib/learningApi";

const KNOWN_SYSTEMS: AnatomySystem[] = [
  "cardiovascular", "respiratory", "nervous", "digestive",
  "skeletal", "muscular", "vascular",
];

function deriveAnatomySystem(systemName: string): AnatomySystem | null {
  const lower = systemName.toLowerCase();
  const match = KNOWN_SYSTEMS.find((s) => lower.startsWith(s.slice(0, 5)));
  return match ?? null;
}

const HEART_CANONICAL_ID = "ANAT_HEART_001";
const HEART_ANATOMOGRAM_ID = "UBERON_0000948";
const INACTIVITY_MS = 3000;
const EXPLORED_CACHE_KEY = "traced_explored_structures";

export default function ExplorerPage() {
  const {
    selectedSystem,
    selectedCanonicalId,
    selectPart,
    selectSystem,
    clearSelection,
  } = useAnatomySelection();

  const { activeSpecialityId } = useSpecialityContext();
  const { me } = useMe();
  const searchParams = useSearchParams();
  const regionalMode = searchParams.get("mode") === "regional";
  const [focusCanonicalIds, setFocusCanonicalIds] = useState<Set<string>>(new Set());
  const [shouldPulseHeart, setShouldPulseHeart] = useState(false);
  const [illuminated, setIlluminated] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem(EXPLORED_CACHE_KEY);
      if (!raw) return new Set();
      return new Set(JSON.parse(raw) as string[]);
    } catch {
      return new Set();
    }
  });

  // Backend is source of truth for explored structures — refresh on mount and
  // when the drawer closes (which is when dwell writes most recently fired).
  useEffect(() => {
    getNextAction()
      .then((next) => {
        const fresh = new Set(next.exploredCanonicalIds ?? []);
        setIlluminated(fresh);
        try {
          localStorage.setItem(EXPLORED_CACHE_KEY, JSON.stringify([...fresh]));
        } catch {
          // cache unavailable
        }
      })
      .catch(() => {
        // Silent — localStorage cache already in state.
      });
  }, [selectedCanonicalId]);
  const idleTimer = useRef<number | null>(null);

  const activated = me?.learning_activated === true;
  const searchResults = useMemo(() => listKnownStructures(), []);

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

  // Ambient heart pulse: only for day-1 users, after 3s inactivity, until first selection.
  useEffect(() => {
    if (activated) {
      setShouldPulseHeart(false);
      return;
    }
    if (selectedCanonicalId) {
      setShouldPulseHeart(false);
      return;
    }
    idleTimer.current = window.setTimeout(() => setShouldPulseHeart(true), INACTIVITY_MS);
    return () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, [activated, selectedCanonicalId]);

  const handleSelect = useCallback(
    (canonicalId: string | null) => {
      selectPart(canonicalId);
      if (canonicalId) {
        setShouldPulseHeart(false);
        markExplorerOnboardingDismissed();
      }
    },
    [selectPart],
  );

  const handleFallbackHeart = useCallback(() => {
    handleSelect(HEART_CANONICAL_ID);
  }, [handleSelect]);

  const pulseAnatomogramId = shouldPulseHeart ? HEART_ANATOMOGRAM_ID : null;

  return (
    <div className="relative h-full">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-3">
        <ExplorerSearchBar results={searchResults} onSelect={handleSelect} />
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
        onPartSelect={handleSelect}
        specialityFocusCanonicalIds={focusCanonicalIds}
        pulseAnatomogramId={pulseAnatomogramId}
        illuminatedCanonicalIds={illuminated}
      />

      <ExplorerOnboarding
        active={!activated}
        onFallbackSelectHeart={handleFallbackHeart}
      />

      {!selectedCanonicalId && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[min(720px,90vw)]">
          <SystemTiles
            onSelect={(sys) => {
              const key = deriveAnatomySystem(sys.name);
              if (key) selectSystem(key);
            }}
            activeCanonicalId={null}
          />
        </div>
      )}

      {regionalMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-surface-card border border-border-default text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
          Regional view
        </div>
      )}

      {selectedCanonicalId && (
        <AnatomyDetailDrawer
          canonicalId={selectedCanonicalId}
          onClose={clearSelection}
        />
      )}
    </div>
  );
}
