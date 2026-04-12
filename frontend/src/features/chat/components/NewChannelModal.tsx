"use client";

import { useState, useMemo } from "react";

type NewChannelModalProps = {
  onConfirm: (channelId: string, displayName: string) => Promise<void>;
  onCancel: () => void;
};

function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function NewChannelModal({ onConfirm, onCancel }: NewChannelModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const slug = useMemo(() => toSlug(name), [name]);
  const canCreate = slug.length >= 2;

  async function handleCreate() {
    if (!canCreate) return;
    setLoading(true);
    setError(null);
    try {
      await onConfirm(slug, name.trim());
    } catch (err: unknown) {
      if (err && typeof err === "object" && "status" in err) {
        const status = (err as { status: number }).status;
        setError(status === 409 ? "A channel with this slug already exists" : "Could not create channel");
      } else {
        setError("Could not create channel");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm rounded-lg border border-border-subtle bg-surface-panel p-6 space-y-4">
        <h3 className="text-base font-semibold text-text-primary">New topic</h3>

        <div className="space-y-1">
          <label className="text-xs text-text-muted">Channel name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Revision Tips"
            maxLength={64}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border-default bg-surface-card text-text-primary focus:border-accent focus:outline-none"
          />
          {slug && (
            <p className="text-[10px] text-text-muted">
              URL slug: <span className="font-mono text-accent-text">{slug}</span>
            </p>
          )}
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border-subtle text-text-secondary hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!canCreate || loading}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-white disabled:opacity-30"
          >
            {loading ? "Creating..." : "Create channel"}
          </button>
        </div>
      </div>
    </div>
  );
}
