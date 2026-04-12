"use client";

import { useState, useEffect, useCallback } from "react";
import { X, UserPlus } from "lucide-react";
import {
  listFriends,
  addFriend,
  removeFriend,
  type FriendRow,
} from "../lib/leaderboardApi";

export function FriendsManager() {
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const rows = await listFriends();
      setFriends(rows);
    } catch {
      setFriends([]);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) return;
    setAdding(true);
    setError(null);
    try {
      await addFriend(displayName.trim());
      setDisplayName("");
      await refresh();
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "status" in err
        ? ((err as { status: number }).status === 400
            ? "You cannot add yourself"
            : (err as { status: number }).status === 404
              ? "User not found"
              : (err as { status: number }).status === 409
                ? "Already friends"
                : "Could not add friend")
        : "Could not add friend";
      setError(message);
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(friendId: string) {
    await removeFriend(friendId);
    await refresh();
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text-primary">Friends</h3>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Search by display name"
          className="flex-1 px-3 py-2 text-xs rounded-lg border border-border-default bg-surface-card text-text-primary focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={adding || !displayName.trim()}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-accent text-white disabled:opacity-40"
        >
          <UserPlus size={12} />
          Add
        </button>
      </form>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {friends.length === 0 && (
        <p className="text-xs text-text-muted">No friends yet. Add one by display name above.</p>
      )}

      <div className="flex flex-col gap-1.5">
        {friends.map((f) => (
          <div
            key={f.friendProfileId}
            className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-card px-3 py-2"
          >
            <span className="text-sm text-text-primary">{f.displayName}</span>
            <button
              onClick={() => handleRemove(f.friendProfileId)}
              aria-label={`Remove ${f.displayName}`}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-text-muted hover:text-red-400"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
