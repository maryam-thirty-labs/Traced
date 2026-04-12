export type LeaderboardEntry = {
  rank: number;
  displayName: string;
  xp: number;
  currentLevel: number;
  currentStreak: number;
  university: string | null;
  isMe: boolean;
};

export type MyRank = {
  me: LeaderboardEntry | null;
  surrounding: LeaderboardEntry[];
};

export type Period = "weekly" | "alltime";
export type Scope = "global" | "university" | "friends";
