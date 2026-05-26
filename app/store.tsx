import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/Card";
import { FlowerBadge } from "@/components/FlowerBadge";
import { colors, shadow } from "@/constants/colors";
import { confirm, notify } from "@/services/confirm";
import { useAppState } from "@/state/AppStateProvider";

const PACKS = [
  { id: "pack-5", amount: 5, priceLabel: "₩2,900", desc: "가볍게 시작해요" },
  { id: "pack-15", amount: 15, priceLabel: "₩6,900", desc: "가장 인기있어요", badge: "인기" },
  { id: "pack-30", amount: 30, priceLabel: "₩12,900", desc: "꽃이 넉넉하게", badge: "가성비" },
  { id: "pack-60", amount: 60, priceLabel: "₩22,900", desc: "진심 가득", badge: "최고가성비" }
];

export default function StoreScreen() {
  const { flowerCount } = useAppState();

  const handleBuy = async (amount: number, price: string) => {
    if (await confirm("구매 확인", `백애꽃 ${amount}송이를 ${price}에 구매할까요?`, "구매하기")) {
      notify("준비 중", "인앱결제 기능은 곧 오픈될 예정이에요.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.title}>백애꽃 스토어</Text>
        <FlowerBadge count={flowerCount} compact />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <LinearGradient
          colors={["#FFF1F3", "#FFF9F6"]}
          style={styles.heroBanner}
        >
          <Ionicons name="flower" size={48} color={colors.blush} />
          <View>
            <Text style={styles.heroTitle}>백애꽃으로</Text>
            <Text style={styles.heroSub}>더 진심 어린 만남을 시작해요</Text>
          </View>
        </LinearGradient>

        <Text style={styles.sectionTitle}>꽃송이 선택</Text>

        {PACKS.map((pack) => (
          <Pressable
            key={pack.id}
            onPress={() => handleBuy(pack.amount, pack.priceLabel)}
            style={({ pressed }) => [styles.packCard, pressed && styles.packCardPressed]}
          >
            <View style={styles.packLeft}>
              <View style={styles.packIconWrap}>
                <Ionicons name="flower" size={24} color={colors.blush} />
                {pack.badge && (
                  <View style={styles.packBadge}>
                    <Text style={styles.packBadgeText}>{pack.badge}</Text>
                  </View>
                )}
              </View>
              <View>
                <Text style={styles.packAmount}>백애꽃 {pack.amount}송이</Text>
                <Text style={styles.packDesc}>{pack.desc}</Text>
              </View>
            </View>
            <View style={styles.packRight}>
              <Text style={styles.packPrice}>{pack.priceLabel}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </View>
          </Pressable>
        ))}

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={18} color={colors.muted} />
            <Text style={styles.infoText}>구매한 꽃송이는 환불되지 않습니다.</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="flower-outline" size={18} color={colors.muted} />
            <Text style={styles.infoText}>꽃송이는 채팅 중 추가 서치, 꽃 보내기에 사용돼요.</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.muted} />
            <Text style={styles.infoText}>결제는 앱스토어 / 구글플레이 정책을 따릅니다.</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    gap: 10
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, color: colors.ink, fontSize: 18, fontWeight: "800" },
  content: { padding: 20, gap: 14 },
  heroBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.blushLight
  },
  heroTitle: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  heroSub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: "800" },
  packCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    ...shadow
  },
  packCardPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  packLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  packIconWrap: { position: "relative" },
  packBadge: {
    position: "absolute",
    top: -6,
    right: -12,
    backgroundColor: colors.blush,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2
  },
  packBadgeText: { color: colors.surface, fontSize: 9, fontWeight: "800" },
  packAmount: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  packDesc: { color: colors.muted, fontSize: 12, marginTop: 2 },
  packRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  packPrice: { color: colors.blushDark, fontSize: 16, fontWeight: "800" },
  infoCard: { gap: 12 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  infoText: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 18 }
});
