import { get } from "@/shared/lib/api/http";
import type { UserProfileDto, ProgressDto } from "../types/progress.types";

export async function getProfile(): Promise<UserProfileDto> {
  return get<UserProfileDto>("/api/profile/me");
}

export async function getProgress(): Promise<ProgressDto> {
  return get<ProgressDto>("/api/profile/me/progress");
}
