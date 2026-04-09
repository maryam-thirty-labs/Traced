import type { AnatomyPartDto } from "../types/anatomy.types";
import { getMockAnatomyPart } from "./anatomyMocks";

// TODO: replace with real API calls in Phase 2

export async function getAnatomyPart(
  canonicalId: string,
): Promise<AnatomyPartDto | null> {
  return getMockAnatomyPart(canonicalId);
}

export async function getAnatomyDiseases(
  canonicalId: string,
): Promise<AnatomyPartDto["diseases"]> {
  const part = getMockAnatomyPart(canonicalId);
  return part?.diseases ?? [];
}
