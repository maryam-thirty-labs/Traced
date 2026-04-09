import { get } from "@/shared/lib/api/http";
import type { AnatomyPartDto } from "../types/anatomy.types";

type AnatomyPartResponse = {
  canonicalId: string;
  displayName: string;
  system: string;
  region: string;
  overview: string;
  status: string;
};

type DiseaseSummaryResponse = {
  canonicalId: string;
  name: string;
  etymology: Array<{ part: string; meaning: string }>;
  commonness: string;
  category: string;
};

type MechanismResponse = {
  canonicalId: string;
  name: string;
  description: string;
};

type CaseResponse = {
  caseId: string;
  title: string;
  subtitle: string;
  difficulty: string;
  xpReward: number;
};

export async function getAnatomyPart(
  canonicalId: string,
): Promise<AnatomyPartDto> {
  const [part, diseases, mechanisms, cases] = await Promise.all([
    get<AnatomyPartResponse>(`/api/anatomy/parts/${canonicalId}`),
    get<DiseaseSummaryResponse[]>(`/api/anatomy/parts/${canonicalId}/diseases`),
    get<MechanismResponse[]>(`/api/anatomy/parts/${canonicalId}/mechanisms`),
    get<CaseResponse[]>(`/api/anatomy/parts/${canonicalId}/cases`),
  ]);

  return {
    canonicalId: part.canonicalId,
    displayName: part.displayName,
    system: part.system as AnatomyPartDto["system"],
    region: part.region,
    overview: part.overview,
    diseases: diseases.map((d) => ({
      canonicalId: d.canonicalId,
      name: d.name,
      etymology: d.etymology,
      plainEnglish: "",
      commonness: d.commonness as "VERY_COMMON" | "COMMON" | "LESS_COMMON" | "RARE",
      mechanismNames: [],
    })),
    mechanisms: mechanisms.map((m) => ({
      canonicalId: m.canonicalId,
      name: m.name,
    })),
    aliases: [],
    cases: cases.map((c) => ({
      caseId: c.caseId,
      title: c.title,
      subtitle: c.subtitle,
      difficulty: c.difficulty as "easy" | "medium" | "hard",
      xpReward: c.xpReward,
    })),
  };
}

export async function getAnatomyDiseases(
  canonicalId: string,
): Promise<AnatomyPartDto["diseases"]> {
  const diseases = await get<DiseaseSummaryResponse[]>(
    `/api/anatomy/parts/${canonicalId}/diseases`,
  );
  return diseases.map((d) => ({
    canonicalId: d.canonicalId,
    name: d.name,
    etymology: d.etymology,
    plainEnglish: "",
    commonness: d.commonness as "VERY_COMMON" | "COMMON" | "LESS_COMMON" | "RARE",
    mechanismNames: [],
  }));
}
