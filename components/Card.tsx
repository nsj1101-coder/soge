import { PropsWithChildren } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors, shadow } from "@/constants/colors";

type CardProps = PropsWithChildren<{
  style?: ViewStyle;
}>;

export const Card = ({ children, style }: CardProps) => <View style={[styles.card, style]}>{children}</View>;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    ...shadow
  }
});
