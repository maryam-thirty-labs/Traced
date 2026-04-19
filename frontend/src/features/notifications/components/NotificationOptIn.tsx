"use client";

import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { subscribeToPush, unsubscribeFromPush } from "../lib/pushApi";

const TIMES = [
  { key: "07:00", label: "7am" },
  { key: "09:00", label: "9am" },
  { key: "12:00", label: "12pm" },
  { key: "18:00", label: "6pm" },
  { key: "21:00", label: "9pm" },
] as const;

type Props = {
  enabled: boolean;
  reminderTime: string | null;
  onChange: (state: { enabled: boolean; reminderTime: string | null }) => void;
};

export function NotificationOptIn({ enabled, reminderTime, onChange }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>(reminderTime ?? "21:00");

  async function enable() {
    setSaving(true);
    setError(null);
    try {
      const ok = await subscribeToPush(selected);
      if (!ok) throw new Error("permission-denied");
      onChange({ enabled: true, reminderTime: selected });
    } catch {
      setError("Notifications couldn't be enabled. Check browser permissions.");
    } finally {
      setSaving(false);
    }
  }

  async function disable() {
    setSaving(true);
    setError(null);
    try {
      await unsubscribeFromPush();
      onChange({ enabled: false, reminderTime: null });
    } catch {
      setError("Couldn't turn off notifications.");
    } finally {
      setSaving(false);
    }
  }

  if (enabled) {
    return (
      <div className="rounded-xl border border-border-subtle bg-surface-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-accent-text" />
          <h3 className="text-sm font-semibold text-text-primary">Daily reminder</h3>
        </div>
        <p className="text-xs text-text-secondary">
          You&apos;ll get a nudge at <span className="font-semibold">{reminderTime ?? "—"}</span> each day.
        </p>
        <button
          onClick={disable}
          disabled={saving}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-border-default text-text-secondary hover:text-text-primary"
        >
          <BellOff size={12} />
          Turn off
        </button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Bell size={16} className="text-accent-text" />
        <h3 className="text-sm font-semibold text-text-primary">Daily reminder</h3>
      </div>
      <p className="text-xs text-text-secondary">
        We&apos;ll remind you at the time you&apos;re most likely to finish a session. Pick one.
      </p>
      <div className="flex flex-wrap gap-2">
        {TIMES.map((t) => (
          <button
            key={t.key}
            onClick={() => setSelected(t.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selected === t.key
                ? "bg-accent text-white"
                : "bg-surface-elevated text-text-secondary hover:text-text-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <button
        onClick={enable}
        disabled={saving}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-accent text-white disabled:opacity-50"
      >
        {saving ? "Enabling…" : "Enable reminders"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
