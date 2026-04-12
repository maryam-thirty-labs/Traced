"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Hash } from "lucide-react";
import { listChannels, listMessages } from "@/features/chat/lib/chatApi";
import { SkeletonLoader } from "@/shared/ui/SkeletonLoader";
import { ErrorState } from "@/shared/ui/ErrorState";
import type { ChatChannel, ChatMessage } from "@/features/chat/types/chat.types";

export default function CommunityPage() {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
        <div className="px-3 py-3 border-b border-border-subtle">
          <h2 className="text-xs font-semibold uppercase text-text-muted">Channels</h2>
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
            <div key={m.messageId} className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-text-primary">{m.authorDisplayName}</span>
                <span className="text-[10px] text-text-muted">
                  {new Date(m.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{m.messageText}</p>
              {Object.keys(m.reactionCounts).length > 0 && (
                <div className="flex gap-1 mt-1">
                  {Object.entries(m.reactionCounts).map(([emoji, count]) => (
                    <span
                      key={emoji}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-secondary"
                    >
                      {emoji} {count}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input bar placeholder (sprint 10.8) */}
        <div className="px-6 py-3 border-t border-border-subtle">
          <p className="text-xs text-text-muted italic">Message input coming in next sprint</p>
        </div>
      </main>
    </div>
  );
}
