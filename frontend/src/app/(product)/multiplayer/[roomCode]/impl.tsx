"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Copy, Users } from "lucide-react";
import { getRoom, abandonRoom } from "@/features/multiplayer/lib/multiplayerApi";
import { createStompClient, subscribeToRoom } from "@/features/multiplayer/lib/stompClient";
import { getSession } from "@/shared/lib/auth/auth";
import { SkeletonLoader } from "@/shared/ui/SkeletonLoader";
import { ErrorState } from "@/shared/ui/ErrorState";
import type { GameRoom, Participant } from "@/features/multiplayer/types/game.types";
import type { Client } from "@stomp/stompjs";

export default function RoomPage({
  params,
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = use(params);
  const router = useRouter();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const clientRef = useRef<Client | null>(null);
  const session = getSession();

  // Fetch initial room state + connect WebSocket
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const initial = await getRoom(roomCode);
        if (cancelled) return;
        setRoom(initial);
        setLoading(false);

        const client = createStompClient();
        clientRef.current = client;
        await subscribeToRoom(client, roomCode, (event) => {
          if (event.event === "PARTICIPANTS_UPDATED") {
            setRoom((prev) => prev ? {
              ...prev,
              participants: event.participants as Participant[],
              status: event.status as GameRoom["status"],
            } : prev);
          } else if (event.event === "ROOM_ABANDONED") {
            router.push("/multiplayer");
          } else if (event.event === "GAME_STARTED") {
            setCountdown(3);
            // Countdown then navigate to game (game UIs in 11.14-11.16)
          }
        });
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [roomCode, router]);

  // Countdown timer
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function handleCopyCode() {
    if (!roomCode) return;
    try {
      await navigator.clipboard.writeText(roomCode);
    } catch {
      // Silent fallback
    }
  }

  async function handleStart() {
    // Placeholder: start-round endpoint wired in 11.14+
    alert("Game start wires up in the mode-specific UI sprints (11.14\u201311.16).");
  }

  async function handleAbandon() {
    await abandonRoom(roomCode);
    router.push("/multiplayer");
  }

  if (loading) return <SkeletonLoader />;
  if (error || !room) return <ErrorState message="Couldn't load room" onRetry={() => window.location.reload()} />;

  const amHost = session !== null && room.participants.some((p) => p.displayName === session.displayName && p.userProfileId === room.hostProfileId);
  const canStart = amHost && room.participants.length >= 2 && room.status === "WAITING";

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      {countdown !== null && countdown > 0 && (
        <div className="rounded-lg bg-accent-muted border border-accent-border p-6 text-center">
          <p className="text-xs text-text-muted">Starting in</p>
          <p className="text-4xl font-bold text-accent-text animate-pulse">{countdown}</p>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs text-text-muted uppercase">Room code</p>
        <div className="flex items-center gap-3">
          <code className="text-3xl font-mono font-bold text-accent-text tracking-widest">{room.roomCode}</code>
          <button
            onClick={handleCopyCode}
            aria-label="Copy code"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated"
          >
            <Copy size={14} />
          </button>
        </div>
        <p className="text-xs text-text-secondary">
          {room.gameMode.replace(/_/g, " ")} \u00b7 {room.difficulty}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Users size={12} />
          <span>{room.participants.length} / 4 players</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {room.participants.map((p) => (
            <div
              key={p.participantId}
              className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-card px-3 py-2"
            >
              <span className="text-sm text-text-primary">
                {p.displayName}
                {p.userProfileId === room.hostProfileId && (
                  <span className="text-[10px] ml-2 text-accent-text">host</span>
                )}
              </span>
              <span className="text-xs text-text-muted">{p.score} pts</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        {amHost ? (
          <button
            onClick={handleStart}
            disabled={!canStart}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-accent text-white disabled:opacity-30"
          >
            Start game
          </button>
        ) : (
          <p className="flex-1 text-center text-xs text-text-muted py-3">
            Waiting for host to start...
          </p>
        )}
        <button
          onClick={handleAbandon}
          className="px-4 py-2 text-xs font-medium rounded-lg border border-red-400/30 text-red-400 hover:bg-red-400/10"
        >
          Leave
        </button>
      </div>
    </div>
  );
}
