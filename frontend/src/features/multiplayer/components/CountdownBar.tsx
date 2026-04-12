"use client";

import { useEffect, useState } from "react";

type CountdownBarProps = {
  durationSeconds: number;
  onExpire?: () => void;
};

export function CountdownBar({ durationSeconds, onExpire }: CountdownBarProps) {
  const [remaining, setRemaining] = useState(durationSeconds);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire?.();
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onExpire]);

  const pct = Math.max(0, (remaining / durationSeconds) * 100);
  const isRed = remaining <= 5;

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-[10px] text-text-muted">
        <span>Time remaining</span>
        <span>{remaining}s</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-surface-elevated overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${isRed ? "bg-red-400" : "bg-accent"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
