import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { MatchRate } from "@/components/MatchRate";
import { ProfileOrb } from "@/components/ProfileOrb";
import { Screen } from "@/components/Screen";
import { colors } from "@/constants/colors";
import { formatRemainingTime, calculateMatchRate } from "@/services/matching";
import { useAppState } from "@/state/AppStateProvider";

export default function RecommendationsScreen() {
  const { answers, lastLikeAt, primaryRecommendation, likeCandidate } = useAppState();
  const [remaining, setRemaining] = useState("지금 가능");

  const nextAvailableAt = useMemo(() => {
    if (lastLikeAt === null) {
      return null;
    }

    return new Date(new Date(lastLikeAt).getTime() + 6 * 60 * 60 * 1000).toISOString();
  }, [lastLikeAt]);

  useEffect(() => {
    const updateRemaining = (): void => {
      setRemaining(nextAvailableAt === null ? "지금 가능" : formatRemainingTime(nextAvailableAt));
    };

    updateRemaining();
    const timer = setInterval(updateRemaining, 1000);

    return () => clearInterval(timer);
  }, [nextAvailableAt]);

  const matchRate =
    primaryRecommendation === null ? 0 : calculateMatchRate(answers, primaryRecommendation.values);

  const handleLike = (): void => {
    if (primaryRecommendation === null) {
      Alert.alert("추천이 없어요", "현재 확인할 추천 상대가 없습니다.");
      return;
    }

    const result = likeCandidate(primaryRecommendation);

    if (result.status === "cooldown") {
      Alert.alert("좋아요 대기 중", `${formatRemainingTime(result.nextAvailableAt)} 뒤에 다시 보낼 수 있어요.`);
      return;
    }

    if (result.status === "matched") {
      router.push({ pathname: "/match-success", params: { matchId: result.match.id } });
      return;
    }

    Alert.alert("좋아요를 보냈어요", "상대도 좋아요를 보내면 채팅이 열립니다.");
  };

  if (primaryRecommendation === null) {
    return (
      <Screen style={styles.empty}>
        <Text style={styles.title}>오늘의 추천</Text>
        <Card style={styles.emptyCard}>
          <Ionicons name="heart-outline" color={colors.blush} size={38} />
          <Text style={styles.emptyTitle}>모든 추천을 확인했어요</Text>
          <Text style={styles.emptyText}>마이페이지에서 가치관 답변을 조정하면 추천이 다시 정렬됩니다.</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.top}>
        <View style={styles.topLeft}>
          <Text style={styles.title}>오늘의 추천</Text>
          <Text style={styles.cooldown}>좋아요는 6시간마다 보낼 수 있어요</Text>
        </View>
        <Pressable accessibilityRole="button" style={styles.bellBtn}>
          <Ionicons name="notifications-outline" color={colors.ink} size={24} />
        </Pressable>
      </View>

      <View style={styles.timerPill}>
        <Text style={styles.timer}>{remaining} 남음</Text>
      </View>

      <Card style={styles.profileCard}>
        <ProfileOrb initial={primaryRecommendation.initial} size={96} />
        <Text style={styles.profileTitle}>
          {primaryRecommendation.ageRange} · {primaryRecommendation.region}
        </Text>
        <Text style={styles.job}>{primaryRecommendation.job}</Text>
        <View style={styles.tags}>
          {primaryRecommendation.tags.map((tag) => (
            <Text key={tag} style={styles.tag}>
              #{tag}
            </Text>
          ))}
        </View>
        <View style={styles.divider} />
        <Text style={styles.summaryTitle}>가치관 요약</Text>
        <View style={styles.summary}>
          {primaryRecommendation.summary.map((item) => (
            <Text key={item} style={styles.summaryItem}>
              {item}
            </Text>
          ))}
        </View>
        <MatchRate rate={matchRate} />
      </Card>

      <View style={styles.actions}>
        <Pressable accessibilityRole="button" style={styles.circleButton}>
          <Ionicons name="close" color={colors.ink} size={26} />
        </Pressable>
        <AppButton label="백애꽃 보내기" onPress={handleLike} style={styles.likeButton} />
        <Pressable accessibilityRole="button" style={styles.circleButton}>
          <Ionicons name="bookmark-outline" color={colors.ink} size={22} />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    gap: 12
  },
  topLeft: {
    flex: 1
  },
  bellBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "800"
  },
  cooldown: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 6
  },
  timerPill: {
    alignSelf: "center",
    backgroundColor: colors.surfaceWarm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.blushLight,
    paddingHorizontal: 18,
    paddingVertical: 7,
    marginVertical: 14
  },
  timer: {
    color: colors.blushDark,
    fontSize: 14,
    fontWeight: "800"
  },
  profileCard: {
    alignItems: "center",
    gap: 12
  },
  profileTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800"
  },
  job: {
    color: colors.ink,
    fontSize: 15
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8
  },
  tag: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 4
  },
  summaryTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800"
  },
  summary: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8
  },
  summaryItem: {
    color: colors.blushDark,
    backgroundColor: colors.blushLight,
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 7,
    fontSize: 12,
    fontWeight: "600"
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20
  },
  circleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line
  },
  likeButton: {
    flex: 1
  },
  empty: {
    gap: 18
  },
  emptyCard: {
    alignItems: "center",
    gap: 12
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800"
  },
  emptyText: {
    color: colors.muted,
    textAlign: "center",
    lineHeight: 21
  }
});
