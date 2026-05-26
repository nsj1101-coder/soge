import { request } from "./apiClient";
import { API_BASE_URL } from "./config";
import { getStoredToken } from "./tokenStorage";
import {
  AuthUser,
  Candidate,
  ChatMessage,
  Heart,
  LikeResult,
  Match,
  SearchSession,
  UserProfile,
  ValueAnswer,
  ValueQuestion
} from "@/types/domain";

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type MeResponse = {
  id: string;
  email: string;
  nickname: string;
  gender: string | null;
  ageRange: string | null;
  birthYear: number | null;
  region: string | null;
  bio: string | null;
  introOneLine: string | null;
  valueImportant: string | null;
  dreamRelationship: string | null;
  initial: string | null;
  job: string | null;
  photoUrl: string | null;
  pendingPhotoUrl: string | null;
  photoRejectedAt: string | null;
  extraPhotoUrls: string[];
  tags: string[];
  summary: string[];
  flowerCount: number;
  lastLikeAt: string | null;
  lastSearchAt: string | null;
  answers: ValueAnswer[];
};

export const signup = async (input: {
  email: string;
  password: string;
  nickname?: string;
}): Promise<AuthResponse> => {
  const body: { email: string; password: string; nickname?: string } = {
    email: input.email,
    password: input.password
  };
  if (input.nickname !== undefined && input.nickname.length > 0) {
    body.nickname = input.nickname;
  }
  return request<AuthResponse>("/auth/signup", { method: "POST", body, auth: false });
};

export const login = async (input: { email: string; password: string }): Promise<AuthResponse> =>
  request<AuthResponse>("/auth/login", { method: "POST", body: input, auth: false });

export const sendVerificationCode = async (email: string): Promise<{ ok: boolean; expiresAt: string }> =>
  request("/auth/send-code", { method: "POST", body: { email }, auth: false });

export const verifyEmailCode = async (email: string, code: string): Promise<{ ok: boolean }> =>
  request("/auth/verify-code", { method: "POST", body: { email, code }, auth: false });

export const fetchMe = async (): Promise<MeResponse> => request<MeResponse>("/users/me");

export const updateMe = async (input: Partial<{
  nickname: string;
  gender: string;
  ageRange: string;
  birthYear: number;
  region: string;
  bio: string;
  introOneLine: string;
  valueImportant: string;
  dreamRelationship: string;
  job: string;
  photoUrl: string;
  extraPhotoUrls: string[];
  tags: string[];
  summary: string[];
}>): Promise<MeResponse> => request<MeResponse>("/users/me", { method: "PUT", body: input });

export const uploadPhoto = async (asset: {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  file?: File | null;
}): Promise<{ url: string }> => {
  const token = await getStoredToken();
  const form = new FormData();
  const name = asset.fileName ?? "photo.jpg";
  const type = asset.mimeType ?? "image/jpeg";
  if (asset.file) {
    form.append("photo", asset.file, name);
  } else {
    form.append("photo", { uri: asset.uri, name, type } as unknown as Blob);
  }
  const response = await fetch(`${API_BASE_URL}/uploads-api/photo`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`upload_failed_${response.status}: ${text}`);
  }
  return response.json();
};

export const updateAnswers = async (answers: ValueAnswer[]): Promise<MeResponse> =>
  request<MeResponse>("/users/me/answers", { method: "PUT", body: { answers } });

export const fetchQuestions = async (): Promise<ValueQuestion[]> =>
  request<ValueQuestion[]>("/questions", { auth: false });

export const fetchRecommended = async (limit = 20): Promise<Candidate[]> =>
  request<Candidate[]>(`/candidates/recommended?limit=${limit}`);

export const sendLike = async (candidateId: string): Promise<LikeResult> =>
  request<LikeResult>("/likes", { method: "POST", body: { candidateId } });

export const fetchMatches = async (): Promise<Match[]> => request<Match[]>("/matches");

export const deleteMatch = async (matchId: string): Promise<void> =>
  request<void>(`/matches/${matchId}`, { method: "DELETE" });

export const fetchMessages = async (matchId: string): Promise<ChatMessage[]> =>
  request<ChatMessage[]>(`/matches/${matchId}/messages`);

export const sendMessage = async (matchId: string, body: string): Promise<ChatMessage> =>
  request<ChatMessage>(`/matches/${matchId}/messages`, { method: "POST", body: { body } });

export const deleteMessage = async (messageId: string): Promise<void> =>
  request<void>(`/matches/messages/${messageId}`, { method: "DELETE" });

export const sendHeart = async (candidateId: string): Promise<Heart> =>
  request<Heart>("/hearts", { method: "POST", body: { candidateId } });

export const fetchHeartsSent = async (): Promise<Heart[]> => request<Heart[]>("/hearts/sent");

export const fetchHeartsReceived = async (): Promise<Heart[]> =>
  request<Heart[]>("/hearts/received");

export type SearchResponse = SearchSession | { status: "cooldown"; nextAvailableAt: string };

export type SearchInput = {
  selectedValues: string[];
  gender: string | null;
  ageRanges: string[];
  regions: string[];
};

export const runSearch = async (input: SearchInput): Promise<SearchResponse> =>
  request<SearchResponse>("/search", { method: "POST", body: input });

export const fetchSearchHistory = async (): Promise<SearchSession[]> =>
  request<SearchSession[]>("/search/history");

export const profileFromMe = (me: MeResponse): UserProfile => ({
  nickname: me.nickname,
  gender: me.gender === "여성" || me.gender === "남성" ? me.gender : null,
  ageRange: me.ageRange ?? "",
  birthYear: me.birthYear,
  region: me.region ?? "",
  bio: me.bio ?? "",
  introOneLine: me.introOneLine ?? "",
  valueImportant: me.valueImportant ?? "",
  dreamRelationship: me.dreamRelationship ?? "",
  photoUrl: me.photoUrl,
  pendingPhotoUrl: me.pendingPhotoUrl,
  photoRejectedAt: me.photoRejectedAt,
  extraPhotoUrls: me.extraPhotoUrls ?? []
});
