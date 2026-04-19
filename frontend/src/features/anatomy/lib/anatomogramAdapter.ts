import type { AnatomySystem } from "../types/anatomy.types";

/**
 * Maps anatomogram ontology IDs → canonical ANAT_* IDs.
 * This is the ONLY file where anatomogram IDs appear.
 */
const ANATOMOGRAM_TO_CANONICAL: Record<string, string> = {
  // Digestive
  "UBERON_0002110": "ANAT_GALLBLADDER_001",
  "UBERON_0002107": "ANAT_LIVER_001",
  "UBERON_0000945": "ANAT_STOMACH_001",
  "UBERON_0000160": "ANAT_INTESTINE_001",
  "UBERON_0001264": "ANAT_PANCREAS_001",
  "UBERON_0001043": "ANAT_ESOPHAGUS_001",
  "UBERON_0001155": "ANAT_COLON_001",
  "UBERON_0001052": "ANAT_RECTUM_001",

  // Skeletal
  "UBERON_0000981": "ANAT_FEMUR_001",
  "UBERON_0002481": "ANAT_HUMERUS_001",
  "UBERON_0004537": "ANAT_CERVICAL_SPINE_001",
  "UBERON_0003690": "ANAT_PELVIS_001",
  "UBERON_0001474": "ANAT_PATELLA_001",

  // Cardiovascular
  "UBERON_0000948": "ANAT_HEART_001",
  "UBERON_0001621": "ANAT_CORONARY_ARTERY_001",
  "UBERON_0000947": "ANAT_AORTA_001",
};

/**
 * Maps each system to its supported anatomogram IDs.
 */
const SYSTEM_ANATOMOGRAM_IDS: Record<AnatomySystem, string[]> = {
  digestive: [
    "UBERON_0002110", "UBERON_0002107", "UBERON_0000945",
    "UBERON_0000160", "UBERON_0001264", "UBERON_0001043",
    "UBERON_0001155", "UBERON_0001052",
  ],
  skeletal: [
    "UBERON_0000981", "UBERON_0002481", "UBERON_0004537",
    "UBERON_0003690", "UBERON_0001474",
  ],
  nervous: [],
  vascular: [],
  muscular: [],
  respiratory: [],
  cardiovascular: [
    "UBERON_0000948", "UBERON_0001621", "UBERON_0000947",
  ],
};

export function resolveCanonicalId(anatomogramId: string): string | null {
  return ANATOMOGRAM_TO_CANONICAL[anatomogramId] ?? null;
}

export function getSupportedAnatomogramIds(system: AnatomySystem): string[] {
  return SYSTEM_ANATOMOGRAM_IDS[system] ?? [];
}

export function resolveAnatomogramId(canonicalId: string): string | null {
  for (const [anatomogramId, canonical] of Object.entries(ANATOMOGRAM_TO_CANONICAL)) {
    if (canonical === canonicalId) return anatomogramId;
  }
  return null;
}

/** Derives a human display name from a canonical ID like "ANAT_HEART_001" -> "Heart". */
export function canonicalDisplayName(canonicalId: string): string {
  const parts = canonicalId.split("_");
  const middle = parts.slice(1, -1).join(" ").toLowerCase();
  return middle.charAt(0).toUpperCase() + middle.slice(1);
}

/** All {canonicalId, displayName} known to the adapter. Used for client-side search fallback. */
export function listKnownStructures(): Array<{ canonicalId: string; displayName: string }> {
  return Object.values(ANATOMOGRAM_TO_CANONICAL).map((canonicalId) => ({
    canonicalId,
    displayName: canonicalDisplayName(canonicalId),
  }));
}
