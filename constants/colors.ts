import { Platform, ViewStyle } from "react-native";

export const colors = {
  background: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceWarm: "#F7F7F7",
  surfaceSubtle: "#FAFAFA",
  blush: "#E26B7C",
  blushDark: "#C95F70",
  blushLight: "#FCE6EA",
  ink: "#111111",
  body: "#333333",
  muted: "#777777",
  disabled: "#C2C2C2",
  line: "#EBEBEB",
  inputBorder: "#DCDCDC",
  chatBubble: "#F2F2F2",
  infoBanner: "#F7F7F7",
  infoBannerBorder: "#E5E5E5",
  infoBannerText: "#444444",
  success: "#2F7B58",
  warning: "#D38B3E"
} as const;

export const shadow = Platform.select<ViewStyle>({
  web: {
    boxShadow: "0px 6px 18px rgba(0, 0, 0, 0.05)"
  },
  default: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 3
  }
});
