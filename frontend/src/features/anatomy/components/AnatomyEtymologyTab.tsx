"use client";

export function AnatomyEtymologyTab() {
  // Sprint 6 owns the placeholder temporal next-action footer.
  // Sprint 22 replaces the "[loading…]" copy with real content from
  // GET /api/learning/next-action.
  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      <p className="text-sm text-text-secondary italic">
        Etymology content arrives with the lesson loop (Phase 1).
      </p>

      <div className="mt-auto border-t border-border-subtle pt-3">
        <p className="text-xs uppercase tracking-wider text-text-muted">
          Tomorrow&apos;s root
        </p>
        <p className="text-sm text-text-secondary mt-1">
          Tomorrow: <span className="italic">[loading…]</span>
        </p>
        <button
          type="button"
          disabled
          className="mt-2 text-xs font-medium text-accent-text opacity-60 cursor-not-allowed"
        >
          Set a reminder →
        </button>
      </div>
    </div>
  );
}
