"use client";

import { useState, useCallback } from "react";
import type {
  AnatomySystem,
  AnatomySelectionState,
} from "../types/anatomy.types";

const INITIAL_STATE: AnatomySelectionState = {
  selectedSystem: "digestive",
  selectedView: "front",
  selectedCanonicalId: null,
};

export function useAnatomySelection(initial?: Partial<AnatomySelectionState>) {
  const [state, setState] = useState<AnatomySelectionState>({
    ...INITIAL_STATE,
    ...initial,
  });

  const selectPart = useCallback((canonicalId: string | null) => {
    setState((prev) => ({ ...prev, selectedCanonicalId: canonicalId }));
  }, []);

  const selectSystem = useCallback((system: AnatomySystem) => {
    setState((prev) => ({
      ...prev,
      selectedSystem: system,
      selectedCanonicalId: null,
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedCanonicalId: null }));
  }, []);

  return { ...state, selectPart, selectSystem, clearSelection };
}
