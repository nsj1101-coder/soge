import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { colors } from "@/constants/colors";

type TabIconName = keyof typeof Ionicons.glyphMap;

const tabIcon = (inactive: TabIconName, active: TabIconName) =>
  function Icon({ color, size, focused }: { color: string; size: number; focused: boolean }) {
    return <Ionicons name={focused ? active : inactive} color={color} size={size} />;
  };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.blushDark,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          height: 78,
          paddingBottom: 16,
          paddingTop: 8
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700"
        }
      }}
    >
      <Tabs.Screen
        name="search"
        options={{ title: "홈", tabBarIcon: tabIcon("search-outline", "search") }}
      />
      <Tabs.Screen
        name="hearts"
        options={{ title: "하트", tabBarIcon: tabIcon("heart-outline", "heart") }}
      />
      <Tabs.Screen
        name="chat"
        options={{ title: "채팅", tabBarIcon: tabIcon("chatbubble-outline", "chatbubble") }}
      />
      <Tabs.Screen
        name="shop"
        options={{ title: "상점", tabBarIcon: tabIcon("flower-outline", "flower") }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "마이", tabBarIcon: tabIcon("person-outline", "person") }}
      />
      <Tabs.Screen name="recommendations" options={{ href: null }} />
      <Tabs.Screen name="matches" options={{ href: null }} />
    </Tabs>
  );
}
