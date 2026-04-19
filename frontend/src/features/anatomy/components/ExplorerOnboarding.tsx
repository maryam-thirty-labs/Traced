"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const DISMISSED_KEY = "traced_explorer_hint_dismissed";

type Props = {
  active: boolean;
  onFallbackSelectHeart: () => void;
};

export function ExplorerOnboarding({ active, onFallbackSelectHeart }: Props) {
  const [hintVisible, setHintVisible] = useState(false);
  const [fallbackVisible, setFallbackVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!active) return;
    const previously = localStorage.getItem(DISMISSED_KEY) === "true";
    if (previously) return;
    setDismissed(false);
    const hintT = window.setTimeout(() => setHintVisible(true), 1000);
    const fallbackT = window.setTimeout(() => setFallbackVisible(true), 8000);
    return () => {
      window.clearTimeout(hintT);
      window.clearTimeout(fallbackT);
    };
  }, [active]);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
    setHintVisible(false);
    setFallbackVisible(false);
  };

  if (dismissed) return null;

  return (
    <>
      {hintVisible && (
        <div
          role="status"
          className="pointer-events-auto fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full border border-border-default bg-surface-card text-sm text-text-primary shadow-lg"
        >
          <span>Tap any organ to explore</span>
          <button
            onClick={dismiss}
            aria-label="Dismiss hint"
            className="text-text-muted hover:text-text-primary"
          >
            <X size={14} />
          </button>
        </div>
      )}
      {fallbackVisible && (
        <div className="pointer-events-auto fixed bottom-20 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={() => {
              onFallbackSelectHeart();
              dismiss();
            }}
            className="px-4 py-2 text-sm font-medium rounded-full border border-accent-border bg-accent-muted text-accent-text hover:bg-accent hover:text-white transition-colors"
          >
            Not sure where to start? Try the heart →
          </button>
        </div>
      )}
    </>
  );
}

export function markExplorerOnboardingDismissed() {
  if (typeof window === "undefined") return;
  localStorage.setItem(DISMISSED_KEY, "true");
}
