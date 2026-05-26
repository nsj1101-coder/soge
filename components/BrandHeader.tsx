import { Image, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors } from "@/constants/colors";

const logoMark = require("../img/flr_lv.png");

type Props = {
  right?: React.ReactNode;
  style?: ViewStyle;
};

export function BrandHeader({ right, style }: Props) {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.brand}>
        <Image source={logoMark} style={styles.mark} resizeMode="contain" />
        <Text style={styles.text}>백애</Text>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 6
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  mark: { width: 34, height: 34 },
  text: { color: colors.blushDark, fontSize: 20, fontWeight: "800", letterSpacing: 1 }
});
