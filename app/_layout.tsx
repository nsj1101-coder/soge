import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppStateProvider } from "@/state/AppStateProvider";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppStateProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="values" />
          <Stack.Screen name="match-success" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AppStateProvider>
    </GestureHandlerRootView>
  );
}
