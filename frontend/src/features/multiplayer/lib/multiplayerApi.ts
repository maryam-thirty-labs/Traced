import { get, post } from "@/shared/lib/api/http";
import type { GameRoom, GameMode, Difficulty } from "../types/game.types";

export async function createRoom(gameMode: GameMode, difficulty: Difficulty, systemCanonicalId?: string): Promise<GameRoom> {
  return post<GameRoom>("/api/multiplayer/rooms", { gameMode, difficulty, systemCanonicalId });
}

export async function joinRoom(roomCode: string): Promise<GameRoom> {
  return post<GameRoom>(`/api/multiplayer/rooms/${roomCode.toUpperCase()}/join`, {});
}

export async function matchmaking(gameMode: GameMode, difficulty: Difficulty): Promise<GameRoom> {
  return post<GameRoom>("/api/multiplayer/rooms/matchmaking", { gameMode, difficulty });
}

export async function getRoom(roomCode: string): Promise<GameRoom> {
  return get<GameRoom>(`/api/multiplayer/rooms/${roomCode.toUpperCase()}`);
}

export async function abandonRoom(roomCode: string): Promise<void> {
  await post(`/api/multiplayer/rooms/${roomCode.toUpperCase()}/abandon`, {});
}
