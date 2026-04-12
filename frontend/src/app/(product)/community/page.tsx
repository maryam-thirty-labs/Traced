"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Hash, Plus, Flag } from "lucide-react";
import {
  listChannels, listMessages, sendMessage, reactToMessage,
  createChannel, flagMessage,
} from "@/features/chat/lib/chatApi";
import { MessageInput } from "@/features/chat/components/MessageInput";
import { ReactionPicker } from "@/features/chat/components/ReactionPicker";
import { NewChannelModal } from "@/features/chat/components/NewChannelModal";
import { getSession } from "@/shared/lib/auth/auth";
import { SkeletonLoader } from "@/shared/ui/SkeletonLoader";
import { ErrorState } from "@/shared/ui/ErrorState";
import type { ChatChannel, ChatMessage, ReactionEmoji } from "@/features/chat/types/chat.types";
import { REACTION_ICON } from "@/features/chat/types/chat.types";

export default function CommunityPage() {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [flaggedMessages, setFlaggedMessages] = useState<Set<string>>(new Set());

  const myDisplayName = getSession()?.displayName ?? null;

  const fetchChannels = useCallback(async () => {
    setLoadingChannels(true);
    setError(false);
    try {
      const list = await listChannels();
      setChannels(list);
      if (list.length > 0 && !activeChannel) {
        setActiveChannel(list[0].channelId);
      }
    } catch {
      setError(true);
    } finally {
      setLoadingChannels(false);
    }
  }, [activeChannel]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const fetchMessages = useCallback(async (channelId: string) => {
    setLoadingMessages(true);
    try {
      const list = await listMessages(channelId);
      // Oldest first for display
      setMessages([...list].reverse());
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  async function handleSend(messageText: string) {
    if (!activeChannel) return;
    const newMessage = await sendMessage(activeChannel, messageText);
    setMessages((prev) => [...prev, newMessage]);
  }

  async function handleCreateChannel(channelId: string, displayName: string) {
    const created = await createChannel(channelId, displayName);
    setChannels((prev) => [...prev, created]);
    setActiveChannel(created.channelId);
    setShowNewChannelModal(false);
  }

  async function handleFlag(messageId: string) {
    try {
      await flagMessage(messageId);
      setFlaggedMessages((prev) => new Set(prev).add(messageId));
    } catch {
      // Silent — user still sees the message
    }
  }

  async function handleReact(messageId: string, emoji: ReactionEmoji) {
    if (!activeChannel) return;
    // Optimistic: increment count
    setMessages((prev) => prev.map((m) => {
      if (m.messageId !== messageId) return m;
      const counts = { ...m.reactionCounts };
      counts[emoji] = (counts[emoji] ?? 0) + 1;
      return { ...m, reactionCounts: counts };
    }));
    try {
      await reactToMessage(activeChannel, messageId, emoji);
    } catch {
      // Revert on failure
      setMessages((prev) => prev.map((m) => {
        if (m.messageId !== messageId) return m;
        const counts = { ...m.reactionCounts };
        counts[emoji] = Math.max(0, (counts[emoji] ?? 1) - 1);
        if (counts[emoji] === 0) delete counts[emoji];
        return { ...m, reactionCounts: counts };
      }));
    }
  }

  // When active channel changes: fetch history + subscribe to Realtime
  useEffect(() => {
    if (!activeChannel) return;

    // Clean up previous subscription
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }

    fetchMessages(activeChannel);

    // Note: Supabase subscription uses channel UUID, but we only have the slug client-side.
    // In production, the channel list response would include the UUID; for now Realtime is a no-op fallback.
    // The subscription will activate when NEXT_PUBLIC_SUPABASE_URL is set and channel UUID wired in.
    // Keeping the cleanup function architecture in place.

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [activeChannel, fetchMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (loadingChannels) return <SkeletonLoader />;
  if (error) return <ErrorState message="Couldn't load community" onRetry={fetchChannels} />;

  const active = channels.find((c) => c.channelId === activeChannel);

  return (
    <div className="flex h-full">
      {/* Channel list */}
      <aside className="w-56 border-r border-border-default bg-surface-panel overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-3 border-b border-border-subtle">
          <h2 className="text-xs font-semibold uppercase text-text-muted">Channels</h2>
          <button
            onClick={() => setShowNewChannelModal(true)}
            aria-label="New topic"
            className="flex items-center justify-center w-6 h-6 rounded text-text-muted hover:text-accent-text hover:bg-surface-elevated"
          >
            <Plus size={12} />
          </button>
        </div>
        <div className="py-1">
          {channels.map((c) => (
            <button
              key={c.channelId}
              onClick={() => setActiveChannel(c.channelId)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                activeChannel === c.channelId
                  ? "bg-accent-muted text-accent-text"
                  : "text-text-secondary hover:bg-surface-elevated"
              }`}
            >
              <Hash size={14} className="shrink-0" />
              <span className="truncate">{c.displayName}</span>
              {c.messageCount > 0 && (
                <span className="ml-auto text-[10px] text-text-muted">{c.messageCount}</span>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Message feed */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {active && (
          <div className="px-6 py-3 border-b border-border-subtle">
            <h3 className="text-sm font-semibold text-text-primary">
              <Hash size={14} className="inline mr-1" />
              {active.displayName}
            </h3>
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {loadingMessages && <p className="text-xs text-text-muted">Loading messages...</p>}
          {!loadingMessages && messages.length === 0 && (
            <p className="text-xs text-text-muted italic">No messages yet. Be the first to say hello.</p>
          )}
          {messages.map((m) => (
            <div key={m.messageId} className="group flex flex-col gap-0.5 relative">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-text-primary">{m.authorDisplayName}</span>
                <span className="text-[10px] text-text-muted">
                  {new Date(m.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{m.messageText}</p>

              {/* Reaction counts */}
              {Object.keys(m.reactionCounts).length > 0 && (
                <div className="flex gap-1 mt-1">
                  {Object.entries(m.reactionCounts).map(([emoji, count]) => (
                    <span
                      key={emoji}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-secondary"
                    >
                      {REACTION_ICON[emoji as ReactionEmoji] ?? emoji} {count}
                    </span>
                  ))}
                </div>
              )}

              {/* Hover reaction picker + flag (flag hidden on own messages) */}
              <div className="absolute right-0 top-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <ReactionPicker onPick={(emoji) => handleReact(m.messageId, emoji)} />
                {myDisplayName !== m.authorDisplayName && (
                  flaggedMessages.has(m.messageId) ? (
                    <span className="text-[10px] px-2 py-1 rounded bg-amber-400/10 text-amber-400">
                      Flagged for review
                    </span>
                  ) : (
                    <button
                      onClick={() => handleFlag(m.messageId)}
                      aria-label="Flag message"
                      className="flex items-center justify-center w-7 h-7 rounded-lg text-text-muted hover:text-amber-400 hover:bg-surface-elevated"
                    >
                      <Flag size={12} />
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input bar */}
        {activeChannel && (
          <div className="px-6 py-3 border-t border-border-subtle">
            <MessageInput onSend={handleSend} />
          </div>
        )}
      </main>

      {showNewChannelModal && (
        <NewChannelModal
          onCancel={() => setShowNewChannelModal(false)}
          onConfirm={handleCreateChannel}
        />
      )}
    </div>
  );
}
