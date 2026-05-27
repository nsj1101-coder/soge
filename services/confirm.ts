import { Alert, Platform } from "react-native";
import { toast } from "@/components/Toast";

export const confirm = (
  title: string,
  message: string,
  okLabel = "확인",
  destructive = false
): Promise<boolean> => {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "취소", style: "cancel", onPress: () => resolve(false) },
      {
        text: okLabel,
        style: destructive ? "destructive" : "default",
        onPress: () => resolve(true)
      }
    ]);
  });
};

const ERROR_HINTS = ["실패", "오류", "에러", "잠깐", "안 돼", "거절"];

export const notify = (title: string, message?: string): void => {
  const text = message === undefined ? title : message;
  const isError = ERROR_HINTS.some((hint) => title.includes(hint) || (message ?? "").includes(hint));
  toast(text, isError ? "error" : "info");
};
