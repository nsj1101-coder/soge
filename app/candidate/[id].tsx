import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/Card";
import { MatchRate } from "@/components/MatchRate";
import { ProfileOrb } from "@/components/ProfileOrb";
import { Screen } from "@/components/Screen";
import { SubPageHeader } from "@/components/SubPageHeader";
import { colors } from "@/constants/colors";
import { useAppState } from "@/state/AppStateProvider";

type Tab = "profile" | "values";

export default function CandidateDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { viewingCandidate, searchHistory, recommendedCandidates } = useAppState();
  const [tab, setTab] = useState<Tab>("profile");

  const candidate =
    viewingCandidate !== null && viewingCandidate.id === params.id
      ? viewingCandidate
      : searchHistory.flatMap((s) => s.results).find((c) => c.id === params.id) ??
        recommendedCandidates.find((c) => c.id === params.id) ??
        null;

  if (candidate === null) {
    return (
      <Screen scroll={false} style={styles.screen}>
        <View style={styles.headerWrap}>
          <SubPageHeader title="프로필" />
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>프로필 정보를 불러올 수 없어요.</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>뒤로 가기</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const extras = candidate.extraPhotoUrls ?? [];

  return (
    <Screen scroll={false} style={styles.screen}>
      <View style={styles.headerWrap}>
        <SubPageHeader title={candidate.nickname} />
      </View>

      <View style={styles.tabBar}>
        {(["profile", "values"] as Tab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tabItem, tab === t && styles.tabItemActive]}
          >
            <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
              {t === "profile" ? "프로필" : "가치관"}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === "profile" && (
          <>
            <View style={styles.heroWrap}>
              {candidate.photoUrl !== null ? (
                <Image source={{ uri: candidate.photoUrl }} style={styles.hero} />
              ) : (
                <View style={styles.heroPlaceholder}>
                  <ProfileOrb initial={candidate.initial} size={120} />
                </View>
              )}
            </View>
            <Text style={styles.nickname}>{candidate.nickname}</Text>
            <Text style={styles.meta}>{candidate.ageRange}{candidate.region ? ` · ${candidate.region}` : ""}</Text>
            {candidate.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {candidate.tags.map((t) => (
                  <Text key={t} style={styles.tag}>#{t}</Text>
                ))}
              </View>
            )}
            {candidate.matchRate !== undefined && (
              <Card style={styles.matchCard}>
                <MatchRate rate={candidate.matchRate} />
              </Card>
            )}
            {candidate.introOneLine && (
              <Card style={styles.bioCard}>
                <Text style={styles.bioTitle}>한 줄 소개</Text>
                <Text style={styles.bioText}>{candidate.introOneLine}</Text>
              </Card>
            )}
            {candidate.valueImportant && (
              <Card style={styles.bioCard}>
                <Text style={styles.bioTitle}>중요하게 생각하는 가치</Text>
                <Text style={styles.bioText}>{candidate.valueImportant}</Text>
              </Card>
            )}
            {candidate.dreamRelationship && (
              <Card style={styles.bioCard}>
                <Text style={styles.bioTitle}>꿈꾸는 연애</Text>
                <Text style={styles.bioText}>{candidate.dreamRelationship}</Text>
              </Card>
            )}
            {extras.length > 0 && (
              <View style={styles.extrasSection}>
                <Text style={styles.sectionTitle}>추가 사진</Text>
                <View style={styles.extrasGrid}>
                  {extras.map((url, i) => (
                    <Image key={i} source={{ uri: url }} style={styles.extraImg} />
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {tab === "values" && (
          <>
            <Text style={styles.sectionTitle}>가치관 답변 ({candidate.values.length})</Text>
            {candidate.values.length === 0 ? (
              <Text style={styles.empty}>아직 가치관 답변이 없어요.</Text>
            ) : (
              candidate.values.map((v) => (
                <Card key={v.questionId} style={styles.valueCard}>
                  <View style={styles.valueRow}>
                    <Ionicons name="heart" size={14} color={colors.blush} />
                    <Text style={styles.valueText}>{v.option}</Text>
                  </View>
                </Card>
              ))
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0, paddingTop: 8, paddingBottom: 0 },
  headerWrap: { paddingHorizontal: 22 },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { color: colors.muted, fontSize: 14 },
  backLink: { paddingVertical: 8, paddingHorizontal: 16 },
  backLinkText: { color: colors.blushDark, fontSize: 13, fontWeight: "700" },

  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    marginHorizontal: 22
  },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: colors.blush },
  tabLabel: { color: colors.muted, fontSize: 14, fontWeight: "600" },
  tabLabelActive: { color: colors.blush },

  content: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 36, gap: 12 },

  heroWrap: { alignItems: "center", marginBottom: 4 },
  hero: { width: 200, height: 200, borderRadius: 100, backgroundColor: colors.surfaceWarm },
  heroPlaceholder: {
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: colors.surfaceWarm,
    alignItems: "center", justifyContent: "center"
  },
  nickname: { color: colors.ink, fontSize: 22, fontWeight: "800", textAlign: "center", marginTop: 6 },
  meta: { color: colors.body, fontSize: 14, textAlign: "center", marginTop: 4 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 10 },
  tag: { color: colors.muted, fontSize: 12, fontWeight: "700" },

  matchCard: { marginTop: 12, padding: 16 },
  bioCard: { gap: 6, padding: 16, marginTop: 4 },
  bioTitle: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  bioText: { color: colors.body, fontSize: 14, lineHeight: 22 },

  extrasSection: { marginTop: 8, gap: 10 },
  sectionTitle: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  extrasGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  extraImg: { width: "31%", aspectRatio: 1, borderRadius: 12, backgroundColor: colors.surfaceWarm },

  empty: { color: colors.muted, fontSize: 13 },
  valueCard: { padding: 14 },
  valueRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  valueText: { flex: 1, color: colors.ink, fontSize: 14, fontWeight: "600" }
});
