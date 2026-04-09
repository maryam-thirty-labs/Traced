"use client";

type TabGroupProps = {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export function TabGroup({ tabs, activeTab, onTabChange }: TabGroupProps) {
  return (
    <div className="flex border-b border-border-subtle" role="tablist">
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab)}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "text-accent-text border-b-2 border-accent"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
