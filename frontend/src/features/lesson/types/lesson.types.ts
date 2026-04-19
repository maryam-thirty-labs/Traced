export type AnswerOption = {
  text: string;
  correct: boolean;
};

export type RetrievalItem = {
  structureId: string;
  canonicalId: string;
  displayName: string;
  options: AnswerOption[];
  displayOrder: number;
};

export type ExploreItem = {
  structureId: string;
  canonicalId: string;
  displayName: string;
  system: string;
  etymologyRootId: string | null;
  etymologyPreviewRoot: string | null;
};

export type LessonDto = {
  lessonId: string | null;
  lessonDate: string;
  completed: boolean;
  retrieval: RetrievalItem[];
  explore: ExploreItem | null;
  expectedXp: number;
};

export type LessonCompletionDto = {
  xpAwarded: number;
  newXp: number;
  streakDays: number;
  etymologyRootId: string | null;
  onboardingCompleted: boolean;
};

export type RetrievalAnswer = {
  structureId: string;
  correct: boolean;
};
