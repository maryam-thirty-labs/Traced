import { get } from "@/shared/lib/api/http";
import type { CaseDetailDto } from "../types/case.types";

export async function getCaseDetail(caseId: string): Promise<CaseDetailDto> {
  return get<CaseDetailDto>(`/api/cases/${caseId}`);
}
