import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const heartFlowerImg = require("../img/flr_lv.png");
import { AppButton } from "@/components/AppButton";
import { Card } from "@/components/Card";
import { FlowerBadge } from "@/components/FlowerBadge";
import { ProfileOrb } from "@/components/ProfileOrb";
import { Screen } from "@/components/Screen";
import { colors } from "@/constants/colors";
import { useAppState } from "@/state/AppStateProvider";

type MatchParams = {
  matchId?: string;
};

export default function MatchSuccessScreen() {
  const { matchId } = useLocalSearchParams<MatchParams>();
  const { flowerCount, matches } = useAppState();
  const match = matches.find((item) => item.id === matchId) ?? matches[0];

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={24} color={colors.ink} />
      </Pressable>
      <View style={styles.wrap}>
        <Text style={styles.title}>서로의 마음이 닿았어요</Text>
        <Text style={styles.subtitle}>축하해요! 새로운 인연이 시작될 수 있어요.</Text>

        <View style={styles.orbs}>
          <ProfileOrb initial="나" size={82} />
          <Image source={heartFlowerImg} style={styles.heartFlower} resizeMode="contain" />
          <ProfileOrb initial={match?.candidate.initial ?? "?"} size={82} />
        </View>

        <Card style={styles.policyCard}>
          <View style={styles.policyRow}>
            <Ionicons name="chatbubble-ellipses-outline" color={colors.blushDark} size={28} />
            <View style={styles.policyText}>
              <Text style={styles.policyTitle}>서로 좋아요 시 채팅 시작</Text>
              <Text style={styles.policyCopy}>서로의 마음이 확인되면 채팅으로 이어질 수 있어요.</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.policyRow}>
            <Ionicons name="flower-outline" color={colors.blushDark} size={28} />
            <View style={styles.policyText}>
              <Text style={styles.policyTitle}>채팅 중 새로운 매칭 시작 시 백애 1송이 차감</Text>
              <Text style={styles.policyCopy}>더 진심 어린 만남을 위해 백애꽃이 사용돼요.</Text>
            </View>
          </View>
        </Card>

        <FlowerBadge count={flowerCount} />
      </View>

      <AppButton label="채팅하러 가기" onPress={() => router.replace("/(tabs)/chat")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
    marginTop: 4
  },
  wrap: {
    flex: 1,
    alignItems: "center",
    gap: 18,
    paddingTop: 24
  },
  title: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center"
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
    marginTop: -8
  },
  orbs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginVertical: 8
  },
  heartFlower: {
    width: 64,
    height: 64
  },
  policyCard: {
    width: "100%",
    gap: 16
  },
  policyRow: {
    flexDirection: "row",
    gap: 14
  },
  policyText: {
    flex: 1,
    gap: 4
  },
  policyTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800"
  },
  policyCopy: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19
  },
  divider: {
    height: 1,
    backgroundColor: colors.line
  }
});
