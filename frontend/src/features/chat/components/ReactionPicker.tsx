"use client";

import { ALLOWED_REACTIONS, REACTION_ICON, type ReactionEmoji } from "../types/chat.types";

type ReactionPickerProps = {
  onPick: (emoji: ReactionEmoji) => void;
};

export function ReactionPicker({ onPick }: ReactionPickerProps) {
  return (
    <div className="flex gap-0.5 rounded-lg border border-border-subtle bg-surface-elevated px-1 py-0.5 shadow-sm">
      {ALLOWED_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onPick(emoji)}
          aria-label={`React with ${emoji}`}
          className="px-1.5 py-0.5 text-sm hover:bg-surface-card rounded transition-colors"
        >
          {REACTION_ICON[emoji]}
        </button>
      ))}
    </div>
  );
}
