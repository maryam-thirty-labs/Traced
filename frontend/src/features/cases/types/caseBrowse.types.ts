export type CaseBrowseItem = {
  caseId: string;
  title: string;
  subtitle: string;
  difficulty: string;
  xpReward: number;
};

export type CaseBrowsePage = {
  content: CaseBrowseItem[];
  totalElements: number;
  totalPages: number;
  number: number;
};
