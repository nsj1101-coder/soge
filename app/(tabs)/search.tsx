import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BrandHeader } from "@/components/BrandHeader";
import { notify } from "@/services/confirm";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { ProfileCompleteness } from "@/components/ProfileCompleteness";
import { ProfileOrb } from "@/components/ProfileOrb";
import { Screen } from "@/components/Screen";
import { colors } from "@/constants/colors";
import { formatRemainingTime } from "@/services/matching";
import { useAppState } from "@/state/AppStateProvider";
import { Candidate, SearchSession } from "@/types/domain";

const MIN_VALUES = 0;

function CriteriaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.criteriaRow}>
      <Text style={styles.criteriaLabel}>{label}</Text>
      <Text style={styles.criteriaValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

export default function SearchScreen() {
  const {
    searchNextAvailable,
    likeNextAvailable,
    doSearch,
    sendHeart,
    likeCandidate,
    profile,
    answers,
    selectedSearchValues,
    setSelectedSearchValues,
    selectedSearchGender,
    selectedSearchBirthYearMin,
    selectedSearchBirthYearMax,
    selectedSearchRegions,
    setViewingCandidate
  } = useAppState();
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);

  // result state
  const [mode, setMode] = useState<"select" | "result">("select");
  const [resultSession, setResultSession] = useState<SearchSession | null>(null);

  const [searchRemaining, setSearchRemaining] = useState("");
  const [likeRemaining, setLikeRemaining] = useState("");
  const [isLikeReady, setIsLikeReady] = useState(false);
  const isSearchReady = searchNextAvailable.getTime() <= Date.now();
  const selectedCount = selectedSearchValues.length;

  const hasAnswers = answers.length > 0;
  const hasIntro =
    (profile?.introOneLine ?? "").trim().length >= 20 &&
    (profile?.valueImportant ?? "").trim().length >= 20 &&
    (profile?.dreamRelationship ?? "").trim().length >= 20;
  const hasPhoto =
    profile?.photoUrl !== null && profile?.photoUrl !== undefined && profile.photoUrl.length > 0;
  const isProfileComplete = hasAnswers && hasIntro && hasPhoto;

  const canSearch = selectedCount >= MIN_VALUES && isSearchReady && isProfileComplete;

  useEffect(() => {
    const update = () => {
      setSearchRemaining(
        searchNextAvailable.getTime() <= Date.now()
          ? "서치 가능"
          : formatRemainingTime(searchNextAvailable.toISOString())
      );
      const lReady = likeNextAvailable.getTime() <= Date.now();
      setIsLikeReady(lReady);
      setLikeRemaining(lReady ? "좋아요 가능" : formatRemainingTime(likeNextAvailable.toISOString()));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [searchNextAvailable, likeNextAvailable]);

  const handleSearch = async () => {
    if (searching) return;
    setSearching(true);
    try {
      const result = await doSearch({
        selectedValues: selectedSearchValues,
        gender: selectedSearchGender,
        birthYearMin: selectedSearchBirthYearMin,
        birthYearMax: selectedSearchBirthYearMax,
        regions: selectedSearchRegions
      });
      if (!result.ok) {
        notify("서치 대기 중", `${formatRemainingTime(result.nextAvailableAt)} 후에 다시 서치할 수 있어요.`);
        return;
      }
      setResultSession(result.session);
      setMode("result");
    } catch (err) {
      notify("오류", err instanceof Error ? err.message : "다시 시도해주세요");
    } finally {
      setSearching(false);
    }
  };

  const removeValue = (v: string) => {
    setSelectedSearchValues(selectedSearchValues.filter((x) => x !== v));
  };

  const handleSendFlower = async (candidate: Candidate) => {
    if (sending) return;
    setSending(true);
    try {
      const result = await likeCandidate(candidate);
      if (result.status === "cooldown") {
        notify("잠깐!", "6시간마다 한 번 꽃을 보낼 수 있어요.\n꽃송이를 사용하면 바로 보낼 수 있어요.");
        return;
      }
      await sendHeart(candidate).catch(() => {});
      if (result.status === "matched") {
        router.push({ pathname: "/match-success", params: { matchId: result.match.id } });
        return;
      }
      notify("꽃을 보냈어요!", "상대도 꽃을 보내면 채팅이 열립니다.");
    } catch (err) {
      notify("오류", err instanceof Error ? err.message : "다시 시도해주세요");
    } finally {
      setSending(false);
    }
  };

  const resetToSelect = () => {
    setMode("select");
    setResultSession(null);
  };

  return (
    <Screen scroll={false} style={styles.screen}>
      <BrandHeader />

      {mode === "select" && !isProfileComplete && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.incompleteContent}>
          <ProfileCompleteness hasAnswers={hasAnswers} hasIntro={hasIntro} hasPhoto={hasPhoto} />
        </ScrollView>
      )}

      {mode === "select" && isProfileComplete && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.selectContent}>
          <View style={styles.topRow}>
            <View style={styles.cooldownGroup}>
              <View style={[styles.cooldownPill, isSearchReady && styles.cooldownPillReady]}>
                <Ionicons name="search" size={12} color={isSearchReady ? colors.success : colors.blushDark} />
                <Text style={[styles.cooldownText, isSearchReady && styles.cooldownReady]}>{searchRemaining}</Text>
              </View>
              <View style={[styles.cooldownPill, isLikeReady && styles.cooldownPillReady]}>
                <Ionicons name="flower" size={12} color={isLikeReady ? colors.success : colors.blushDark} />
                <Text style={[styles.cooldownText, isLikeReady && styles.cooldownReady]}>{likeRemaining}</Text>
              </View>
            </View>
            <Text style={styles.countText}>{selectedCount}/5 선택</Text>
          </View>

          <Text style={styles.sectionTitle}>서치 기준</Text>
          <Text style={styles.sectionSub}>성별 · 나이대 · 지역 · 가치관을 설정하면 매칭에 반영돼요.</Text>

          <Pressable onPress={() => router.push("/search-criteria")} style={styles.valuesPickerBtn}>
            <Ionicons name="options-outline" size={18} color={colors.ink} />
            <Text style={styles.valuesPickerText}>서치 기준 설정</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          <View style={styles.criteriaSummary}>
            <CriteriaRow label="성별" value={selectedSearchGender ?? "무관"} />
            <CriteriaRow
              label="나이대"
              value={`${selectedSearchBirthYearMin}~${selectedSearchBirthYearMax}년생`}
            />
            <CriteriaRow
              label="지역"
              value={selectedSearchRegions.length === 0 ? "무관" : selectedSearchRegions.join(", ")}
            />
            <CriteriaRow
              label="가치관"
              value={selectedCount === 0 ? "선택 안 함" : `${selectedCount}개 선택`}
            />
          </View>

          {selectedCount > 0 && (
            <View style={styles.chipsWrap}>
              {selectedSearchValues.map((v) => (
                <Pressable key={v} onPress={() => removeValue(v)} style={styles.chip}>
                  <Text style={styles.chipText} numberOfLines={1}>{v}</Text>
                  <Ionicons name="close" size={13} color={colors.blushDark} />
                </Pressable>
              ))}
            </View>
          )}

          <AppButton
            label={searching ? "서치 중…" : "서치 시작"}
            onPress={handleSearch}
            disabled={!canSearch || searching}
            style={styles.searchBtn}
          />
        </ScrollView>
      )}

      {mode === "result" && resultSession !== null && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultContent}>
          <Text style={styles.resultTitle}>새로운 인연 {resultSession.results.length}명</Text>

          {resultSession.results.map((c) => (
            <Card key={c.id} style={styles.resultCard}>
              <Pressable
                onPress={() => {
                  setViewingCandidate(c);
                  router.push(`/candidate/${c.id}` as never);
                }}
                style={styles.resultRow}
              >
                {c.photoUrl !== null ? (
                  <Image source={{ uri: c.photoUrl }} style={styles.resultPhoto} />
                ) : (
                  <View style={styles.resultPhotoFallback}>
                    <ProfileOrb initial={c.initial} size={64} />
                  </View>
                )}
                <View style={styles.resultInfo}>
                  <Text style={styles.resultNick}>{c.nickname}</Text>
                  <Text style={styles.resultMeta}>{c.ageRange}{c.region ? ` · ${c.region}` : ""}</Text>
                  {c.tags.length > 0 && (
                    <View style={styles.resultTags}>
                      {c.tags.slice(0, 3).map((t) => (
                        <Text key={t} style={styles.resultTag}>#{t}</Text>
                      ))}
                    </View>
                  )}
                </View>
                <View style={styles.resultRate}>
                  <Text style={styles.resultRateNum}>{c.matchRate ?? 0}</Text>
                  <Text style={styles.resultRateSuffix}>%</Text>
                </View>
              </Pressable>
              <View style={styles.resultActions}>
                <AppButton
                  label={sending ? "보내는 중…" : "꽃 보내기"}
                  onPress={() => handleSendFlower(c)}
                  disabled={sending}
                  style={styles.flowerBtn}
                />
              </View>
            </Card>
          ))}

          <Pressable onPress={resetToSelect} style={styles.newSearchBtn}>
            <Ionicons name="refresh" size={14} color={colors.muted} />
            <Text style={styles.newSearchText}>새로운 서치하기 (현재 카드들이 사라져요)</Text>
          </Pressable>
        </ScrollView>
      )}

    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0, paddingVertical: 0 },

  selectContent: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 32 },
  incompleteContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingBottom: 32
  },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  cooldownGroup: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 },
  cooldownPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.surfaceWarm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.blushLight,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  cooldownPillReady: { backgroundColor: "#EBF6F0", borderColor: "#B8DFD0" },
  cooldownText: { color: colors.blushDark, fontSize: 12, fontWeight: "700" },
  cooldownReady: { color: colors.success },
  countText: { color: colors.muted, fontSize: 13, fontWeight: "700" },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: "800", marginBottom: 4 },
  sectionSub: { color: colors.muted, fontSize: 13, marginBottom: 18 },

  valuesPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    marginBottom: 14
  },
  valuesPickerText: { flex: 1, color: colors.ink, fontSize: 15, fontWeight: "700" },
  valuesPickerCount: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: colors.blushLight
  },
  valuesPickerCountText: { color: colors.blushDark, fontSize: 12, fontWeight: "800" },

  criteriaSummary: {
    marginTop: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.surface
  },
  criteriaRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    gap: 12
  },
  criteriaLabel: { color: colors.muted, fontSize: 12, fontWeight: "700", width: 56 },
  criteriaValue: { flex: 1, color: colors.ink, fontSize: 13, fontWeight: "600" },

  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.blushLight,
    maxWidth: "100%"
  },
  chipText: { color: colors.blushDark, fontSize: 12, fontWeight: "700", flexShrink: 1 },

  searchBtn: {},

  resultContent: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 32, gap: 12 },
  resultTitle: { color: colors.ink, fontSize: 17, fontWeight: "800", marginBottom: 4 },
  resultCard: { padding: 14, gap: 12 },
  resultRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  resultPhoto: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.surfaceWarm
  },
  resultPhotoFallback: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.surfaceWarm,
    alignItems: "center", justifyContent: "center", overflow: "hidden"
  },
  resultInfo: { flex: 1, gap: 4 },
  resultNick: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  resultMeta: { color: colors.muted, fontSize: 12 },
  resultTags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 },
  resultTag: { color: colors.blushDark, fontSize: 11, fontWeight: "700" },
  resultRate: { alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  resultRateNum: { color: colors.blush, fontSize: 22, fontWeight: "800" },
  resultRateSuffix: { color: colors.blush, fontSize: 10, fontWeight: "700", marginTop: -2 },
  resultActions: { gap: 8 },
  newSearchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    marginTop: 8
  },
  newSearchText: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  flowerBtn: {}
});
