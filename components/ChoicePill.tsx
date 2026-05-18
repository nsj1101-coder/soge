import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "@/constants/colors";

type ChoicePillProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

export const ChoicePill = ({ label, selected = false, onPress }: ChoicePillProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ selected }}
    onPress={onPress}
    style={({ pressed }) => [styles.pill, selected && styles.selected, pressed && styles.pressed]}
  >
    <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  pill: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: "center"
  },
  selected: {
    borderColor: colors.blush,
    backgroundColor: colors.surfaceWarm
  },
  pressed: {
    opacity: 0.72
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600"
  },
  selectedLabel: {
    color: colors.blushDark,
    fontWeight: "700"
  }
});
