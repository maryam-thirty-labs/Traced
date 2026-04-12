"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { TabGroup } from "@/shared/ui/TabGroup";
import { SkeletonLoader } from "@/shared/ui/SkeletonLoader";
import { ErrorState } from "@/shared/ui/ErrorState";
import { getDisease, type DiseaseDetail } from "../lib/diseaseApi";
import { DiseaseSymptomsTab } from "./DiseaseSymptomsTab";
import { DiseaseInvestigationsTab } from "./DiseaseInvestigationsTab";
import { DiseaseTreatmentTab } from "./DiseaseTreatmentTab";
import { DiseaseTestYourselfTab } from "./DiseaseTestYourselfTab";

const TABS = ["Overview", "Symptoms", "Investigations", "Treatment", "Test yourself"];

const COMMONNESS_COLORS: Record<string, string> = {
  VERY_COMMON: "text-green-400 bg-green-400/10 border-green-400/30",
  COMMON: "text-green-300 bg-green-300/10 border-green-300/30",
  LESS_COMMON: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  RARE: "text-red-400 bg-red-400/10 border-red-400/30",
};

type DiseasePageClientProps = {
  diseaseCanonicalId: string;
};

export function DiseasePageClient({ diseaseCanonicalId }: DiseasePageClientProps) {
  const [disease, setDisease] = useState<DiseaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");

  const fetchDisease = () => {
    setLoading(true);
    setNotFound(false);
    getDisease(diseaseCanonicalId)
      .then((d) => {
        setDisease(d);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    getDisease(diseaseCanonicalId)
      .then((d) => {
        if (!cancelled) {
          setDisease(d);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [diseaseCanonicalId]);

  if (loading) {
    return (
      <div className="p-6">
        <SkeletonLoader />
      </div>
    );
  }

  if (notFound || !disease) {
    return (
      <div className="p-6">
        <ErrorState message="Disease not found" onRetry={fetchDisease} />
      </div>
    );
  }

  const commonnessClass = COMMONNESS_COLORS[disease.commonness] ?? "text-text-muted bg-surface-elevated border-border-subtle";

  return (
    <div className="flex h-full">
      <aside className="w-80 shrink-0 border-r border-border-default bg-surface-panel p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl border border-accent-border bg-accent-muted flex items-center justify-center">
            <Activity size={22} className="text-accent-text" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-text-primary truncate">{disease.name}</h1>
            {disease.category && (
              <p className="text-xs text-text-muted truncate">{disease.category}</p>
            )}
          </div>
        </div>

        <div>
          <span
            className={`inline-block text-[10px] font-medium px-2 py-1 rounded border ${commonnessClass}`}
          >
            {disease.commonness.replace("_", " ")}
          </span>
        </div>

        {disease.etymology.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-text-muted">Etymology</p>
            <div className="space-y-1.5">
              {disease.etymology.map((e, i) => (
                <div key={i} className="rounded-lg border border-border-subtle bg-surface-card px-3 py-2">
                  <p className="text-sm font-medium text-accent-text">{e.part}</p>
                  <p className="text-xs text-text-secondary">{e.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {disease.aliases.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-text-muted">Also known as</p>
            <div className="flex flex-wrap gap-1">
              {disease.aliases.map((a) => (
                <span
                  key={a.alias}
                  className="text-[10px] px-2 py-0.5 rounded bg-surface-elevated text-text-secondary"
                >
                  {a.alias}
                </span>
              ))}
            </div>
          </div>
        )}

        <nav className="mt-2 flex flex-col gap-1">
          {TABS.map((t) => {
            const isActive = t === activeTab;
            return (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-accent-muted text-accent-text border border-accent-border"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-card"
                }`}
              >
                {t}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="md:hidden mb-4">
          <TabGroup tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <DiseaseTabContent activeTab={activeTab} disease={disease} />
      </main>
    </div>
  );
}

function DiseaseTabContent({ activeTab, disease }: { activeTab: string; disease: DiseaseDetail }) {
  if (activeTab === "Overview") {
    return (
      <div className="max-w-2xl space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">{disease.name}</h2>
        {disease.overview ? (
          <p className="text-sm leading-relaxed text-text-secondary whitespace-pre-line">
            {disease.overview}
          </p>
        ) : (
          <p className="text-sm text-text-muted">No overview available.</p>
        )}
        {disease.etymology.length > 0 && (
          <p className="text-sm leading-relaxed text-text-secondary">
            The name comes from{" "}
            {disease.etymology.map((e, i) => (
              <span key={i}>
                <span className="italic text-accent-text">{e.part}</span>{" "}
                <span className="text-text-muted">({e.meaning})</span>
                {i < disease.etymology.length - 1 ? " + " : "."}
              </span>
            ))}
          </p>
        )}
      </div>
    );
  }

  if (activeTab === "Symptoms") {
    return <DiseaseSymptomsTab diseaseCanonicalId={disease.canonicalId} />;
  }

  if (activeTab === "Investigations") {
    return <DiseaseInvestigationsTab diseaseCanonicalId={disease.canonicalId} />;
  }

  if (activeTab === "Treatment") {
    return <DiseaseTreatmentTab diseaseCanonicalId={disease.canonicalId} />;
  }

  if (activeTab === "Test yourself") {
    return <DiseaseTestYourselfTab diseaseCanonicalId={disease.canonicalId} />;
  }

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-text-muted">{activeTab} content coming soon.</p>
    </div>
  );
}
