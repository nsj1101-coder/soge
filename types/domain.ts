export type Gender = "여성" | "남성" | "선택 안 함";

export type UserProfile = {
  nickname: string;
  gender: Gender;
  ageRange: string;
  region: string;
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
