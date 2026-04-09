import type { AnatomySystem } from "../types/anatomy.types";

/**
 * Maps anatomogram ontology IDs → canonical ANAT_* IDs.
 * This is the ONLY file where anatomogram IDs appear.
 */
const ANATOMOGRAM_TO_CANONICAL: Record<string, string> = {};

/**
 * Maps each system to its supported anatomogram IDs.
 */
const SYSTEM_ANATOMOGRAM_IDS: Record<AnatomySystem, string[]> = {
  digestive: [],
  skeletal: [],
  nervous: [],
  vascular: [],
  muscular: [],
  respiratory: [],
  cardiovascular: [],
};

export function resolveCanonicalId(anatomogramId: string): string | null {
  return ANATOMOGRAM_TO_CANONICAL[anatomogramId] ?? null;
}

export function getSupportedAnatomogramIds(system: AnatomySystem): string[] {
  return SYSTEM_ANATOMOGRAM_IDS[system] ?? [];
}
