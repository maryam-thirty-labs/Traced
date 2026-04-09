import { get, post } from "@/shared/lib/api/http";
import type { CaseDetailDto } from "../types/case.types";

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
