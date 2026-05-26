import { Alert, Platform } from "react-native";

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

export const notify = (title: string, message?: string): void => {
  if (Platform.OS === "web") {
    window.alert(message === undefined ? title : `${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
};
