import { get, patch, del } from "@/shared/lib/api/http";
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
  university?: string;
}): Promise<void> {
  await patch("/api/profile/me/preferences", prefs);
}

export async function resetProgress(): Promise<void> {
  await del("/api/profile/me/progress", { confirmationPhrase: "RESET_MY_PROGRESS" });
}
