import { get, post, del } from "@/shared/lib/api/http";
import type { LeaderboardEntry, MyRank, Period, Scope } from "../types/leaderboard.types";

export async function getGlobalLeaderboard(period: Period = "weekly"): Promise<LeaderboardEntry[]> {
  return get<LeaderboardEntry[]>(`/api/leaderboard/global?period=${period}&size=20`);
}

export async function getUniversityLeaderboard(period: Period = "weekly"): Promise<LeaderboardEntry[]> {
  return get<LeaderboardEntry[]>(`/api/leaderboard/university?period=${period}&size=20`);
}

export async function getFriendsLeaderboard(period: Period = "weekly"): Promise<LeaderboardEntry[]> {
  return get<LeaderboardEntry[]>(`/api/leaderboard/friends?period=${period}`);
}

export async function getMyRank(period: Period = "weekly", scope: Scope = "global"): Promise<MyRank> {
  return get<MyRank>(`/api/leaderboard/me?period=${period}&scope=${scope}`);
}

export type FriendRow = { friendProfileId: string; displayName: string };

export async function listFriends(): Promise<FriendRow[]> {
  return get<FriendRow[]>("/api/profile/me/friends");
}

export async function addFriend(displayName: string): Promise<{ friendProfileId: string }> {
  return post<{ friendProfileId: string }>("/api/profile/me/friends", { displayName });
}

export async function removeFriend(friendProfileId: string): Promise<void> {
  await del(`/api/profile/me/friends/${friendProfileId}`);
}
