export type GameMode = "NAME_STRUCTURE" | "TRACE_SYSTEM" | "MYSTERY_DIAGNOSIS";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type Participant = {
  participantId: string;
  userProfileId: string;
  displayName: string;
  score: number;
  rank: number | null;
};

export type GameRoom = {
  roomCode: string;
  status: "WAITING" | "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
  gameMode: GameMode;
  difficulty: Difficulty;
  systemCanonicalId: string | null;
  hostProfileId: string;
  participants: Participant[];
};

export type GameRound = {
  roundId: string;
  roundNumber: number;
  questionPayload: string; // JSON string
  startedAt: string;
};
