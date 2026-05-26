import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { SubPageHeader } from "@/components/SubPageHeader";
import { colors } from "@/constants/colors";
import { confirm, notify } from "@/services/confirm";
import { useAppState } from "@/state/AppStateProvider";

export default function AccountScreen() {
  const { authUser, logOut } = useAppState();

  const handleDelete = async () => {
    if (
      await confirm(
        "계정 탈퇴",
        "정말 탈퇴하시겠어요? 모든 매치, 메시지, 가치관 답변이 삭제됩니다.",
        "탈퇴",
        true
      )
    ) {
      notify("준비 중", "탈퇴 기능은 곧 추가돼요.");
    }
  };

  const handleLogout = async () => {
    if (await confirm("로그아웃", "로그아웃 할까요?", "로그아웃", true)) {
      await logOut();
      router.replace("/");
    }
  };

  return (
    <Screen scroll={false}>
      <SubPageHeader title="내 계정 관리" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.section}>
          <Row label="이메일" value={authUser?.email ?? "-"} />
          <Row label="가입 방식" value="이메일" />
        </Card>

        <Card style={styles.section}>
          <Pressable
            onPress={() => notify("준비 중", "비밀번호 변경은 곧 추가돼요.")}
            style={styles.menuRow}
          >
            <Ionicons name="key-outline" size={18} color={colors.blush} />
            <Text style={styles.menuLabel}>비밀번호 변경</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable onPress={handleLogout} style={styles.menuRow}>
            <Ionicons name="log-out-outline" size={18} color={colors.blush} />
            <Text style={styles.menuLabel}>로그아웃</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </Pressable>
        </Card>

        <Pressable onPress={handleDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>계정 탈퇴</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 32 },
  section: { padding: 18, gap: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowLabel: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  rowValue: { color: colors.ink, fontSize: 14, fontWeight: "600" },
  menuRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 },
  menuLabel: { flex: 1, color: colors.ink, fontSize: 14, fontWeight: "600" },
  divider: { height: 1, backgroundColor: colors.line },
  deleteBtn: { alignSelf: "center", padding: 14, marginTop: 8 },
  deleteText: { color: "#d6485f", fontSize: 13, fontWeight: "600", textDecorationLine: "underline" }
});
