"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { getAnatomyPart } from "../lib/anatomyApi";
import type { AnatomyPartDto } from "../types/anatomy.types";
import { TabGroup } from "@/shared/ui/TabGroup";
import { SkeletonLoader } from "@/shared/ui/SkeletonLoader";
import { ErrorState } from "@/shared/ui/ErrorState";
import { AnatomyDiseasesTab } from "./AnatomyDiseasesTab";
import { AnatomyNamesTab } from "./AnatomyNamesTab";
import { AnatomyMechanismsTab } from "./AnatomyMechanismsTab";
import { AnatomyCasesTab } from "./AnatomyCasesTab";

const TABS = ["Diseases", "Names", "Mechanisms", "Cases"] as const;

type AnatomyDetailDrawerProps = {
  canonicalId: string;
  onClose: () => void;
};

export function AnatomyDetailDrawer({
  canonicalId,
  onClose,
}: AnatomyDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<string>(TABS[0]);
  const [part, setPart] = useState<AnatomyPartDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(false);
    getAnatomyPart(canonicalId)
      .then((data) => {
        setPart(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [canonicalId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <aside
      data-testid="anatomy-drawer"
      className="fixed right-0 top-0 h-full w-[340px] border-l border-border-default bg-surface-panel overflow-y-auto z-10"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <div className="flex flex-col gap-0.5">
          {part ? (
            <>
              <span className="text-xs text-text-muted">{part.system} / {part.region}</span>
              <h2 className="text-base font-semibold text-text-primary">{part.displayName}</h2>
              <span className="text-xs font-mono text-text-ghost">{part.canonicalId}</span>
            </>
          ) : (
            <span className="text-xs font-mono text-text-ghost">{canonicalId}</span>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close drawer"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-elevated transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {loading && <SkeletonLoader />}
      {error && <ErrorState onRetry={fetchData} />}

      {part && !loading && !error && (
        <>
          <div className="px-4 py-3">
            <p className="text-sm leading-relaxed text-text-secondary">{part.overview}</p>
          </div>

          <TabGroup tabs={[...TABS]} activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "Diseases" && <AnatomyDiseasesTab diseases={part.diseases} />}
          {activeTab === "Names" && <AnatomyNamesTab aliases={part.aliases} />}
          {activeTab === "Mechanisms" && <AnatomyMechanismsTab mechanisms={part.mechanisms} />}
          {activeTab === "Cases" && <AnatomyCasesTab cases={part.cases} />}
        </>
      )}
    </aside>
  );
}
