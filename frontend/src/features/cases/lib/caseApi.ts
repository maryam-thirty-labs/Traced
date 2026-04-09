import { get, post } from "@/shared/lib/api/http";
import type { CaseDetailDto } from "../types/case.types";
import type { CaseBrowsePage } from "../types/caseBrowse.types";

export async function getCaseDetail(caseId: string): Promise<CaseDetailDto> {
  return get<CaseDetailDto>(`/api/cases/${caseId}`);
}

export type SubmissionResult = {
  outcome: string;
  score: number;
  xpAwarded: number;
  currentLevel: number;
  totalXp: number;
  correctCount: number;
  totalQuestions: number;
};

export async function listCases(page = 0): Promise<CaseBrowsePage> {
  return get<CaseBrowsePage>(`/api/cases?page=${page}&size=20`);
}

export async function submitCase(
  caseId: string,
  answers: Array<{ questionId: string; selectedOptionKey: string }>,
  userProfileId: string,
): Promise<SubmissionResult> {
  return post<SubmissionResult>(`/api/cases/${caseId}/submit`, {
    userProfileId,
    answers,
  });
}
