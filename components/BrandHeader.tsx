import { Image, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors } from "@/constants/colors";

const logoMark = require("../img/flr_lv.png");

type Props = {
  right?: React.ReactNode;
  left?: React.ReactNode;
  style?: ViewStyle;
};

export function BrandHeader({ right, left, style }: Props) {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.side}>{left}</View>
      <View style={styles.brand}>
        <Image source={logoMark} style={styles.mark} resizeMode="contain" />
        <Text style={styles.text}>백애</Text>
      </View>
      <View style={[styles.side, styles.sideRight]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 6
  },
  side: { minWidth: 56, flexDirection: "row", alignItems: "center" },
  sideRight: { justifyContent: "flex-end" },
  brand: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  mark: { width: 32, height: 32 },
  text: { color: colors.blushDark, fontSize: 20, fontWeight: "800", letterSpacing: 1 }
});
