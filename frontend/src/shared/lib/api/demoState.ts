// Mutable demo-mode state, persisted to localStorage so the illusion of a
// backend survives reloads within one browser. Read/written only when
// NEXT_PUBLIC_DEMO_MODE is on (see demoMode.ts).

const STORE_KEY = "traced_demo_state";

export type DemoState = {
  displayName: string;
  email: string;
  background: "curious_adult" | "med_student" | "fitness" | "health_scare";
  learningActivated: boolean;
  streakDays: number;
  totalXp: number;
  lessonCompletedToday: boolean;
  exploredCanonicalIds: string[];
  collectedRootIds: string[];
};

const DEFAULT_STATE: DemoState = {
  displayName: "Demo Explorer",
  email: "demo@traced.app",
  background: "curious_adult",
  learningActivated: false,
  streakDays: 0,
  totalXp: 0,
  lessonCompletedToday: false,
  exploredCanonicalIds: [],
  collectedRootIds: [],
};

let memoryState: DemoState | null = null;

function load(): DemoState {
  if (memoryState) return memoryState;
  if (typeof window === "undefined") return { ...DEFAULT_STATE };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    memoryState = raw ? { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<DemoState>) } : { ...DEFAULT_STATE };
  } catch {
    memoryState = { ...DEFAULT_STATE };
  }
  return memoryState;
}

function save(state: DemoState): void {
  memoryState = state;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable — in-memory state still applies for this session.
  }
}

export function getDemoState(): DemoState {
  return load();
}

export function updateDemoState(patch: Partial<DemoState>): DemoState {
  const next = { ...load(), ...patch };
  save(next);
  return next;
}

export function resetDemoState(): DemoState {
  save({ ...DEFAULT_STATE });
  return load();
}
