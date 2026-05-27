import { useEffect, useRef, useState } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/colors";

type ToastKind = "info" | "error" | "success";
type ToastItem = { id: number; message: string; kind: ToastKind };

let counter = 0;
let items: ToastItem[] = [];
const listeners = new Set<(items: ToastItem[]) => void>();

const broadcast = (next: ToastItem[]) => {
  items = next;
  for (const fn of listeners) fn(items);
};

export const toast = (message: string, kind: ToastKind = "info"): void => {
  const id = ++counter;
  broadcast([...items, { id, message, kind }]);
  setTimeout(() => {
    broadcast(items.filter((i) => i.id !== id));
  }, 2400);
};

const Bubble = ({ item }: { item: ToastItem }) => {
  const translateY = useRef(new Animated.Value(-30)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true })
    ]).start();
    const exit = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true })
      ]).start();
    }, 2000);
    return () => clearTimeout(exit);
  }, [translateY, opacity]);

  const bg =
    item.kind === "error"
      ? "#3b1d22"
      : item.kind === "success"
        ? "#1f3a2c"
        : "#1f2230";

  return (
    <Animated.View style={[styles.bubble, { backgroundColor: bg, opacity, transform: [{ translateY }] }]}>
      <Text style={styles.text} numberOfLines={3}>{item.message}</Text>
    </Animated.View>
  );
};

export const ToastHost = () => {
  const [list, setList] = useState<ToastItem[]>(items);

  useEffect(() => {
    listeners.add(setList);
    return () => {
      listeners.delete(setList);
    };
  }, []);

  if (list.length === 0) return null;

  return (
    <View pointerEvents="none" style={styles.host}>
      {list.map((item) => (
        <Bubble key={item.id} item={item} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    top: Platform.OS === "android" ? 34 : 54,
    left: 16,
    right: 16,
    gap: 8,
    alignItems: "center",
    zIndex: 1000
  },
  bubble: {
    maxWidth: 460,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  },
  text: { color: "#fff", fontSize: 13, fontWeight: "700", textAlign: "center" }
});
