import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  AuthResponse,
  MeResponse,
  fetchHeartsReceived,
  fetchHeartsSent,
  fetchMatches,
  fetchMe,
  fetchMessages,
  fetchQuestions,
  fetchRecommended,
  fetchSearchHistory,
  login as apiLogin,
  profileFromMe,
  runSearch as apiSearch,
  sendHeart as apiSendHeart,
  sendLike as apiSendLike,
  sendMessage as apiSendMessage,
  signup as apiSignup,
  updateAnswers as apiUpdateAnswers,
  updateMe as apiUpdateMe,
  deleteMatch as apiDeleteMatch,
  deleteMessage as apiDeleteMessage
} from "@/services/api";
import { configureApiClient } from "@/services/apiClient";
import { clearStoredToken, getStoredToken, setStoredToken } from "@/services/tokenStorage";
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

type SearchResultEnvelope =
  | { ok: true; session: SearchSession }
  | { ok: false; nextAvailableAt: string };

export type SearchCriteria = {
  selectedValues: string[];
  gender: string | null;
  birthYearMin: number | null;
  birthYearMax: number | null;
  regions: string[];
};

type AppStateContextValue = {
  ready: boolean;
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  profile: UserProfile | null;
  answers: ValueAnswer[];
  flowerCount: number;
  lastLikeAt: string | null;
  lastSearchAt: string | null;
  questions: ValueQuestion[];
  recommendedCandidates: Candidate[];
  primaryRecommendation: Candidate | null;
  matches: Match[];
  messages: ChatMessage[];
  sentHearts: Heart[];
  receivedHearts: Heart[];
  searchHistory: SearchSession[];
  selectedSearchValues: string[];
  setSelectedSearchValues: (values: string[]) => void;
  viewingCandidate: Candidate | null;
  setViewingCandidate: (candidate: Candidate | null) => void;
  selectedSearchGender: string | null;
  setSelectedSearchGender: (gender: string | null) => void;
  selectedSearchBirthYearMin: number;
  setSelectedSearchBirthYearMin: (year: number) => void;
  selectedSearchBirthYearMax: number;
  setSelectedSearchBirthYearMax: (year: number) => void;
  selectedSearchRegions: string[];
  setSelectedSearchRegions: (regions: string[]) => void;
  hasCompletedProfile: boolean;
  searchNextAvailable: Date;
  likeNextAvailable: Date;

  signUp: (input: { email: string; password: string; nickname?: string }) => Promise<AuthResponse>;
  logIn: (input: { email: string; password: string }) => Promise<AuthResponse>;
  logOut: () => Promise<void>;

  saveProfile: (profile: UserProfile) => Promise<void>;
  saveAnswer: (answer: ValueAnswer) => void;
  replaceAnswers: (answers: ValueAnswer[]) => Promise<void>;

  likeCandidate: (candidate: Candidate) => Promise<LikeResult>;
  sendHeart: (candidate: Candidate) => Promise<void>;
  doSearch: (input: SearchCriteria) => Promise<SearchResultEnvelope>;
  spendFlowerForNewMatch: () => boolean;
  sendChatMessage: (matchId: string, body: string) => Promise<void>;
  loadMessagesForMatch: (matchId: string) => Promise<void>;
  blockMatch: (matchId: string) => Promise<void>;
  reportMessage: (messageId: string) => Promise<void>;

  refreshAll: () => Promise<void>;
};

const SEARCH_COOLDOWN_MS = 2 * 60 * 60 * 1000;
const LIKE_COOLDOWN_MS = 6 * 60 * 60 * 1000;
const MATCH_THRESHOLD = 70;

const extractCooldown = (err: unknown): string | null => {
  if (err === null || typeof err !== "object") return null;
  const obj = err as { status?: unknown; payload?: unknown };
  if (obj.status !== 429) return null;
  const payload = obj.payload;
  if (payload === null || typeof payload !== "object") return "";
  const nextAt = (payload as { nextAvailableAt?: unknown }).nextAvailableAt;
  return typeof nextAt === "string" ? nextAt : "";
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

const applyMe = (
  me: MeResponse,
  setters: {
    setProfile: (p: UserProfile) => void;
    setAnswers: (a: ValueAnswer[]) => void;
    setFlowerCount: (n: number) => void;
    setLastLikeAt: (s: string | null) => void;
    setLastSearchAt: (s: string | null) => void;
    setAuthUser: (u: AuthUser) => void;
  }
): void => {
  setters.setAuthUser({ id: me.id, email: me.email, nickname: me.nickname });
  setters.setProfile(profileFromMe(me));
  setters.setAnswers(me.answers);
  setters.setFlowerCount(me.flowerCount);
  setters.setLastLikeAt(me.lastLikeAt);
  setters.setLastSearchAt(me.lastSearchAt);
};

export const AppStateProvider = ({ children }: PropsWithChildren) => {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [answers, setAnswers] = useState<ValueAnswer[]>([]);
  const [flowerCount, setFlowerCount] = useState(3);
  const [lastLikeAt, setLastLikeAt] = useState<string | null>(null);
  const [lastSearchAt, setLastSearchAt] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ValueQuestion[]>([]);
  const [recommendedCandidates, setRecommendedCandidates] = useState<Candidate[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sentHearts, setSentHearts] = useState<Heart[]>([]);
  const [receivedHearts, setReceivedHearts] = useState<Heart[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchSession[]>([]);
  const [selectedSearchValues, setSelectedSearchValues] = useState<string[]>([]);
  const [viewingCandidate, setViewingCandidate] = useState<Candidate | null>(null);
  const [selectedSearchGender, setSelectedSearchGender] = useState<string | null>(null);
  const [selectedSearchBirthYearMin, setSelectedSearchBirthYearMin] = useState<number>(1960);
  const [selectedSearchBirthYearMax, setSelectedSearchBirthYearMax] = useState<number>(2010);
  const [selectedSearchRegions, setSelectedSearchRegions] = useState<string[]>([]);

  const meSetters = {
    setProfile,
    setAnswers,
    setFlowerCount,
    setLastLikeAt,
    setLastSearchAt,
    setAuthUser
  };

  useEffect(() => {
    configureApiClient({
      getToken: () => token,
      onUnauthorized: () => {
        clearStoredToken().catch(() => {});
        setToken(null);
        setAuthUser(null);
      }
    });
  }, [token]);

  const loadAuthedData = useCallback(async (): Promise<void> => {
    const [me, recs, ms, hsSent, hsRecv, hist] = await Promise.all([
      fetchMe(),
      fetchRecommended(20).catch(() => []),
      fetchMatches().catch(() => []),
      fetchHeartsSent().catch(() => []),
      fetchHeartsReceived().catch(() => []),
      fetchSearchHistory().catch(() => [])
    ]);
    applyMe(me, meSetters);
    setRecommendedCandidates(recs);
    setMatches(ms);
    setSentHearts(hsSent);
    setReceivedHearts(hsRecv);
    setSearchHistory(hist);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const stored = await getStoredToken();
        if (stored !== null) {
          setToken(stored);
        }
        const qs = await fetchQuestions().catch(() => []);
        setQuestions(qs);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (token === null) {
      setAuthUser(null);
      setProfile(null);
      setAnswers([]);
      setMatches([]);
      setMessages([]);
      setSentHearts([]);
      setReceivedHearts([]);
      setSearchHistory([]);
      setRecommendedCandidates([]);
      return;
    }
    void loadAuthedData().catch((err) => {
      console.warn("loadAuthedData failed", err);
    });
  }, [token, loadAuthedData]);

  const signUp = useCallback(
    async (input: { email: string; password: string; nickname?: string }): Promise<AuthResponse> => {
      const res = await apiSignup(input);
      await setStoredToken(res.token);
      setToken(res.token);
      setAuthUser(res.user);
      return res;
    },
    []
  );

  const logIn = useCallback(
    async (input: { email: string; password: string }): Promise<AuthResponse> => {
      const res = await apiLogin(input);
      await setStoredToken(res.token);
      setToken(res.token);
      setAuthUser(res.user);
      return res;
    },
    []
  );

  const logOut = useCallback(async (): Promise<void> => {
    await clearStoredToken();
    setToken(null);
  }, []);

  const saveProfile = useCallback(async (next: UserProfile): Promise<void> => {
    const payload: Parameters<typeof apiUpdateMe>[0] = {
      nickname: next.nickname,
      bio: next.bio,
      introOneLine: next.introOneLine,
      valueImportant: next.valueImportant,
      dreamRelationship: next.dreamRelationship,
      extraPhotoUrls: next.extraPhotoUrls
    };
    if (next.gender !== null) payload.gender = next.gender;
    if (next.ageRange.length > 0) payload.ageRange = next.ageRange;
    if (next.birthYear !== null) payload.birthYear = next.birthYear;
    if (next.region.length > 0) payload.region = next.region;
    if (next.photoUrl !== null) payload.photoUrl = next.photoUrl;
    const me = await apiUpdateMe(payload);
    applyMe(me, meSetters);
  }, []);

  const saveAnswer = useCallback((answer: ValueAnswer): void => {
    setAnswers((current) => {
      const filtered = current.filter((a) => a.questionId !== answer.questionId);
      return [...filtered, answer];
    });
  }, []);

  const replaceAnswers = useCallback(async (next: ValueAnswer[]): Promise<void> => {
    const me = await apiUpdateAnswers(next);
    applyMe(me, meSetters);
    fetchRecommended(20)
      .then(setRecommendedCandidates)
      .catch(() => {});
  }, []);

  const likeCandidate = useCallback(async (candidate: Candidate): Promise<LikeResult> => {
    try {
      const result = await apiSendLike(candidate.id);
      setLastLikeAt(new Date().toISOString());
      setRecommendedCandidates((prev) => prev.filter((c) => c.id !== candidate.id));
      if (result.status === "matched") {
        setMatches((prev) =>
          prev.some((m) => m.id === result.match.id) ? prev : [result.match, ...prev]
        );
      }
      return result;
    } catch (err) {
      const cooldown = extractCooldown(err);
      if (cooldown !== null) {
        return { status: "cooldown", nextAvailableAt: cooldown };
      }
      throw err;
    }
  }, []);

  const sendHeart = useCallback(async (candidate: Candidate): Promise<void> => {
    const heart = await apiSendHeart(candidate.id);
    setSentHearts((prev) => [heart, ...prev]);
  }, []);

  const doSearch = useCallback(async (input: SearchCriteria): Promise<SearchResultEnvelope> => {
    try {
      const result = await apiSearch(input);
      if ("status" in result && result.status === "cooldown") {
        return { ok: false, nextAvailableAt: result.nextAvailableAt };
      }
      const session = result as SearchSession;
      setSearchHistory((prev) => [session, ...prev]);
      setLastSearchAt(new Date().toISOString());
      return { ok: true, session };
    } catch (err) {
      const cooldown = extractCooldown(err);
      if (cooldown !== null) {
        return { ok: false, nextAvailableAt: cooldown };
      }
      throw err;
    }
  }, []);

  const spendFlowerForNewMatch = useCallback((): boolean => {
    if (flowerCount < 1 || matches.every((m) => !m.isActiveChat)) return false;
    setFlowerCount((c) => c - 1);
    return true;
  }, [flowerCount, matches]);

  const loadMessagesForMatch = useCallback(async (matchId: string): Promise<void> => {
    const msgs = await fetchMessages(matchId);
    setMessages((prev) => [...prev.filter((m) => m.matchId !== matchId), ...msgs]);
  }, []);

  const sendChatMessage = useCallback(async (matchId: string, body: string): Promise<void> => {
    const trimmed = body.trim();
    if (trimmed.length === 0) return;
    const msg = await apiSendMessage(matchId, trimmed);
    setMessages((prev) => [...prev, msg]);
  }, []);

  const blockMatch = useCallback(async (matchId: string): Promise<void> => {
    await apiDeleteMatch(matchId);
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
    setMessages((prev) => prev.filter((m) => m.matchId !== matchId));
  }, []);

  const reportMessage = useCallback(async (messageId: string): Promise<void> => {
    await apiDeleteMessage(messageId);
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  const refreshAll = useCallback(async (): Promise<void> => {
    if (token === null) return;
    await loadAuthedData();
  }, [token, loadAuthedData]);

  const searchNextAvailable = useMemo(() => {
    if (lastSearchAt === null) return new Date(0);
    return new Date(new Date(lastSearchAt).getTime() + SEARCH_COOLDOWN_MS);
  }, [lastSearchAt]);

  const likeNextAvailable = useMemo(() => {
    if (lastLikeAt === null) return new Date(0);
    return new Date(new Date(lastLikeAt).getTime() + LIKE_COOLDOWN_MS);
  }, [lastLikeAt]);

  const primaryRecommendation = recommendedCandidates[0] ?? null;

  const value: AppStateContextValue = {
    ready,
    authUser,
    isAuthenticated: authUser !== null,
    profile,
    answers,
    flowerCount,
    lastLikeAt,
    lastSearchAt,
    questions,
    recommendedCandidates,
    primaryRecommendation,
    matches,
    messages,
    sentHearts,
    receivedHearts,
    searchHistory,
    selectedSearchValues,
    setSelectedSearchValues,
    viewingCandidate,
    setViewingCandidate,
    selectedSearchGender,
    setSelectedSearchGender,
    selectedSearchBirthYearMin,
    setSelectedSearchBirthYearMin,
    selectedSearchBirthYearMax,
    setSelectedSearchBirthYearMax,
    selectedSearchRegions,
    setSelectedSearchRegions,
    hasCompletedProfile: profile !== null && answers.length > 0,
    searchNextAvailable,
    likeNextAvailable,
    signUp,
    logIn,
    logOut,
    saveProfile,
    saveAnswer,
    replaceAnswers,
    likeCandidate,
    sendHeart,
    doSearch,
    spendFlowerForNewMatch,
    sendChatMessage,
    loadMessagesForMatch,
    blockMatch,
    reportMessage,
    refreshAll
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppState = (): AppStateContextValue => {
  const context = useContext(AppStateContext);
  if (context === null) throw new Error("useAppState must be used inside AppStateProvider");
  return context;
};

export const useMatchThreshold = (): number => MATCH_THRESHOLD;
