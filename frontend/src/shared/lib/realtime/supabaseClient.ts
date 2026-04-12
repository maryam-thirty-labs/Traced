import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Not configured — Realtime disabled, frontend falls back to polling
    return null;
  }

  client = createClient(url, anonKey, {
    realtime: { params: { eventsPerSecond: 10 } },
  });
  return client;
}

export type RealtimeMessagePayload = {
  id: string;
  channel_id: string;
  author_profile_id: string;
  message_text: string;
  sent_at: string;
  status: string;
};

/**
 * Subscribe to new chat messages for a specific channel.
 * Broadcasts are scoped to one channel only — cross-channel events never fire here.
 *
 * Returns unsubscribe function. Safe to call even when Supabase is not configured.
 */
export function subscribeToChannel(
  channelUuid: string,
  onInsert: (message: RealtimeMessagePayload) => void,
): () => void {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return () => {};
  }

  const subscription = supabase
    .channel(`chat_messages:${channelUuid}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `channel_id=eq.${channelUuid}`,
      },
      (payload) => {
        const row = payload.new as RealtimeMessagePayload;
        if (row.status === "VISIBLE") {
          onInsert(row);
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}
