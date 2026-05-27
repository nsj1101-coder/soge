import { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  style?: ViewStyle;
  edges?: { top?: boolean; bottom?: boolean };
}>;

export const Screen = ({ children, scroll = true, style, edges }: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const topPad = edges?.top === false ? 0 : insets.top;
  const bottomPad = edges?.bottom === false ? 0 : insets.bottom;
  const safePadStyle = { paddingTop: topPad, paddingBottom: bottomPad };

  if (!scroll) {
    return (
      <View style={[styles.safeArea, safePadStyle]}>
        <View style={[styles.content, style]}>{children}</View>
      </View>
    );
  }

  return (
    <View style={[styles.safeArea, safePadStyle]}>
      <ScrollView contentContainerStyle={[styles.content, style]} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 22
  }
});
