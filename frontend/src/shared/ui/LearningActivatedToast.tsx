"use client";

import { useEffect, useState } from "react";
import { LEARNING_ACTIVATED_EVENT } from "@/shared/lib/auth/MeContext";

const SEEN_KEY = "traced_activation_toast_seen";
const VISIBLE_MS = 4500;

export function LearningActivatedToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (localStorage.getItem(SEEN_KEY) === "true") return;
      localStorage.setItem(SEEN_KEY, "true");
      setVisible(true);
      window.setTimeout(() => setVisible(false), VISIBLE_MS);
    };
    window.addEventListener(LEARNING_ACTIVATED_EVENT, handler);
    return () => window.removeEventListener(LEARNING_ACTIVATED_EVENT, handler);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-3 rounded-xl border border-accent-border bg-accent-muted shadow-lg"
    >
      <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-accent text-white">
        Day 1
      </span>
      <span className="text-sm text-text-primary">
        Your streak starts now. Come back tomorrow.
      </span>
    </div>
  );
}
