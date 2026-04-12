"use client";

import { Stethoscope } from "lucide-react";
import { useSpecialityContext } from "../hooks/useSpecialityContext";

export function SpecialityToggle() {
  const { specialityPanelOpen, setSpecialityPanelOpen, activeSpecialityId, setActiveSpecialityId } =
    useSpecialityContext();

  function handleToggle() {
    const nextOpen = !specialityPanelOpen;
    setSpecialityPanelOpen(nextOpen);
    if (!nextOpen) {
      setActiveSpecialityId(null);
    }
  }

  return (
    <button
      onClick={handleToggle}
      aria-pressed={specialityPanelOpen}
      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
        specialityPanelOpen || activeSpecialityId
          ? "border-accent bg-accent-muted text-accent-text"
          : "border-border-default bg-surface-card text-text-secondary hover:text-text-primary"
      }`}
    >
      <Stethoscope size={12} />
      Speciality view
    </button>
  );
}
