import { get } from "@/shared/lib/api/http";

export type DiseaseDetail = {
  canonicalId: string;
  name: string;
  etymology: Array<{ part: string; meaning: string }>;
  commonness: string;
  category: string;
  overview: string | null;
  aliases: Array<{ alias: string; aliasType: string }>;
  status: string;
};

export type DiseaseSymptom = {
  symptomName: string;
  description: string;
  severity: "CARDINAL" | "COMMON" | "VARIABLE";
  emoji: string;
};

export function getDisease(canonicalId: string): Promise<DiseaseDetail> {
  return get<DiseaseDetail>(`/api/diseases/${canonicalId}`);
}

export function getDiseaseSymptoms(canonicalId: string): Promise<DiseaseSymptom[]> {
  return get<DiseaseSymptom[]>(`/api/diseases/${canonicalId}/symptoms`);
}
