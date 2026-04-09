import type { AnatomyPartDto } from "../types/anatomy.types";
import { gallbladderMock } from "../mock/gallbladder.mock";

const MOCK_PARTS: Record<string, AnatomyPartDto> = {
  [gallbladderMock.canonicalId]: gallbladderMock,
};

export function getMockAnatomyPart(
  canonicalId: string,
): AnatomyPartDto | null {
  return MOCK_PARTS[canonicalId] ?? null;
}
