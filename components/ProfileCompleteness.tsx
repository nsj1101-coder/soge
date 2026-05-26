import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card } from "./Card";
import { colors } from "@/constants/colors";

type IoniconName = keyof typeof Ionicons.glyphMap;

type Item = {
  key: string;
  icon: IoniconName;
  label: string;
  done: boolean;
  route: string;
};

type Props = {
  hasAnswers: boolean;
  hasIntro: boolean;
  hasPhoto: boolean;
};

export function ProfileCompleteness({ hasAnswers, hasIntro, hasPhoto }: Props) {
  const items: Item[] = [
    { key: "values", icon: "heart-outline", label: "나의 가치관 답변", done: hasAnswers, route: "/values" },
    { key: "intro", icon: "create-outline", label: "자기소개 작성", done: hasIntro, route: "/profile-edit" },
    { key: "photo", icon: "camera-outline", label: "프로필 사진 등록", done: hasPhoto, route: "/profile-edit" }
  ];
  const missing = items.filter((i) => !i.done);
  if (missing.length === 0) return null;

  const doneCount = items.length - missing.length;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="sparkles-outline" size={16} color={colors.blush} />
          <Text style={styles.title}>프로필을 완성해주세요</Text>
        </View>
        <Text style={styles.progress}>{doneCount}/{items.length}</Text>
      </View>
      <Text style={styles.desc}>더 정확한 매칭을 위해 아래 항목을 채워보세요.</Text>
      <View style={styles.list}>
        {items.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => router.push(item.route as never)}
            disabled={item.done}
            style={[styles.row, item.done && styles.rowDone]}
          >
            <View style={[styles.iconWrap, item.done && styles.iconWrapDone]}>
              <Ionicons
                name={item.done ? "checkmark" : item.icon}
                size={16}
                color={item.done ? colors.success : colors.blush}
              />
            </View>
            <Text style={[styles.label, item.done && styles.labelDone]}>{item.label}</Text>
            {!item.done && <Ionicons name="chevron-forward" size={16} color={colors.muted} />}
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10, padding: 16, marginBottom: 14, borderColor: colors.blushLight, borderWidth: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  progress: { color: colors.blushDark, fontSize: 13, fontWeight: "800" },
  desc: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  list: { gap: 6, marginTop: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: colors.background
  },
  rowDone: { opacity: 0.6 },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceWarm
  },
  iconWrapDone: { backgroundColor: "#EBF6F0" },
  label: { flex: 1, color: colors.ink, fontSize: 13, fontWeight: "600" },
  labelDone: { color: colors.muted, textDecorationLine: "line-through" }
});
