import { get } from "@/shared/lib/api/http";

export type DiseaseDetail = {
  canonicalId: string;
  name: string;
  etymology: Array<{ part: string; meaning: string }>;
  commonness: string;
  category: string;
  aliases: Array<{ alias: string; aliasType: string }>;
  status: string;
};

export function getDisease(canonicalId: string): Promise<DiseaseDetail> {
  return get<DiseaseDetail>(`/api/diseases/${canonicalId}`);
}
