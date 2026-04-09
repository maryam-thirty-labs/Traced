"use client";

import { useState } from "react";

type ResetProgressModalProps = {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
};

export function ResetProgressModal({ onConfirm, onCancel }: ResetProgressModalProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const canConfirm = input === "RESET";

  async function handleConfirm() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm rounded-lg border border-border-subtle bg-surface-panel p-6 space-y-4">
        <h3 className="text-base font-semibold text-text-primary">Reset all progress?</h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          This will permanently delete all case attempts, mastery records, and reset your XP to 0.
          Your account and preferences will be preserved.
        </p>
        <div className="space-y-1">
          <label className="text-xs text-text-muted">
            Type <span className="font-mono text-red-400">RESET</span> to confirm
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="RESET"
            className="w-full px-3 py-2 text-sm rounded-lg border border-border-default bg-surface-card text-text-primary focus:border-red-400 focus:outline-none"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border-subtle text-text-secondary hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || loading}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500 text-white disabled:opacity-30"
          >
            {loading ? "Resetting..." : "Reset progress"}
          </button>
        </div>
      </div>
    </div>
  );
}
