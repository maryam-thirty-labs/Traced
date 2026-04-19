"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Zap, Brain } from "lucide-react";
import { createRoom, joinRoom, matchmaking } from "@/features/multiplayer/lib/multiplayerApi";
import type { GameMode, Difficulty } from "@/features/multiplayer/types/game.types";

type ModeOption = {
  mode: GameMode;
  title: string;
  description: string;
  difficulty: Difficulty;
  icon: typeof Users;
};

const MODES: ModeOption[] = [
  {
    mode: "NAME_STRUCTURE",
    title: "Name that Structure",
    description: "A region lights up on the body map. Type the name fastest to score.",
    difficulty: "EASY",
    icon: Zap,
  },
  {
    mode: "TRACE_SYSTEM",
    title: "Trace the System",
    description: "Place organs in anatomical order before the timer runs out.",
    difficulty: "MEDIUM",
    icon: Users,
  },
  {
    mode: "MYSTERY_DIAGNOSIS",
    title: "Mystery Diagnosis",
    description: "Clinical vignette + 4 options. Pick the right diagnosis.",
    difficulty: "HARD",
    icon: Brain,
  },
];

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  EASY: "text-green-400 bg-green-400/10",
  MEDIUM: "text-amber-400 bg-amber-400/10",
  HARD: "text-red-400 bg-red-400/10",
};

export default function MultiplayerPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(mode: GameMode, difficulty: Difficulty) {
    setError(null);
    try {
      const room = await createRoom(mode, difficulty);
      router.push(`/multiplayer/${room.roomCode}`);
    } catch {
      setError("Could not create room. Try again.");
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return;
    setError(null);
    try {
      const room = await joinRoom(joinCode.trim());
      router.push(`/multiplayer/${room.roomCode}`);
    } catch {
      setError("Could not join room. Check the code and try again.");
    }
  }

  async function handleQuickMatch(mode: GameMode, difficulty: Difficulty) {
    setError(null);
    try {
      const room = await matchmaking(mode, difficulty);
      router.push(`/multiplayer/${room.roomCode}`);
    } catch {
      setError("Matchmaking failed. Try again.");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Multiplayer</h1>
        <p className="text-sm text-text-secondary">Real-time games up to 4 players.</p>
      </div>

      {/* Mode cards */}
      <div className="grid gap-3">
        {MODES.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.mode} className="rounded-lg border border-border-subtle bg-surface-card p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-muted flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-accent-text" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-text-primary">{m.title}</h3>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${DIFFICULTY_COLOR[m.difficulty]}`}>
                      {m.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">{m.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCreate(m.mode, m.difficulty)}
                  className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-accent text-white"
                >
                  Create room
                </button>
                <button
                  onClick={() => handleQuickMatch(m.mode, m.difficulty)}
                  className="flex-1 px-3 py-2 text-xs font-medium rounded-lg border border-border-default text-text-secondary hover:text-text-primary"
                >
                  Quick match
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Join with code */}
      <div className="rounded-lg border border-border-subtle bg-surface-card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-text-primary">Join with code</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="ABC234"
            maxLength={6}
            className="flex-1 px-3 py-2 text-sm font-mono rounded-lg border border-border-default bg-surface-elevated text-text-primary focus:border-accent focus:outline-none"
          />
          <button
            onClick={handleJoin}
            disabled={joinCode.length !== 6}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-accent text-white disabled:opacity-30"
          >
            Join
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
