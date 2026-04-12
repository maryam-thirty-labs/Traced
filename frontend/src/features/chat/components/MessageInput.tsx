"use client";

import { useState, useRef } from "react";
import { Send } from "lucide-react";

type MessageInputProps = {
  onSend: (text: string) => Promise<void>;
  maxLength?: number;
};

export function MessageInput({ onSend, maxLength = 500 }: MessageInputProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const canSend = text.trim().length > 0 && !sending;

  async function handleSend() {
    if (!canSend) return;
    const value = text.trim();
    setText("");
    setSending(true);
    try {
      await onSend(value);
    } catch {
      setText(value);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex gap-2 items-end">
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, maxLength))}
        onKeyDown={handleKey}
        placeholder="Type a message..."
        rows={1}
        className="flex-1 resize-none px-3 py-2 text-sm rounded-lg border border-border-default bg-surface-card text-text-primary focus:border-accent focus:outline-none"
      />
      <button
        onClick={handleSend}
        disabled={!canSend}
        aria-label="Send message"
        className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent text-white disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Send size={16} />
      </button>
    </div>
  );
}
