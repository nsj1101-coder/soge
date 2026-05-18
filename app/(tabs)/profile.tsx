import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { ChoicePill } from "@/components/ChoicePill";
import { FlowerBadge } from "@/components/FlowerBadge";
import { Screen } from "@/components/Screen";
import { colors } from "@/constants/colors";
import { valueQuestions } from "@/data/valueQuestions";
import { useAppState } from "@/state/AppStateProvider";

export default function ProfileScreen() {
  const { profile, answers, flowerCount, matches } = useAppState();

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>마이페이지</Text>
          <Text style={styles.subtitle}>사진 없이 마음을 보여주는 프로필</Text>
        </View>
        <FlowerBadge count={flowerCount} compact />
      </View>

      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile?.nickname.slice(0, 1) ?? "백"}</Text>
        </View>
        <Text style={styles.nickname}>{profile?.nickname ?? "회원님"}</Text>
        <Text style={styles.meta}>
          {profile?.ageRange ?? "나이대 미입력"} · {profile?.region ?? "지역 미입력"} · {profile?.gender ?? "성별 미입력"}
        </Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{answers.length}</Text>
            <Text style={styles.statLabel}>답변</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{matches.length}</Text>
            <Text style={styles.statLabel}>매칭</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{flowerCount}</Text>
            <Text style={styles.statLabel}>백애꽃</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>가치관 답변</Text>
          <AppButton label="수정" variant="ghost" onPress={() => router.push("/values")} style={styles.smallButton} />
        </View>
        {valueQuestions.map((question) => {
          const answer = answers.find((item) => item.questionId === question.id);

          return (
            <View key={question.id} style={styles.answerRow}>
              <View style={styles.answerTitleWrap}>
                <Ionicons name="heart-outline" color={colors.blushDark} size={17} />
                <Text style={styles.answerTitle}>{question.title}</Text>
              </View>
              <ChoicePill label={answer?.option ?? "미답변"} selected onPress={() => router.push("/values")} />
            </View>
          );
        })}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>안전 기능</Text>
        <View style={styles.safeRow}>
          <Ionicons name="shield-checkmark-outline" color={colors.success} size={22} />
          <Text style={styles.safeText}>매칭 차단, 채팅 메시지 신고, 부적절한 대화 숨김을 MVP에 포함했습니다.</Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  profileCard: {
    alignItems: "center",
    gap: 10
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1,
    borderColor: colors.line
  },
  avatarText: {
    color: colors.blushDark,
    fontSize: 28,
    fontWeight: "800"
  },
  nickname: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "800"
  },
  meta: {
    color: colors.muted,
    fontSize: 13
  },
  stats: {
    flexDirection: "row",
    width: "100%",
    gap: 8,
    marginTop: 8
  },
  stat: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12
  },
  statValue: {
    color: colors.blushDark,
    fontSize: 20,
    fontWeight: "800"
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3
  },
  section: {
    marginTop: 14,
    gap: 14
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "800"
  },
  smallButton: {
    minHeight: 38,
    paddingHorizontal: 10
  },
  answerRow: {
    gap: 8
  },
  answerTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  answerTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "700"
  },
  safeRow: {
    flexDirection: "row",
    gap: 10
  },
  safeText: {
    flex: 1,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  }
});
