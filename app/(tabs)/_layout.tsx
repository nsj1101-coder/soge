import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { colors } from "@/constants/colors";

type TabIconName = keyof typeof Ionicons.glyphMap;

const tabIcon = (name: TabIconName) =>
  function Icon({ color, size }: { color: string; size: number }) {
    return <Ionicons name={name} color={color} size={size} />;
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
        name="recommendations"
        options={{ title: "오늘의 추천", tabBarIcon: tabIcon("heart-outline") }}
      />
      <Tabs.Screen name="matches" options={{ title: "매칭", tabBarIcon: tabIcon("flower-outline") }} />
      <Tabs.Screen name="chat" options={{ title: "채팅", tabBarIcon: tabIcon("chatbubble-outline") }} />
      <Tabs.Screen name="profile" options={{ title: "마이페이지", tabBarIcon: tabIcon("person-outline") }} />
    </Tabs>
  );
}
