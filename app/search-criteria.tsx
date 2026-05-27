import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { SubPageHeader } from "@/components/SubPageHeader";
import { colors } from "@/constants/colors";
import { REGIONS } from "@/data/regions";
import { useAppState } from "@/state/AppStateProvider";

const GENDER_OPTIONS = ["여성", "남성"];
const PROVINCES = REGIONS.map((r) => r.province);
const YEAR_MIN = 1960;
const YEAR_MAX = 2010;

export default function SearchCriteriaScreen() {
  const {
    selectedSearchGender,
    setSelectedSearchGender,
    selectedSearchBirthYearMin,
    setSelectedSearchBirthYearMin,
    selectedSearchBirthYearMax,
    setSelectedSearchBirthYearMax,
    selectedSearchRegions,
    setSelectedSearchRegions,
    selectedSearchValues
  } = useAppState();

  const toggleRegion = (province: string) => {
    setSelectedSearchRegions(
      selectedSearchRegions.includes(province)
        ? selectedSearchRegions.filter((r) => r !== province)
        : [...selectedSearchRegions, province]
    );
  };

  const onMinChange = (val: number) => {
    const v = Math.round(val);
    setSelectedSearchBirthYearMin(v);
    if (v > selectedSearchBirthYearMax) setSelectedSearchBirthYearMax(v);
  };
  const onMaxChange = (val: number) => {
    const v = Math.round(val);
    setSelectedSearchBirthYearMax(v);
    if (v < selectedSearchBirthYearMin) setSelectedSearchBirthYearMin(v);
  };

  return (
    <Screen scroll={false} style={styles.screen}>
      <View style={styles.headerWrap}>
        <SubPageHeader title="서치 기준 설정" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>성별</Text>
        <View style={styles.chipsRow}>
          <Pressable
            onPress={() => setSelectedSearchGender(null)}
            style={[styles.chip, selectedSearchGender === null && styles.chipChecked]}
          >
            <Text style={[styles.chipText, selectedSearchGender === null && styles.chipTextChecked]}>무관</Text>
          </Pressable>
          {GENDER_OPTIONS.map((g) => (
            <Pressable
              key={g}
              onPress={() => setSelectedSearchGender(g)}
              style={[styles.chip, selectedSearchGender === g && styles.chipChecked]}
            >
              <Text style={[styles.chipText, selectedSearchGender === g && styles.chipTextChecked]}>{g}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>출생연도</Text>
        <Text style={styles.sectionSub}>{selectedSearchBirthYearMin}년 ~ {selectedSearchBirthYearMax}년생</Text>
        <View style={styles.sliderBlock}>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>최소</Text>
            <Slider
              style={styles.slider}
              minimumValue={YEAR_MIN}
              maximumValue={YEAR_MAX}
              step={1}
              value={selectedSearchBirthYearMin}
              onValueChange={onMinChange}
              minimumTrackTintColor={colors.blush}
              maximumTrackTintColor={colors.line}
              thumbTintColor={colors.blush}
            />
            <Text style={styles.sliderVal}>{selectedSearchBirthYearMin}</Text>
          </View>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>최대</Text>
            <Slider
              style={styles.slider}
              minimumValue={YEAR_MIN}
              maximumValue={YEAR_MAX}
              step={1}
              value={selectedSearchBirthYearMax}
              onValueChange={onMaxChange}
              minimumTrackTintColor={colors.blush}
              maximumTrackTintColor={colors.line}
              thumbTintColor={colors.blush}
            />
            <Text style={styles.sliderVal}>{selectedSearchBirthYearMax}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>지역</Text>
        <Text style={styles.sectionSub}>여러 개 선택 가능 · 선택 없으면 무관</Text>
        <View style={styles.chipsRow}>
          {PROVINCES.map((p) => {
            const checked = selectedSearchRegions.includes(p);
            return (
              <Pressable
                key={p}
                onPress={() => toggleRegion(p)}
                style={[styles.chip, checked && styles.chipChecked]}
              >
                <Text style={[styles.chipText, checked && styles.chipTextChecked]}>{p}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>가치관</Text>
        <Text style={styles.sectionSub}>최대 5개 · 매칭 점수 산정에 사용돼요</Text>
        <Pressable onPress={() => router.push("/search-values")} style={styles.valuesPickerBtn}>
          <Ionicons name="options-outline" size={18} color={colors.ink} />
          <Text style={styles.valuesPickerText}>
            {selectedSearchValues.length === 0 ? "가치관 선택" : "가치관 변경"}
          </Text>
          <View style={styles.valuesPickerCount}>
            <Text style={styles.valuesPickerCountText}>{selectedSearchValues.length}/5</Text>
          </View>
        </Pressable>

        {selectedSearchValues.length > 0 && (
          <View style={styles.selectedValuesWrap}>
            {selectedSearchValues.map((v) => (
              <View key={v} style={styles.selectedValueChip}>
                <Text style={styles.selectedValueText} numberOfLines={1}>{v}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0, paddingTop: 8, paddingBottom: 16 },
  headerWrap: { paddingHorizontal: 24 },
  content: { paddingHorizontal: 24, paddingBottom: 32, gap: 8 },

  sectionTitle: { color: colors.ink, fontSize: 15, fontWeight: "800", marginTop: 14 },
  sectionSub: { color: colors.muted, fontSize: 12, marginBottom: 2 },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4, marginBottom: 6 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  chipChecked: { borderColor: colors.blush, backgroundColor: colors.blushLight },
  chipText: { color: colors.body, fontSize: 13, fontWeight: "600" },
  chipTextChecked: { color: colors.blushDark, fontWeight: "800" },

  sliderBlock: { gap: 6, marginTop: 4 },
  sliderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sliderLabel: { color: colors.muted, fontSize: 12, fontWeight: "700", width: 32 },
  slider: { flex: 1, height: 36 },
  sliderVal: { color: colors.blushDark, fontSize: 13, fontWeight: "800", width: 48, textAlign: "right" },

  valuesPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    marginTop: 6
  },
  valuesPickerText: { flex: 1, color: colors.ink, fontSize: 15, fontWeight: "700" },
  valuesPickerCount: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: colors.blushLight
  },
  valuesPickerCountText: { color: colors.blushDark, fontSize: 12, fontWeight: "800" },
  selectedValuesWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  selectedValueChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: colors.blushLight,
    maxWidth: "100%"
  },
  selectedValueText: { color: colors.blushDark, fontSize: 12, fontWeight: "700" }
});
