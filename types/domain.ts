export type Gender = "여성" | "남성";

export type UserProfile = {
  nickname: string;
  gender: Gender | null;
  ageRange: string;
  birthYear: number | null;
  region: string;
  bio: string;
  introOneLine: string;
  valueImportant: string;
  dreamRelationship: string;
  photoUrl: string | null;
  pendingPhotoUrl: string | null;
  photoRejectedAt: string | null;
  extraPhotoUrls: string[];
};

export type AuthUser = {
  id: string;
  email: string;
  nickname: string;
};

export type ValueQuestion = {
  id: string;
  title: string;
  subtitle: string;
  options: string[];
  weight: number;
};

export type ValueAnswer = {
  questionId: string;
  option: string;
};

export type Candidate = {
  id: string;
  initial: string;
  ageRange: string;
  region: string;
  job: string;
  tags: string[];
  values: ValueAnswer[];
  summary: string[];
  introOneLine: string | null;
  valueImportant: string | null;
  dreamRelationship: string | null;
  photoUrl: string | null;
  matchRate?: number;
};

export type Match = {
  id: string;
  candidate: Candidate;
  matchRate: number;
  createdAt: string;
  isActiveChat: boolean;
};

export type ChatMessage = {
  id: string;
  matchId: string;
  sender: "me" | "other";
  body: string;
  sentAt: string;
};

export type LikeResult =
  | { status: "cooldown"; nextAvailableAt: string }
  | { status: "liked"; candidate: Candidate; nextAvailableAt: string }
  | { status: "matched"; match: Match; nextAvailableAt: string };

export type Heart = {
  id: string;
  candidate: Candidate;
  sentAt: string;
};

export type SearchSession = {
  id: string;
  selectedValues: string[];
  results: Candidate[];
  searchedAt: string;
  opened: boolean;
};

export type FlowerPack = {
  id: string;
  amount: number;
  priceLabel: string;
  badge?: string;
};
