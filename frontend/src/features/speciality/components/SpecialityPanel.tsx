"use client";

import { useEffect, useState } from "react";
import { X, Stethoscope } from "lucide-react";
import { listSpecialities, getSpeciality } from "../lib/specialityApi";
import { useSpecialityContext } from "../hooks/useSpecialityContext";
import type { Speciality, SpecialityDetail } from "../types/speciality.types";

export function SpecialityPanel() {
  const {
    specialityPanelOpen,
    setSpecialityPanelOpen,
    activeSpecialityId,
    setActiveSpecialityId,
  } = useSpecialityContext();

  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [activeDetail, setActiveDetail] = useState<SpecialityDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!specialityPanelOpen) return;
    setLoading(true);
    listSpecialities()
      .then(setSpecialities)
      .catch(() => setSpecialities([]))
      .finally(() => setLoading(false));
  }, [specialityPanelOpen]);

  useEffect(() => {
    if (!activeSpecialityId) {
      setActiveDetail(null);
      return;
    }
    getSpeciality(activeSpecialityId)
      .then(setActiveDetail)
      .catch(() => setActiveDetail(null));
  }, [activeSpecialityId]);

  if (!specialityPanelOpen) return null;

  return (
    <aside className="fixed right-0 top-0 h-full w-[320px] border-l border-border-default bg-surface-panel overflow-y-auto z-20">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Stethoscope size={14} className="text-accent-text" />
          Speciality lens
        </h2>
        <button
          onClick={() => {
            setSpecialityPanelOpen(false);
            setActiveSpecialityId(null);
          }}
          aria-label="Close speciality panel"
          className="flex items-center justify-center w-7 h-7 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-elevated"
        >
          <X size={14} />
        </button>
      </div>

      {loading && <p className="text-xs text-text-muted px-4 py-4">Loading specialities...</p>}

      <div className="flex flex-col p-3 gap-2">
        {specialities.map((s) => {
          const isActive = activeSpecialityId === s.canonicalId;
          return (
            <button
              key={s.canonicalId}
              onClick={() => setActiveSpecialityId(isActive ? null : s.canonicalId)}
              className={`text-left px-3 py-2.5 rounded-lg border transition-colors ${
                isActive
                  ? "border-accent bg-accent-muted text-accent-text"
                  : "border-border-subtle bg-surface-card text-text-secondary hover:border-accent-border"
              }`}
            >
              <p className="text-sm font-medium">{s.displayName}</p>
              <p className="text-[11px] text-text-muted line-clamp-2 mt-1">{s.focusDescription}</p>
            </button>
          );
        })}
      </div>

      {activeDetail && activeDetail.focusAnatomy.length > 0 && (
        <div className="px-4 py-3 border-t border-border-subtle">
          <p className="text-[10px] uppercase text-text-muted mb-2">Focus anatomy</p>
          <div className="flex flex-col gap-2">
            {activeDetail.focusAnatomy.map((f) => (
              <div key={f.anatomyCanonicalId} className="rounded-lg bg-surface-card p-2.5">
                <p className="text-xs font-medium text-text-primary">{f.displayName}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{f.clinicalRelevance}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
