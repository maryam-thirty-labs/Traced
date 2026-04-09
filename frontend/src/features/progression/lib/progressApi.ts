import { get, patch } from "@/shared/lib/api/http";
import type { UserProfileDto, ProgressDto } from "../types/progress.types";

export async function getProfile(): Promise<UserProfileDto> {
  return get<UserProfileDto>("/api/profile/me");
}

export async function getProgress(): Promise<ProgressDto> {
  return get<ProgressDto>("/api/profile/me/progress");
}

export async function updatePreferences(prefs: {
  etymologyEnabled?: boolean;
  preferredSystem?: string;
}): Promise<void> {
  await patch("/api/profile/me/preferences", prefs);
}
