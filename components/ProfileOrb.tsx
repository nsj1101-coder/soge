import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/colors";

type ProfileOrbProps = {
  initial: string;
  size?: number;
};

export const ProfileOrb = ({ initial, size = 92 }: ProfileOrbProps) => (
  <View style={[styles.orb, { width: size, height: size, borderRadius: size / 2 }]}>
    <Text style={[styles.initial, { fontSize: Math.max(24, size * 0.34) }]}>{initial}</Text>
  </View>
);

const styles = StyleSheet.create({
  orb: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceWarm,
    borderWidth: 2,
    borderColor: colors.blushLight
  },
  initial: {
    color: colors.blushDark,
    fontWeight: "700"
  }
});
