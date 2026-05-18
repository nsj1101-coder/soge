import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";
import { createInitialSession, createWelcomeMessages, getRecommendedCandidates, sendLike, SessionSnapshot } from "@/services/api";
import { Candidate, ChatMessage, LikeResult, Match, UserProfile, ValueAnswer } from "@/types/domain";

type AppStateContextValue = SessionSnapshot & {
  hasCompletedProfile: boolean;
  recommendedCandidates: Candidate[];
  primaryRecommendation: Candidate | null;
  saveProfile: (profile: UserProfile) => void;
  saveAnswer: (answer: ValueAnswer) => void;
  replaceAnswers: (answers: ValueAnswer[]) => void;
  likeCandidate: (candidate: Candidate) => LikeResult;
  spendFlowerForNewMatch: () => boolean;
  sendChatMessage: (matchId: string, body: string) => void;
  blockMatch: (matchId: string) => void;
  reportMessage: (messageId: string) => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export const AppStateProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<SessionSnapshot>(createInitialSession);
  const recommendedCandidates = useMemo(
    () => getRecommendedCandidates(session.answers, session.likedCandidateIds),
    [session.answers, session.likedCandidateIds]
  );

  const saveProfile = (profile: UserProfile): void => {
    setSession((current) => ({ ...current, profile }));
  };

  const saveAnswer = (answer: ValueAnswer): void => {
    setSession((current) => {
      const answers = current.answers.filter((item) => item.questionId !== answer.questionId);

      return { ...current, answers: [...answers, answer] };
    });
  };

  const replaceAnswers = (answers: ValueAnswer[]): void => {
    setSession((current) => ({ ...current, answers }));
  };

  const likeCandidate = (candidate: Candidate): LikeResult => {
    const result = sendLike(session, candidate);

    if (result.status === "cooldown") {
      return result;
    }

    setSession((current) => {
      const likedCandidateIds = Array.from(new Set([...current.likedCandidateIds, candidate.id]));
      const lastLikeAt = new Date().toISOString();

      if (result.status === "matched") {
        const existingMatch = current.matches.some((match) => match.id === result.match.id);
        const matches = existingMatch ? current.matches : [result.match, ...current.matches];
        const messages = existingMatch
          ? current.messages
          : [...createWelcomeMessages(result.match.id), ...current.messages];

        return { ...current, likedCandidateIds, lastLikeAt, matches, messages };
      }

      return { ...current, likedCandidateIds, lastLikeAt };
    });

    return result;
  };

  const spendFlowerForNewMatch = (): boolean => {
    if (session.flowerCount < 1 || session.matches.every((match) => !match.isActiveChat)) {
      return false;
    }

    setSession((current) => ({ ...current, flowerCount: current.flowerCount - 1 }));
    return true;
  };

  const sendChatMessage = (matchId: string, body: string): void => {
    const trimmedBody = body.trim();

    if (trimmedBody.length === 0) {
      return;
    }

    const message: ChatMessage = {
      id: `${matchId}-${Date.now()}`,
      matchId,
      sender: "me",
      body: trimmedBody,
      sentAt: new Date().toISOString()
    };

    setSession((current) => ({ ...current, messages: [...current.messages, message] }));
  };

  const blockMatch = (matchId: string): void => {
    setSession((current) => ({
      ...current,
      matches: current.matches.filter((match) => match.id !== matchId),
      messages: current.messages.filter((message) => message.matchId !== matchId)
    }));
  };

  const reportMessage = (messageId: string): void => {
    setSession((current) => ({
      ...current,
      messages: current.messages.filter((message) => message.id !== messageId)
    }));
  };

  const value: AppStateContextValue = {
    ...session,
    hasCompletedProfile: session.profile !== null && session.answers.length > 0,
    recommendedCandidates,
    primaryRecommendation: recommendedCandidates[0] ?? null,
    saveProfile,
    saveAnswer,
    replaceAnswers,
    likeCandidate,
    spendFlowerForNewMatch,
    sendChatMessage,
    blockMatch,
    reportMessage
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppState = (): AppStateContextValue => {
  const context = useContext(AppStateContext);

  if (context === null) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }

  return context;
};
