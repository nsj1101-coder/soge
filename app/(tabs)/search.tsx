import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BrandHeader } from "@/components/BrandHeader";
import { notify } from "@/services/confirm";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { MatchRate } from "@/components/MatchRate";
import { ProfileCompleteness } from "@/components/ProfileCompleteness";
import { ProfileOrb } from "@/components/ProfileOrb";
import { Screen } from "@/components/Screen";
import { colors, shadow } from "@/constants/colors";
import { formatRemainingTime } from "@/services/matching";
import { useAppState } from "@/state/AppStateProvider";
import { Candidate, SearchSession } from "@/types/domain";

type CardMode = "front" | "detail";

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
    setSelectedSearchGender,
    selectedSearchAgeRanges,
    setSelectedSearchAgeRanges,
    selectedSearchRegions,
    setSelectedSearchRegions
  } = useAppState();
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);

  // result state
  const [mode, setMode] = useState<"select" | "result">("select");
  const [resultSession, setResultSession] = useState<SearchSession | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [cardMode, setCardMode] = useState<CardMode>("front");

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
        ageRanges: selectedSearchAgeRanges,
        regions: selectedSearchRegions
      });
      if (!result.ok) {
        notify("서치 대기 중", `${formatRemainingTime(result.nextAvailableAt)} 후에 다시 서치할 수 있어요.`);
        return;
      }
      setResultSession(result.session);
      setCardIndex(0);
      setCardMode("front");
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

  const currentCandidate = resultSession?.results[cardIndex] ?? null;
  const currentMatchRate = currentCandidate?.matchRate ?? 0;

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
              value={selectedSearchAgeRanges.length === 0 ? "무관" : selectedSearchAgeRanges.join(", ")}
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

      {mode === "result" && resultSession !== null && currentCandidate !== null && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultContent}>
          <View style={styles.cardTabs}>
            {resultSession.results.map((c, idx) => (
              <Pressable
                key={c.id}
                onPress={() => { setCardIndex(idx); setCardMode("front"); }}
                style={[styles.cardTabItem, cardIndex === idx && styles.cardTabActive]}
              >
                <ProfileOrb initial={c.initial} size={32} />
                <Text style={[styles.cardTabLabel, cardIndex === idx && styles.cardTabLabelActive]}>
                  {c.ageRange.split("~")[0].trim()}세
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={() => setCardMode((m) => m === "front" ? "detail" : "front")}>
            <Card style={styles.profileCard}>
              {cardMode === "front" && (
                <>
                  <ProfileOrb initial={currentCandidate.initial} size={88} />
                  <Text style={styles.profileMeta}>{currentCandidate.ageRange} · {currentCandidate.region}</Text>
                  <Text style={styles.profileJob}>{currentCandidate.job}</Text>
                  <View style={styles.tags}>
                    {currentCandidate.tags.map((tag) => (
                      <Text key={tag} style={styles.tag}>#{tag}</Text>
                    ))}
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.summaryWrap}>
                    {currentCandidate.summary.map((item) => (
                      <Text key={item} style={styles.summaryChip}>{item}</Text>
                    ))}
                  </View>
                  <MatchRate rate={currentMatchRate} />
                  <View style={styles.tapHint}>
                    <Ionicons name="chevron-down" size={14} color={colors.muted} />
                    <Text style={styles.tapHintText}>탭하면 자기소개 · 상세 가치관 보기</Text>
                  </View>
                </>
              )}
              {cardMode === "detail" && (
                <>
                  <Text style={styles.detailTitle}>자기소개</Text>
                  <Text style={styles.detailBio}>
                    {`${currentCandidate.region}에 사는 ${currentCandidate.job}입니다. ${currentCandidate.tags.slice(0, 2).join(", ")}을 즐기며, 진지한 만남을 원합니다.`}
                  </Text>
                  <View style={styles.divider} />
                  <Text style={styles.detailTitle}>상세 가치관</Text>
                  {currentCandidate.values.map((v) => (
                    <View key={v.questionId} style={styles.valueRow}>
                      <Ionicons name="heart-outline" size={14} color={colors.blush} />
                      <Text style={styles.valueText}>{v.option}</Text>
                    </View>
                  ))}
                  <View style={styles.tapHint}>
                    <Ionicons name="chevron-up" size={14} color={colors.muted} />
                    <Text style={styles.tapHintText}>탭하면 돌아가기</Text>
                  </View>
                </>
              )}
            </Card>
          </Pressable>

          <View style={styles.actions}>
            <Pressable onPress={resetToSelect} style={styles.circleBtn} accessibilityRole="button">
              <Ionicons name="close" color={colors.muted} size={24} />
            </Pressable>
            <AppButton
              label={sending ? "보내는 중…" : "꽃 보내기"}
              onPress={() => handleSendFlower(currentCandidate)}
              disabled={sending}
              style={styles.flowerBtn}
            />
          </View>
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

  resultContent: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 32 },
  cardTabs: { flexDirection: "row", gap: 12, marginBottom: 16 },
  cardTabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line
  },
  cardTabActive: { borderColor: colors.blush, backgroundColor: colors.surfaceWarm },
  cardTabLabel: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  cardTabLabelActive: { color: colors.blushDark },
  profileCard: { alignItems: "center", gap: 12, marginBottom: 20 },
  profileMeta: { color: colors.ink, fontSize: 17, fontWeight: "800" },
  profileJob: { color: colors.body, fontSize: 14 },
  tags: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  tag: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  divider: { width: "100%", height: 1, backgroundColor: colors.line },
  summaryWrap: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  summaryChip: {
    color: colors.blushDark,
    backgroundColor: colors.blushLight,
    borderRadius: 17,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: "600"
  },
  tapHint: { flexDirection: "row", alignItems: "center", gap: 4 },
  tapHintText: { color: colors.muted, fontSize: 11 },
  detailTitle: { color: colors.ink, fontSize: 15, fontWeight: "800", alignSelf: "flex-start" },
  detailBio: { color: colors.body, fontSize: 14, lineHeight: 22, alignSelf: "flex-start" },
  valueRow: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start" },
  valueText: { color: colors.body, fontSize: 14 },
  actions: { flexDirection: "row", alignItems: "center", gap: 12 },
  circleBtn: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.line, ...shadow
  },
  flowerBtn: { flex: 1 }
});
