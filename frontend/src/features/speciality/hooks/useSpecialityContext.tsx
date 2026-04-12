"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type SpecialityContextValue = {
  activeSpecialityId: string | null;
  setActiveSpecialityId: (id: string | null) => void;
  specialityPanelOpen: boolean;
  setSpecialityPanelOpen: (open: boolean) => void;
};

const SpecialityContext = createContext<SpecialityContextValue | null>(null);

export function SpecialityProvider({ children }: { children: ReactNode }) {
  const [activeSpecialityId, setActiveSpecialityId] = useState<string | null>(null);
  const [specialityPanelOpen, setSpecialityPanelOpen] = useState(false);

  return (
    <SpecialityContext.Provider
      value={{
        activeSpecialityId,
        setActiveSpecialityId,
        specialityPanelOpen,
        setSpecialityPanelOpen,
      }}
    >
      {children}
    </SpecialityContext.Provider>
  );
}

export function useSpecialityContext(): SpecialityContextValue {
  const ctx = useContext(SpecialityContext);
  if (!ctx) {
    throw new Error("useSpecialityContext must be used within SpecialityProvider");
  }
  return ctx;
}
