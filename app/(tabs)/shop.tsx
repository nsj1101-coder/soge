import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { BrandHeader } from "@/components/BrandHeader";
import { Card } from "@/components/Card";
import { FlowerBadge } from "@/components/FlowerBadge";
import { Screen } from "@/components/Screen";
import { colors } from "@/constants/colors";
import { formatRemainingTime } from "@/services/matching";
import { useAppState } from "@/state/AppStateProvider";

export default function ShopScreen() {
  const { flowerCount, searchNextAvailable, likeNextAvailable } = useAppState();
  const [searchRemaining, setSearchRemaining] = useState("");
  const [searchReady, setSearchReady] = useState(false);
  const [likeRemaining, setLikeRemaining] = useState("");
  const [likeReady, setLikeReady] = useState(false);

  useEffect(() => {
    const update = () => {
      const sReady = searchNextAvailable.getTime() <= Date.now();
      setSearchReady(sReady);
      setSearchRemaining(sReady ? "지금 가능" : formatRemainingTime(searchNextAvailable.toISOString()));
      const lReady = likeNextAvailable.getTime() <= Date.now();
      setLikeReady(lReady);
      setLikeRemaining(lReady ? "지금 가능" : formatRemainingTime(likeNextAvailable.toISOString()));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [searchNextAvailable, likeNextAvailable]);

  return (
    <Screen scroll={false} style={styles.screen}>
      <BrandHeader right={<FlowerBadge count={flowerCount} compact />} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* 쿨타임 현황 */}
        <Text style={styles.sectionTitle}>쿨타임 현황</Text>
        <Text style={styles.sectionSub}>서치는 2시간, 좋아요는 6시간마다 1회 무료예요</Text>

        <Card style={styles.searchCard}>
          <View style={styles.searchCardLeft}>
            <View style={styles.iconWrap}>
              <Ionicons name="search" size={22} color={colors.blush} />
            </View>
            <View>
              <Text style={styles.searchCardTitle}>서치</Text>
              <Text style={styles.searchCardDesc}>2시간마다 1회 무료</Text>
            </View>
          </View>
          <View style={[styles.statusPill, searchReady && styles.statusPillReady]}>
            <Ionicons
              name={searchReady ? "checkmark-circle" : "time-outline"}
              size={13}
              color={searchReady ? colors.success : colors.blushDark}
            />
            <Text style={[styles.statusText, searchReady && styles.statusTextReady]}>
              {searchRemaining}
            </Text>
          </View>
        </Card>

        <Card style={styles.searchCard}>
          <View style={styles.searchCardLeft}>
            <View style={styles.iconWrap}>
              <Ionicons name="flower" size={22} color={colors.blush} />
            </View>
            <View>
              <Text style={styles.searchCardTitle}>좋아요</Text>
              <Text style={styles.searchCardDesc}>6시간마다 1회 무료</Text>
            </View>
          </View>
          <View style={[styles.statusPill, likeReady && styles.statusPillReady]}>
            <Ionicons
              name={likeReady ? "checkmark-circle" : "time-outline"}
              size={13}
              color={likeReady ? colors.success : colors.blushDark}
            />
            <Text style={[styles.statusText, likeReady && styles.statusTextReady]}>
              {likeRemaining}
            </Text>
          </View>
        </Card>

        {/* 꽃송이 안내 */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>백애꽃 사용법</Text>
        <Text style={styles.sectionSub}>꽃송이는 아래 상황에서 사용돼요</Text>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="flower" size={18} color={colors.blush} />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoTitle}>쿨타임 없이 꽃 보내기</Text>
              <Text style={styles.infoDesc}>6시간 쿨타임이 남아도 꽃송이를 쓰면 바로 보낼 수 있어요</Text>
            </View>
            <Text style={styles.infoCost}>1송이</Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="refresh" size={18} color={colors.blush} />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoTitle}>채팅 중 추가 서치</Text>
              <Text style={styles.infoDesc}>이미 채팅 중일 때도 꽃송이를 쓰면 새로운 서치를 시작할 수 있어요</Text>
            </View>
            <Text style={styles.infoCost}>1송이</Text>
          </View>
        </Card>

        {/* 친구 초대 */}
        <Card style={styles.inviteCard}>
          <View style={styles.inviteLeft}>
            <View style={styles.iconWrap}>
              <Ionicons name="people-outline" size={22} color={colors.blush} />
            </View>
            <View>
              <Text style={styles.searchCardTitle}>친구 초대</Text>
              <Text style={styles.searchCardDesc}>초대 1명당 꽃송이 3송이 무료 지급</Text>
            </View>
          </View>
          <Pressable style={styles.inviteBtn}>
            <Text style={styles.inviteBtnText}>초대하기</Text>
          </Pressable>
        </Card>

        {/* 스토어 이동 */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>유료 충전</Text>
          <View style={styles.dividerLine} />
        </View>

        <Card style={styles.storeBanner}>
          <View style={styles.storeBannerTop}>
            <Ionicons name="flower" size={28} color={colors.blush} />
            <View>
              <Text style={styles.storeBannerTitle}>백애꽃 스토어</Text>
              <Text style={styles.storeBannerDesc}>더 많은 인연을 위해 꽃송이를 충전하세요</Text>
            </View>
          </View>
          <AppButton label="스토어 이동" onPress={() => router.push("/store")} style={styles.storeBtn} />
        </Card>

      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0, paddingVertical: 0 },
  content: { padding: 22, gap: 12 },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: "800", marginBottom: 2 },
  sectionSub: { color: colors.muted, fontSize: 13, marginBottom: 8 },

  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  searchCardLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconWrap: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.surfaceWarm,
    alignItems: "center", justifyContent: "center"
  },
  searchCardTitle: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  searchCardDesc: { color: colors.muted, fontSize: 12, marginTop: 2 },
  statusPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: colors.surfaceWarm,
    borderRadius: 12, borderWidth: 1, borderColor: colors.blushLight,
    paddingHorizontal: 10, paddingVertical: 5
  },
  statusPillReady: { backgroundColor: "#EBF6F0", borderColor: "#B8DFD0" },
  statusText: { color: colors.blushDark, fontSize: 11, fontWeight: "700" },
  statusTextReady: { color: colors.success },

  infoCard: { gap: 14 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  infoIconWrap: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.surfaceWarm,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0
  },
  infoTextWrap: { flex: 1 },
  infoTitle: { color: colors.ink, fontSize: 14, fontWeight: "700" },
  infoDesc: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 2 },
  infoCost: {
    color: colors.blushDark, fontSize: 12, fontWeight: "800",
    backgroundColor: colors.blushLight, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4, flexShrink: 0
  },
  infoDivider: { height: 1, backgroundColor: colors.line },

  inviteCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  inviteLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  inviteBtn: {
    backgroundColor: colors.blushLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  inviteBtnText: { color: colors.blushDark, fontSize: 13, fontWeight: "700" },

  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.line },
  dividerText: { color: colors.muted, fontSize: 12 },

  storeBanner: { gap: 14 },
  storeBannerTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  storeBannerTitle: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  storeBannerDesc: { color: colors.muted, fontSize: 12, marginTop: 2 },
  storeBtn: { minHeight: 46 }
});
