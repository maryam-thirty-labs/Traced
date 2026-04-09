export type CaseDetailDto = {
  caseId: string;
  title: string;
  subtitle: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  xpReward: number;
  linkedAnatomyId: string;
  vignette: {
    patientAge: number;
    patientSex: string;
    presentingComplaint: string;
    fullVignetteText: string;
  } | null;
  clues: Array<{
    clueType: string;
    label: string;
    value: string;
    isAbnormal: boolean;
    displayOrder: number;
  }>;
  questions: Array<{
    questionId: string;
    stepNumber: number;
    questionText: string;
    questionType: string;
    options: Array<{
      optionKey: string;
      optionText: string;
    }>;
  }>;
};
