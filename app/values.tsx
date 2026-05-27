import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { Screen } from "@/components/Screen";
import { colors } from "@/constants/colors";
import { OPTION_TO_QUESTION, VALUE_GROUPS } from "@/data/valueOptions";
import { notify } from "@/services/confirm";
import { useAppState } from "@/state/AppStateProvider";

export default function ValuesScreen() {
  const { replaceAnswers, answers: initialAnswers } = useAppState();
  const [picked, setPicked] = useState<string[]>(
    initialAnswers.map((a) => a.option).filter((opt) => OPTION_TO_QUESTION[opt] !== undefined)
  );
  const [saving, setSaving] = useState(false);

  const totalQuestions = useMemo(
    () => new Set(Object.values(OPTION_TO_QUESTION)).size,
    []
  );

  const answeredQuestionIds = useMemo(
    () => new Set(picked.map((opt) => OPTION_TO_QUESTION[opt]).filter(Boolean)),
    [picked]
  );

  const toggle = (option: string) => {
    setPicked((current) => {
      const questionId = OPTION_TO_QUESTION[option];
      if (current.includes(option)) {
        return current.filter((o) => o !== option);
      }
      const withoutSiblings = current.filter((o) => OPTION_TO_QUESTION[o] !== questionId);
      return [...withoutSiblings, option];
    });
  };

  const save = async () => {
    if (saving || picked.length === 0) return;
    setSaving(true);
    try {
      const next = picked.map((opt) => ({
        questionId: OPTION_TO_QUESTION[opt],
        option: opt
      }));
      await replaceAnswers(next);
      notify("저장 완료", "가치관 답변이 저장됐어요.");
      router.back();
    } catch (err) {
      notify("저장 실패", err instanceof Error ? err.message : "다시 시도해주세요");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll={false} style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>나의 가치관 답변</Text>
          <Text style={styles.subtitle}>나와 가장 비슷한 항목을 골라주세요</Text>
        </View>
        <View style={styles.counterPill}>
          <Text style={styles.counterText}>{answeredQuestionIds.size}/{totalQuestions}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {VALUE_GROUPS.map((group, idx) => (
          <View key={group.title} style={styles.group}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupIndex}>Q{idx + 1}</Text>
              <Text style={styles.groupTitle}>{group.title}</Text>
            </View>
            <View style={styles.groupOptions}>
              {group.options.map((opt) => {
                const checked = picked.includes(opt);
                return (
                  <Pressable
                    key={opt}
                    onPress={() => toggle(opt)}
                    style={[styles.row, checked && styles.rowChecked]}
                  >
                    <View style={[styles.radio, checked && styles.radioChecked]}>
                      {checked && <View style={styles.radioDot} />}
                    </View>
                    <Text style={[styles.rowText, checked && styles.rowTextChecked]}>{opt}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          label={saving ? "저장 중…" : "저장"}
          onPress={save}
          disabled={saving || picked.length === 0}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0, paddingTop: 16, paddingBottom: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingBottom: 12
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center", marginLeft: -8 },
  headerCenter: { flex: 1 },
  title: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  subtitle: { color: colors.muted, fontSize: 11, marginTop: 2 },
  counterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.blushLight
  },
  counterText: { color: colors.blushDark, fontSize: 12, fontWeight: "800" },

  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 20 },
  group: { gap: 10 },
  groupHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  groupIndex: {
    color: colors.blushDark,
    backgroundColor: colors.blushLight,
    fontSize: 11,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: "hidden"
  },
  groupTitle: { flex: 1, color: colors.ink, fontSize: 14, fontWeight: "800", lineHeight: 20 },
  groupOptions: { gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  rowChecked: { borderColor: colors.blush, backgroundColor: colors.blushLight },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  radioChecked: { borderColor: colors.blush },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blush },
  rowText: { flex: 1, color: colors.body, fontSize: 14, lineHeight: 20 },
  rowTextChecked: { color: colors.ink, fontWeight: "700" },

  footer: { paddingTop: 8, paddingHorizontal: 24 }
});
