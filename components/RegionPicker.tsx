import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ALL_REGIONS, REGIONS } from "@/data/regions";
import { colors } from "@/constants/colors";

type Props = {
  value: string;
  onChange: (next: string) => void;
};

export const RegionPicker = ({ value, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(value ? value.split(" ")[0] : null);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (q.length === 0) return null;
    const lower = q.toLowerCase();
    return ALL_REGIONS.filter((r) => r.toLowerCase().includes(lower)).slice(0, 60);
  }, [query]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const select = (region: string) => {
    onChange(region);
    close();
  };

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={styles.field}>
        <Ionicons name="location-outline" size={18} color={colors.muted} />
        <Text style={[styles.fieldText, !value && styles.fieldPlaceholder]} numberOfLines={1}>
          {value || "거주 지역을 선택해주세요"}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={close}>
        <View style={styles.modalRoot}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>지역 선택</Text>
              <Pressable onPress={close} hitSlop={10}>
                <Ionicons name="close" size={22} color={colors.ink} />
              </Pressable>
            </View>

            <View style={styles.searchBar}>
              <Ionicons name="search" size={16} color={colors.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="시/도, 시/군/구 검색"
                placeholderTextColor={colors.muted}
                style={styles.searchInput}
                autoFocus
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery("")} hitSlop={10}>
                  <Ionicons name="close-circle" size={18} color={colors.muted} />
                </Pressable>
              )}
            </View>

            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
              {filtered !== null ? (
                filtered.length === 0 ? (
                  <Text style={styles.empty}>검색 결과가 없어요</Text>
                ) : (
                  filtered.map((region) => (
                    <Pressable
                      key={region}
                      onPress={() => select(region)}
                      style={[styles.row, value === region && styles.rowSelected]}
                    >
                      <Text style={styles.rowText}>{region}</Text>
                      {value === region && <Ionicons name="checkmark" size={18} color={colors.blush} />}
                    </Pressable>
                  ))
                )
              ) : (
                REGIONS.map((g) => {
                  const isOpen = expanded === g.province;
                  return (
                    <View key={g.province}>
                      <Pressable
                        onPress={() => setExpanded(isOpen ? null : g.province)}
                        style={styles.provinceRow}
                      >
                        <Text style={styles.provinceText}>{g.province}</Text>
                        <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={colors.muted} />
                      </Pressable>
                      {isOpen && (
                        <View style={styles.districtList}>
                          {g.districts.map((d) => {
                            const full = `${g.province} ${d}`;
                            return (
                              <Pressable
                                key={full}
                                onPress={() => select(full)}
                                style={[styles.row, value === full && styles.rowSelected]}
                              >
                                <Text style={styles.rowText}>{d}</Text>
                                {value === full && <Ionicons name="checkmark" size={18} color={colors.blush} />}
                              </Pressable>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 50,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.surface
  },
  fieldText: { flex: 1, color: colors.ink, fontSize: 15, fontWeight: "600" },
  fieldPlaceholder: { color: colors.muted, fontWeight: "400" },

  modalRoot: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "82%",
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 12
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 12
  },
  sheetTitle: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surfaceWarm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 8
  },
  searchInput: { flex: 1, color: colors.ink, fontSize: 14 },
  list: { flexGrow: 0 },
  empty: { color: colors.muted, textAlign: "center", padding: 24, fontSize: 13 },
  provinceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  provinceText: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  districtList: { backgroundColor: colors.surfaceWarm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  rowSelected: { backgroundColor: colors.blushLight },
  rowText: { color: colors.ink, fontSize: 14, fontWeight: "500" }
});
