import { router } from "expo-router";
import { useEffect } from "react";
import { Image, ImageBackground, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { colors } from "@/constants/colors";
import { useAppState } from "@/state/AppStateProvider";

const bgImage = require("../img/main.png");
const logoImage = require("../img/logo.png");

export default function IntroScreen() {
  const { isAuthenticated, ready } = useAppState();

  useEffect(() => {
    if (ready && isAuthenticated) {
      router.replace("/(tabs)/search");
    }
  }, [ready, isAuthenticated]);

  return (
    <ImageBackground source={bgImage} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.screen}>
        <View style={styles.hero}>
          <View style={styles.logoCard}>
            <Image source={logoImage} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.appName}>백애</Text>
          <Text style={styles.copy}>사진보다 마음이 먼저,{"\n"}가치관으로 시작하는 사랑</Text>
        </View>

        <View style={styles.footer}>
          <AppButton label="가입하기" onPress={() => router.push("/signup")} />
          <AppButton label="로그인" variant="secondary" onPress={() => router.push("/login")} />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, overflow: "hidden" },
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
    gap: 14
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
  logo: { width: 180, height: 180 },
  appName: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 2
  },
  copy: {
    color: colors.body,
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    opacity: 0.85
  },
  footer: { gap: 12, paddingHorizontal: 12 }
});
