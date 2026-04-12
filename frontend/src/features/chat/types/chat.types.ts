export type ChatChannel = {
  channelId: string;
  displayName: string;
  messageCount: number;
  lastActivityAt: string | null;
};

export type ChatMessage = {
  messageId: string;
  channelId: string;
  authorDisplayName: string;
  messageText: string;
  sentAt: string;
  reactionCounts: Record<string, number>;
};

export const ALLOWED_REACTIONS = ["fire", "brain", "check", "laugh", "question", "heart"] as const;
export type ReactionEmoji = typeof ALLOWED_REACTIONS[number];

export const REACTION_ICON: Record<ReactionEmoji, string> = {
  fire: "\u{1F525}",
  brain: "\u{1F9E0}",
  check: "\u2705",
  laugh: "\u{1F602}",
  question: "\u2753",
  heart: "\u2764\uFE0F",
};
