import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, shadow } from "@/constants/colors";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  style?: ViewStyle;
};

export const AppButton = ({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  style
}: AppButtonProps) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [
      styles.base,
      variant === "secondary" && styles.secondary,
      variant === "ghost" && styles.ghost,
      disabled && styles.disabled,
      pressed && !disabled && styles.pressed,
      style
    ]}
  >
    {variant === "primary" && !disabled && (
      <LinearGradient
        colors={["#E27A8B", "#D96B7C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
    )}
    <Text style={[styles.label, variant !== "primary" && styles.secondaryLabel, disabled && styles.disabledLabel]}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    overflow: "hidden",
    ...shadow
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line
  },
  ghost: {
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.88
  },
  disabled: {
    backgroundColor: colors.line,
    shadowOpacity: 0,
    elevation: 0
  },
  label: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
    zIndex: 1
  },
  secondaryLabel: {
    color: colors.blushDark
  },
  disabledLabel: {
    color: colors.muted
  }
});
