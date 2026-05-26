import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { MatchRate } from "@/components/MatchRate";
import { ProfileOrb } from "@/components/ProfileOrb";
import { Screen } from "@/components/Screen";
import { colors } from "@/constants/colors";
import { notify } from "@/services/confirm";
import { useAppState } from "@/state/AppStateProvider";

export default function MatchesScreen() {
  const { matches, spendFlowerForNewMatch, flowerCount, blockMatch } = useAppState();

  const startNewMatch = (): void => {
    const spent = spendFlowerForNewMatch();

    if (!spent) {
      notify("백애꽃 확인", "채팅 중인 매칭이 없거나 백애꽃이 부족합니다.");
      return;
    }

    notify("백애 1송이를 사용했어요", "오늘의 추천에서 새로운 인연을 확인해보세요.");
    router.push("/(tabs)/recommendations");
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>매칭</Text>
          <Text style={styles.subtitle}>서로 좋아요를 보낸 인연만 표시돼요.</Text>
        </View>
        <Text style={styles.flower}>백애꽃 {flowerCount}</Text>
      </View>

      {matches.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Ionicons name="flower-outline" color={colors.blush} size={38} />
          <Text style={styles.emptyTitle}>아직 열린 채팅이 없어요</Text>
          <Text style={styles.emptyText}>오늘의 추천에서 마음이 닿는 상대에게 좋아요를 보내보세요.</Text>
          <AppButton label="추천 보러 가기" onPress={() => router.push("/(tabs)/recommendations")} />
        </Card>
      ) : (
        <View style={styles.list}>
          {matches.map((match) => (
            <Card key={match.id} style={styles.matchCard}>
              <View style={styles.matchTop}>
                <ProfileOrb initial={match.candidate.initial} size={60} />
                <View style={styles.matchInfo}>
                  <Text style={styles.matchTitle}>
                    {match.candidate.ageRange} · {match.candidate.region}
                  </Text>
                  <Text style={styles.matchSubtitle}>{match.candidate.job}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    void blockMatch(match.id);
                  }}
                  style={styles.iconButton}
                >
                  <Ionicons name="ban-outline" color={colors.muted} size={21} />
                </Pressable>
              </View>
              <MatchRate rate={match.matchRate} />
              <AppButton label="채팅하기" onPress={() => router.push("/(tabs)/chat")} />
            </Card>
          ))}
        </View>
      )}

      <AppButton label="새로운 매칭 시작하기" variant="secondary" onPress={startNewMatch} style={styles.newMatchButton} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 8,
    marginBottom: 22
  },
  title: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "800"
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 7
  },
  flower: {
    color: colors.blushDark,
    fontSize: 13,
    fontWeight: "800"
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
  },
  list: {
    gap: 14
  },
  matchCard: {
    gap: 14
  },
  matchTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  matchInfo: {
    flex: 1
  },
  matchTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800"
  },
  matchSubtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background
  },
  newMatchButton: {
    marginTop: 18
  }
});
