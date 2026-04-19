import { get, post } from "@/shared/lib/api/http";

export type NextRootPreview = {
  root: string;
  origin: string;
  meaning: string;
};

export type NextActionDto = {
  lessonAvailableToday: boolean;
  lessonCompleted: boolean;
  streakDays: number;
  nextRootPreview: NextRootPreview | null;
  currentSystemId: string | null;
  exploredStructureIds: string[];
  exploredCanonicalIds: string[];
  onboardingCompleted: boolean;
};

export async function getNextAction(): Promise<NextActionDto> {
  return get<NextActionDto>("/api/learning/next-action");
}

export async function markExplored(structureId: string, source = "EXPLORER"): Promise<void> {
  await post(`/api/learning/structures/${structureId}/explored`, { source });
}
