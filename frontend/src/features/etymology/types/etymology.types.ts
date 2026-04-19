export type EtymologyEntry = {
  id: string;
  root: string;
  origin: string | null;
  meaning: string | null;
  exampleStructures: string[] | null;
  exampleUsage: string | null;
  collected: boolean;
  collectedAt: string | null;
};

export type EtymologyGardenDto = {
  totalRoots: number;
  collected: number;
  roots: EtymologyEntry[];
};

export type Origin = "all" | "Greek" | "Latin" | "Arabic" | "Eponym";
