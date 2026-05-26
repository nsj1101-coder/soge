import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BrandHeader } from "@/components/BrandHeader";
import { Card } from "@/components/Card";
import { FlowerBadge } from "@/components/FlowerBadge";
import { Screen } from "@/components/Screen";
import { colors } from "@/constants/colors";
import { confirm } from "@/services/confirm";
import { useAppState } from "@/state/AppStateProvider";

type IoniconName = keyof typeof Ionicons.glyphMap;

type MenuItem = {
  key: string;
  label: string;
  icon: IoniconName;
  route: string;
};

const MENU: MenuItem[] = [
  { key: "profile-edit", label: "내 프로필", icon: "person-outline", route: "/profile-edit" },
  { key: "search-criteria", label: "서치 기준 설정", icon: "options-outline", route: "/search-criteria" },
  { key: "values", label: "나의 가치관 답변", icon: "heart-outline", route: "/values" },
  { key: "no-acquaintance", label: "아는 사람 만나지 않기", icon: "shield-outline", route: "/no-acquaintance" },
  { key: "account", label: "내 계정 관리", icon: "key-outline", route: "/account" },
  { key: "help", label: "도움말 및 지원", icon: "help-circle-outline", route: "/help" }
];

export default function ProfileScreen() {
  const { profile, authUser, flowerCount, logOut } = useAppState();

  const nickname = profile?.nickname ?? authUser?.nickname ?? "회원님";
  const initial = nickname.slice(0, 1);

  const handleLogout = async () => {
    if (await confirm("로그아웃", "로그아웃 할까요?", "로그아웃", true)) {
      await logOut();
      router.replace("/");
    }
  };

  return (
    <Screen scroll={false} style={styles.screen}>
      <BrandHeader right={<FlowerBadge count={flowerCount} compact />} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Card style={styles.userCard}>
          <View style={styles.avatar}>
            {profile?.photoUrl ? (
              <Image source={{ uri: profile.photoUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.nickname}>{nickname}</Text>
            {(profile?.birthYear !== null && profile?.birthYear !== undefined) || profile?.region ? (
              <Text style={styles.userMeta}>
                {profile?.birthYear ? `${profile.birthYear}년생` : ""}
                {profile?.birthYear && profile?.region ? " · " : ""}
                {profile?.region ?? ""}
              </Text>
            ) : null}
          </View>
        </Card>

        <Card style={styles.menuCard}>
          {MENU.map((item, idx) => (
            <Pressable
              key={item.key}
              onPress={() => router.push(item.route as never)}
              style={[styles.menuRow, idx > 0 && styles.menuRowBorder]}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={20} color={colors.blush} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          ))}
        </Card>

        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={18} color={colors.muted} />
          <Text style={styles.logoutText}>로그아웃</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0, paddingVertical: 0 },
  content: { padding: 22, gap: 14, paddingBottom: 40 },

  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden"
  },
  avatarText: { color: colors.ink, fontSize: 24, fontWeight: "800" },
  avatarImage: { width: "100%", height: "100%", borderRadius: 32 },
  userInfo: { flex: 1, gap: 4 },
  nickname: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  userMeta: { color: colors.muted, fontSize: 13 },
  email: { color: colors.muted, fontSize: 13 },

  menuCard: { padding: 0, overflow: "hidden" },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 16
  },
  menuRowBorder: { borderTopWidth: 1, borderTopColor: colors.line },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceWarm
  },
  menuLabel: { flex: 1, color: colors.ink, fontSize: 15, fontWeight: "600" },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    marginTop: 6
  },
  logoutText: { color: colors.muted, fontSize: 14, fontWeight: "600" }
});
