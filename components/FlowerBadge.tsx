import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/colors";

const flowerImg = require("../img/flr2.png");

type FlowerBadgeProps = {
  count: number;
  compact?: boolean;
};

export const FlowerBadge = ({ count, compact = false }: FlowerBadgeProps) => (
  <View style={[styles.badge, compact && styles.compact]}>
    <Image source={flowerImg} style={[styles.icon, compact && styles.iconCompact]} resizeMode="contain" />
    <Text style={[styles.text, compact && styles.textCompact]}>백애 {count}송이</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  compact: {
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  icon: {
    width: 22,
    height: 22
  },
  iconCompact: {
    width: 18,
    height: 18
  },
  text: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700"
  },
  textCompact: {
    fontSize: 12
  }
});
