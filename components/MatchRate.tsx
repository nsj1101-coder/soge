import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/colors";

type MatchRateProps = {
  rate: number;
};

const getRateColor = (rate: number): string => {
  if (rate >= 80) return colors.blushDark;
  if (rate >= 60) return colors.warning;
  return colors.muted;
};

export const MatchRate = ({ rate }: MatchRateProps) => {
  const rateColor = getRateColor(rate);
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: rateColor }]}>가치관 매칭률</Text>
      <Text style={[styles.rate, { color: rateColor }]}>{rate}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.blushLight,
    backgroundColor: colors.surfaceWarm,
    paddingVertical: 18,
    paddingHorizontal: 28
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4
  },
  rate: {
    marginTop: 2,
    fontSize: 48,
    fontWeight: "800"
  }
});
