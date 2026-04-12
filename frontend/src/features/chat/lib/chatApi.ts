import { get, post } from "@/shared/lib/api/http";
import type { ChatChannel, ChatMessage, ReactionEmoji } from "../types/chat.types";

export async function listChannels(): Promise<ChatChannel[]> {
  return get<ChatChannel[]>("/api/chat/channels");
}

export async function createChannel(channelId: string, displayName: string): Promise<ChatChannel> {
  return post<ChatChannel>("/api/chat/channels", { channelId, displayName });
}

export async function listMessages(channelId: string, before?: string, limit = 50): Promise<ChatMessage[]> {
  const params = new URLSearchParams();
  if (before) params.set("before", before);
  params.set("limit", String(limit));
  return get<ChatMessage[]>(`/api/chat/channels/${channelId}/messages?${params.toString()}`);
}

export async function sendMessage(channelId: string, messageText: string): Promise<ChatMessage> {
  return post<ChatMessage>(`/api/chat/channels/${channelId}/messages`, { messageText });
}

export async function reactToMessage(
  channelId: string,
  messageId: string,
  reactionEmoji: ReactionEmoji,
): Promise<void> {
  await post(
    `/api/chat/channels/${channelId}/messages/${messageId}/react`,
    { reactionEmoji },
  );
}

export async function flagMessage(messageId: string): Promise<void> {
  await post(`/api/chat/messages/${messageId}/flag`, {});
}
