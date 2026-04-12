import { get } from "@/shared/lib/api/http";
import type { Speciality, SpecialityDetail } from "../types/speciality.types";

export async function listSpecialities(): Promise<Speciality[]> {
  return get<Speciality[]>("/api/specialities");
}

export async function getSpeciality(canonicalId: string): Promise<SpecialityDetail> {
  return get<SpecialityDetail>(`/api/specialities/${canonicalId}`);
}
