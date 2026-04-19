"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { fetchMe, getCachedMe, type MeDto } from "./auth";

type MeState = {
  me: MeDto | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const MeContext = createContext<MeState | null>(null);

export function MeProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<MeDto | null>(() => getCachedMe());
  const [loading, setLoading] = useState(me === null);

  const refresh = useCallback(async () => {
    try {
      const fresh = await fetchMe();
      setMe(fresh);
    } catch {
      // Leave cached value in place; AuthGuard handles 401s.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <MeContext.Provider value={{ me, loading, refresh }}>
      {children}
    </MeContext.Provider>
  );
}

export function useMe(): MeState {
  const ctx = useContext(MeContext);
  if (!ctx) {
    throw new Error("useMe must be used inside MeProvider");
  }
  return ctx;
}
