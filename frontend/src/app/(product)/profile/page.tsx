"use client";

import { useEffect, useState, useCallback } from "react";
import { getProfile, updatePreferences } from "@/features/progression/lib/progressApi";
import { SkeletonLoader } from "@/shared/ui/SkeletonLoader";
import { ErrorState } from "@/shared/ui/ErrorState";
import type { UserProfileDto } from "@/features/progression/types/progress.types";

const BADGES = [
  { id: "first-case", name: "First Steps", description: "Complete your first case", icon: "\u{1F9EA}", requiredLevel: 1 },
  { id: "level-3", name: "Rising Student", description: "Reach Level 3", icon: "\u{1F4DA}", requiredLevel: 3 },
  { id: "level-5", name: "Scholar", description: "Reach Level 5", icon: "\u{1F393}", requiredLevel: 5 },
  { id: "level-8", name: "Authority", description: "Reach Level 8", icon: "\u{2B50}", requiredLevel: 8 },
] as const;

const SYSTEM_LABELS: Record<string, string> = {
  SYS_DIGESTIVE_001: "Digestive",
  SYS_SKELETAL_001: "Skeletal",
  SYS_CARDIOVASCULAR_001: "Cardiovascular",
  SYS_NERVOUS_001: "Nervous",
  SYS_RESPIRATORY_001: "Respiratory",
  SYS_MUSCULAR_001: "Muscular",
  SYS_VASCULAR_001: "Vascular",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchProfile = useCallback(() => {
    setLoading(true);
    setError(false);
    getProfile()
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) return <SkeletonLoader />;
  if (error) return <ErrorState message="Couldn't load profile" onRetry={fetchProfile} />;
  if (!profile) return null;

  const initials = profile.displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
      {/* Hero */}
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent-muted text-accent-text text-xl font-bold">
          {initials}
        </div>
        <div>
          <h1 className="text-lg font-semibold text-text-primary">{profile.displayName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-accent-muted text-accent-text">
              Lv {profile.currentLevel}
            </span>
            <span className="text-xs text-text-secondary">{profile.levelTitle}</span>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center rounded-lg border border-border-subtle bg-surface-card p-3">
          <span className="text-lg font-bold text-accent-text">{profile.totalXp}</span>
          <span className="text-[10px] text-text-muted">Total XP</span>
        </div>
        <div className="flex flex-col items-center rounded-lg border border-border-subtle bg-surface-card p-3">
          <span className="text-lg font-bold text-text-primary">{profile.currentStreak}</span>
          <span className="text-[10px] text-text-muted">Day Streak</span>
        </div>
        <div className="flex flex-col items-center rounded-lg border border-border-subtle bg-surface-card p-3">
          <span className="text-lg font-bold text-text-primary">{profile.unlockedSystems.length}</span>
          <span className="text-[10px] text-text-muted">Systems Unlocked</span>
        </div>
      </div>

      {/* Unlocked systems */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text-primary">Unlocked Systems</h3>
        <div className="flex flex-wrap gap-2">
          {profile.unlockedSystems.map((sys) => (
            <span
              key={sys}
              className="text-xs px-2.5 py-1 rounded-lg bg-green-400/10 text-green-400 border border-green-400/20"
            >
              {SYSTEM_LABELS[sys] ?? sys}
            </span>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text-primary">Preferences</h3>

        <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-card p-4">
          <div>
            <p className="text-sm text-text-primary">Etymology breakdowns</p>
            <p className="text-xs text-text-muted">Show word-root meanings on disease cards</p>
          </div>
          <button
            onClick={async () => {
              const newVal = !profile.etymologyEnabled;
              await updatePreferences({ etymologyEnabled: newVal });
              setProfile({ ...profile, etymologyEnabled: newVal });
            }}
            className={`text-xs font-medium px-3 py-1 rounded transition-colors ${profile.etymologyEnabled ? "bg-green-400/10 text-green-400" : "bg-surface-elevated text-text-muted"}`}
          >
            {profile.etymologyEnabled ? "On" : "Off"}
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-card p-4">
          <div>
            <p className="text-sm text-text-primary">Preferred system</p>
            <p className="text-xs text-text-muted">Default system on explorer load</p>
          </div>
          <select
            value={profile.unlockedSystems.includes(profile.displayName) ? "" : ""}
            onChange={async (e) => {
              await updatePreferences({ preferredSystem: e.target.value });
            }}
            className="text-xs px-2 py-1 rounded bg-surface-elevated text-text-secondary border border-border-default focus:outline-none focus:border-accent"
          >
            {profile.unlockedSystems.map((sys) => (
              <option key={sys} value={sys}>
                {SYSTEM_LABELS[sys] ?? sys}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Badges */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text-primary">Badges</h3>
        <div className="grid grid-cols-2 gap-3">
          {BADGES.map((badge) => {
            const earned = profile.currentLevel >= badge.requiredLevel;
            return (
              <div
                key={badge.id}
                className={`flex items-center gap-3 rounded-lg border p-3 ${
                  earned
                    ? "border-accent-border bg-accent-muted"
                    : "border-border-subtle bg-surface-card opacity-40"
                }`}
              >
                <span className="text-2xl">{badge.icon}</span>
                <div>
                  <p className={`text-sm font-medium ${earned ? "text-accent-text" : "text-text-muted"}`}>
                    {badge.name}
                  </p>
                  <p className="text-[10px] text-text-muted">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
