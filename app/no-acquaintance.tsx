import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { SubPageHeader } from "@/components/SubPageHeader";
import { colors } from "@/constants/colors";

export default function NoAcquaintanceScreen() {
  const [enabled, setEnabled] = useState(false);

  return (
    <Screen scroll={false}>
      <SubPageHeader title="아는 사람 만나지 않기" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.toggleCard}>
          <View style={styles.toggleHeader}>
            <View style={styles.iconWrap}>
              <Ionicons name="shield-outline" size={22} color={colors.blush} />
            </View>
            <View style={styles.toggleText}>
              <Text style={styles.title}>주소록 차단</Text>
              <Text style={styles.desc}>연락처에 저장된 사람과 매칭되지 않게 해요.</Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{ false: colors.line, true: colors.blushLight }}
              thumbColor={enabled ? colors.blush : colors.surface}
            />
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>안내</Text>
          <Text style={styles.infoText}>
            연락처 접근 권한이 필요해요. 토글을 켜면 권한 안내가 표시됩니다.{"\n"}
            현재는 베타 단계로 실제 차단은 곧 적용돼요.
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 32 },
  toggleCard: { padding: 18 },
  toggleHeader: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceWarm
  },
  toggleText: { flex: 1, gap: 4 },
  title: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  desc: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  infoCard: { gap: 8, padding: 18 },
  infoTitle: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  infoText: { color: colors.muted, fontSize: 12, lineHeight: 18 }
});
