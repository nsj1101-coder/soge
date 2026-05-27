import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastHost } from "@/components/Toast";
import { AppStateProvider, useAppState } from "@/state/AppStateProvider";
import { colors } from "@/constants/colors";

const isWeb = Platform.OS === "web";

function AuthGate() {
  const { ready, isAuthenticated, profile } = useAppState();
  const segments = useSegments();
  const router = useRouter();

  const needsOnboarding =
    profile !== null &&
    (profile.gender === null || profile.birthYear === null || profile.region.length === 0);

  useEffect(() => {
    if (!ready) return;
    const root = segments[0];
    const inTabs = root === "(tabs)";
    const onOnboarding = root === "onboarding";
    const onAuthFlow = root === "login" || root === "signup" || root === undefined;

    if (!isAuthenticated && inTabs) {
      router.replace("/");
      return;
    }
    if (isAuthenticated && needsOnboarding && (inTabs || onAuthFlow)) {
      router.replace("/onboarding");
      return;
    }
    if (isAuthenticated && !needsOnboarding && (onOnboarding || onAuthFlow)) {
      router.replace("/(tabs)/search");
    }
  }, [ready, isAuthenticated, needsOnboarding, segments, router]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.blush} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="values" />
      <Stack.Screen name="match-success" />
      <Stack.Screen name="chat-detail" />
      <Stack.Screen name="store" />
      <Stack.Screen name="profile-edit" />
      <Stack.Screen name="search-criteria" />
      <Stack.Screen name="search-values" />
      <Stack.Screen name="no-acquaintance" />
      <Stack.Screen name="account" />
      <Stack.Screen name="help" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="candidate/[id]" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <View style={styles.webBackdrop}>
          <View style={styles.frame}>
            <AppStateProvider>
              <StatusBar style="dark" />
              <AuthGate />
              <ToastHost />
            </AppStateProvider>
          </View>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  webBackdrop: {
    flex: 1,
    backgroundColor: isWeb ? colors.surfaceWarm : colors.background,
    alignItems: "center"
  },
  frame: {
    flex: 1,
    width: "100%",
    maxWidth: isWeb ? 480 : undefined,
    backgroundColor: colors.background,
    ...(isWeb && {
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 4 }
    })
  }
});
