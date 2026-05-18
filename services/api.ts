import { candidates } from "@/data/candidates";
import { calculateMatchRate } from "@/services/matching";
import { Candidate, ChatMessage, LikeResult, Match, UserProfile, ValueAnswer } from "@/types/domain";

const LIKE_COOLDOWN_MS = 6 * 60 * 60 * 1000;

export type SessionSnapshot = {
  profile: UserProfile | null;
  answers: ValueAnswer[];
  flowerCount: number;
  lastLikeAt: string | null;
  likedCandidateIds: string[];
  matches: Match[];
  messages: ChatMessage[];
};

export const createInitialSession = (): SessionSnapshot => ({
  profile: null,
  answers: [],
  flowerCount: 3,
  lastLikeAt: null,
  likedCandidateIds: [],
  matches: [],
  messages: []
});

export const getRecommendedCandidates = (
  answers: ValueAnswer[],
  likedCandidateIds: string[]
): Candidate[] => {
  const likedSet = new Set(likedCandidateIds);

  return candidates
    .filter((candidate) => !likedSet.has(candidate.id))
    .sort((first, second) => {
      const firstRate = calculateMatchRate(answers, first.values);
      const secondRate = calculateMatchRate(answers, second.values);

      return secondRate - firstRate;
    });
};

export const sendLike = (
  session: SessionSnapshot,
  candidate: Candidate,
  now: Date = new Date()
): LikeResult => {
  const nextAvailableAt =
    session.lastLikeAt === null
      ? now
      : new Date(new Date(session.lastLikeAt).getTime() + LIKE_COOLDOWN_MS);

  if (nextAvailableAt.getTime() > now.getTime()) {
    return { status: "cooldown", nextAvailableAt: nextAvailableAt.toISOString() };
  }

  const nextLikeAt = new Date(now.getTime() + LIKE_COOLDOWN_MS).toISOString();
  const matchRate = calculateMatchRate(session.answers, candidate.values);
  const shouldCreateMatch = matchRate >= 70;

  if (!shouldCreateMatch) {
    return { status: "liked", candidate, nextAvailableAt: nextLikeAt };
  }

  const match: Match = {
    id: `match-${candidate.id}`,
    candidate,
    matchRate,
    createdAt: now.toISOString(),
    isActiveChat: true
  };

  return { status: "matched", match, nextAvailableAt: nextLikeAt };
};

export const createWelcomeMessages = (matchId: string): ChatMessage[] => [
  {
    id: `${matchId}-1`,
    matchId,
    sender: "other",
    body: "안녕하세요! 좋은 아침이에요. 오늘 날씨가 정말 좋네요.",
    sentAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: `${matchId}-2`,
    matchId,
    sender: "me",
    body: "안녕하세요! 맞아요. 기분 좋은 하루 보내고 계신가요?",
    sentAt: new Date(Date.now() - 6 * 60 * 1000).toISOString()
  }
];
