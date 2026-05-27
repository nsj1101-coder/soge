import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BrandHeader } from "@/components/BrandHeader";
import { Card } from "@/components/Card";
import { ProfileOrb } from "@/components/ProfileOrb";
import { Screen } from "@/components/Screen";
import { colors } from "@/constants/colors";
import { useAppState } from "@/state/AppStateProvider";

export default function ChatListScreen() {
  const { matches, messages } = useAppState();

  const lastMessage = (matchId: string) => {
    const msgs = messages.filter((m) => m.matchId === matchId);
    return msgs[msgs.length - 1] ?? null;
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diffMin < 1) return "방금";
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)}시간 전`;
    return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  };

  return (
    <Screen scroll={false} style={styles.screen}>
      <BrandHeader
        right={
          <Pressable accessibilityRole="button" style={styles.iconBtn}>
            <Ionicons name="create-outline" size={22} color={colors.ink} />
          </Pressable>
        }
      />

      {matches.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyWrap}>
          <Card style={styles.emptyCard}>
            <Ionicons name="chatbubble-outline" color={colors.blush} size={38} />
            <Text style={styles.emptyTitle}>아직 채팅이 없어요</Text>
            <Text style={styles.emptyText}>홈에서 마음에 드는 상대에게 꽃을 보내고{"\n"}서로 매칭되면 채팅이 시작돼요.</Text>
          </Card>
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {matches.map((match) => {
            const last = lastMessage(match.id);
            return (
              <Pressable
                key={match.id}
                onPress={() => router.push({ pathname: "/chat-detail", params: { matchId: match.id } })}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              >
                <ProfileOrb initial={match.candidate.initial} size={52} />
                <View style={styles.rowInfo}>
                  <View style={styles.rowTop}>
                    <Text style={styles.rowName}>{match.candidate.nickname}</Text>
                    {last && <Text style={styles.rowTime}>{formatTime(last.sentAt)}</Text>}
                  </View>
                  <Text style={styles.rowJob}>{match.candidate.ageRange}{match.candidate.region ? ` · ${match.candidate.region}` : ""}</Text>
                  {last && (
                    <Text style={styles.rowPreview} numberOfLines={1}>{last.body}</Text>
                  )}
                </View>
                <View style={styles.matchRatePill}>
                  <Text style={styles.matchRateText}>{match.matchRate}%</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0, paddingVertical: 0 },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  rowPressed: { backgroundColor: colors.background },
  rowInfo: { flex: 1, gap: 3 },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowName: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  rowJob: { color: colors.muted, fontSize: 12 },
  rowPreview: { color: colors.body, fontSize: 13, marginTop: 2 },
  rowTime: { color: colors.muted, fontSize: 11 },
  matchRatePill: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  matchRateText: { color: colors.blushDark, fontSize: 11, fontWeight: "800" },
  emptyWrap: { flex: 1, justifyContent: "center", padding: 22 },
  emptyCard: { alignItems: "center", gap: 12 },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  emptyText: { color: colors.muted, textAlign: "center", lineHeight: 21, fontSize: 13 }
});
