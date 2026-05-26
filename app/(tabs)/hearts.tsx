import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { BrandHeader } from "@/components/BrandHeader";
import { Card } from "@/components/Card";
import { MatchRate } from "@/components/MatchRate";
import { ProfileOrb } from "@/components/ProfileOrb";
import { Screen } from "@/components/Screen";
import { colors } from "@/constants/colors";
import { useAppState } from "@/state/AppStateProvider";
import { Heart } from "@/types/domain";

type InnerTab = "received" | "sent";

function HeartCard({ heart, onSendFlower }: { heart: Heart; onSendFlower?: (heart: Heart) => void }) {
  const matchRate = heart.candidate.matchRate ?? 0;
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable onPress={() => setExpanded((v) => !v)}>
      <Card style={styles.heartCard}>
        <View style={styles.cardTop}>
          <ProfileOrb initial={heart.candidate.initial} size={56} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardMeta}>{heart.candidate.ageRange} · {heart.candidate.region}</Text>
            <Text style={styles.cardJob}>{heart.candidate.job}</Text>
            <View style={styles.tags}>
              {heart.candidate.tags.slice(0, 3).map((tag) => (
                <Text key={tag} style={styles.tag}>#{tag}</Text>
              ))}
            </View>
          </View>
          <MatchRate rate={matchRate} compact />
        </View>

        {expanded && (
          <>
            <View style={styles.divider} />
            <Text style={styles.detailTitle}>자기소개</Text>
            <Text style={styles.detailBio}>
              {`${heart.candidate.region}에 사는 ${heart.candidate.job}입니다. ${heart.candidate.tags.slice(0, 2).join(", ")}을 좋아해요. 진지한 만남을 원합니다.`}
            </Text>
            <Text style={styles.detailTitle}>상세 가치관</Text>
            <View style={styles.valuesWrap}>
              {heart.candidate.summary.map((item) => (
                <Text key={item} style={styles.valuePill}>{item}</Text>
              ))}
            </View>
            {onSendFlower && (
              <AppButton label="꽃 보내기" onPress={() => onSendFlower(heart)} style={styles.flowerBtn} />
            )}
          </>
        )}

        <View style={styles.tapHint}>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={14} color={colors.muted} />
          <Text style={styles.tapHintText}>{expanded ? "접기" : "자기소개 · 상세 가치관 보기"}</Text>
        </View>

        <Text style={styles.timeText}>
          {new Date(heart.sentAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </Text>
      </Card>
    </Pressable>
  );
}

export default function HeartsScreen() {
  const { sentHearts, receivedHearts, likeCandidate } = useAppState();
  const [innerTab, setInnerTab] = useState<InnerTab>("received");

  const handleSendFlower = async (heart: Heart) => {
    try {
      const result = await likeCandidate(heart.candidate);
      if (result.status === "cooldown") {
        Alert.alert("잠깐!", "6시간마다 한 번 꽃을 보낼 수 있어요.");
        return;
      }
      if (result.status === "matched") {
        router.push({ pathname: "/match-success", params: { matchId: result.match.id } });
        return;
      }
      Alert.alert("꽃을 보냈어요!", "상대도 꽃을 보내면 채팅이 열립니다.");
    } catch (err) {
      Alert.alert("오류", err instanceof Error ? err.message : "다시 시도해주세요");
    }
  };

  const list = innerTab === "received" ? receivedHearts : sentHearts;

  return (
    <Screen scroll={false} style={styles.screen}>
      <BrandHeader />
      <View style={styles.tabBar}>
        {(["received", "sent"] as InnerTab[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setInnerTab(tab)}
            style={[styles.tabItem, innerTab === tab && styles.tabItemActive]}
          >
            <Text style={[styles.tabLabel, innerTab === tab && styles.tabLabelActive]}>
              {tab === "received" ? "온 하트" : "보낸 하트"}
            </Text>
            {tab === "received" && receivedHearts.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{receivedHearts.length}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {list.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="heart-outline" color={colors.blush} size={36} />
            <Text style={styles.emptyTitle}>
              {innerTab === "received" ? "아직 받은 하트가 없어요" : "아직 보낸 하트가 없어요"}
            </Text>
            <Text style={styles.emptyText}>
              {innerTab === "received"
                ? "홈에서 가치관을 선택하고 서치해보세요."
                : "마음에 드는 상대에게 꽃을 보내면 여기에 기록돼요."}
            </Text>
          </Card>
        ) : (
          list.map((heart) => (
            <HeartCard
              key={heart.id}
              heart={heart}
              onSendFlower={innerTab === "received" ? handleSendFlower : undefined}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0, paddingVertical: 0 },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    marginHorizontal: 22,
    marginTop: 8
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.blush
  },
  tabLabel: { color: colors.muted, fontSize: 14, fontWeight: "600" },
  tabLabelActive: { color: colors.blush },
  badge: {
    backgroundColor: colors.blush,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  badgeText: { color: colors.surface, fontSize: 10, fontWeight: "800" },
  listContent: { padding: 22, gap: 14 },
  heartCard: { gap: 12 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  cardInfo: { flex: 1, gap: 4 },
  cardMeta: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  cardJob: { color: colors.body, fontSize: 13 },
  tags: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  tag: { color: colors.muted, fontSize: 11, fontWeight: "700" },
  divider: { height: 1, backgroundColor: colors.line },
  detailTitle: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  detailBio: { color: colors.body, fontSize: 13, lineHeight: 20 },
  valuesWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  valuePill: {
    color: colors.blushDark,
    backgroundColor: colors.blushLight,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: "600"
  },
  flowerBtn: { marginTop: 4 },
  tapHint: { flexDirection: "row", alignItems: "center", gap: 4 },
  tapHintText: { color: colors.muted, fontSize: 11 },
  timeText: { color: colors.disabled, fontSize: 11, alignSelf: "flex-end" },
  emptyCard: { alignItems: "center", gap: 12, marginTop: 24 },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: "800" },
  emptyText: { color: colors.muted, textAlign: "center", fontSize: 13, lineHeight: 20 }
});
