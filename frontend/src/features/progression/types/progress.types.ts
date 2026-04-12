export type UserProfileDto = {
  displayName: string;
  totalXp: number;
  currentLevel: number;
  levelTitle: string;
  currentStreak: number;
  unlockedSystems: string[];
  etymologyEnabled: boolean;
  university: string | null;
};

export type ProgressDto = {
  totalXp: number;
  currentLevel: number;
  xpToNextLevel: number;
  masteryRecords: Array<{
    systemCanonicalId: string;
    masteryPct: number;
    casesAttempted: number;
    casesCorrect: number;
  }>;
  recentAttempts: Array<{
    caseId: string;
    caseTitle: string;
    outcome: string;
    score: number;
    xpAwarded: number;
    completedAt: string;
  }>;
  suggestedNext: string | null;
};
