export type CandidateRow = {
  id: number;
  category: "primary" | "secondary";
  nameEn: string;
  nameZh: string;
  sortOrder: number;
  active: boolean;
};

export type ElectionSettingsRow = {
  id: number;
  isOpen: boolean;
  titleEn: string;
  titleZh: string;
  updatedAt: string;
};

export type BallotRow = {
  id: number;
  primaryChoices: string;
  secondaryChoices: string;
  submittedAt: string;
};
