import { router } from "expo-router";
import { Image, ImageBackground, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { colors } from "@/constants/colors";

const bgImage = require("../img/main.png");
const logoImage = require("../img/logo.png");

export default function OnboardingScreen() {
  return (
    <ImageBackground source={bgImage} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.screen}>
        <View style={styles.hero}>
          <View style={styles.logoCard}>
            <Image source={logoImage} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.copy}>사진보다 마음이 먼저,{"\n"}가치관으로 시작하는 사랑</Text>
        </View>

        <View style={styles.footer}>
          <AppButton label="백애 시작하기" onPress={() => router.push("/auth")} />
          <Text style={styles.loginText}>
            이미 계정이 있으신가요?{" "}
            <Text style={styles.loginLink}>로그인</Text>
          </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    overflow: "hidden"
  },
  screen: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 36
  },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 18
  },
  logoCard: {
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.82)",
    shadowColor: "#C95F70",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4
  },
  logo: {
    width: 200,
    height: 200
  },
  copy: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 26,
    textAlign: "center",
    opacity: 0.85
  },
  footer: {
    gap: 16
  },
  loginText: {
    color: colors.muted,
    textAlign: "center",
    fontSize: 13
  },
  loginLink: {
    color: colors.blushDark,
    fontWeight: "700"
  }
});
