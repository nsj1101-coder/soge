import { Platform, ViewStyle } from "react-native";

export const colors = {
  background: "#FFF9F6",
  surface: "#FFFFFF",
  surfaceWarm: "#FFF1F3",
  blush: "#D96B7C",
  blushDark: "#C95F70",
  blushLight: "#F7DDE2",
  ink: "#222222",
  body: "#444444",
  muted: "#777777",
  disabled: "#B8B8B8",
  line: "#F0E4E2",
  inputBorder: "#E8DDDA",
  chatBubble: "#F1EDEA",
  infoBanner: "#FFF1E3",
  infoBannerBorder: "#F2DEC8",
  infoBannerText: "#7A5A4A",
  success: "#5B9279",
  warning: "#E6A15D"
} as const;

export const shadow = Platform.select<ViewStyle>({
  web: {
    boxShadow: "0px 8px 24px rgba(80, 50, 50, 0.08)"
  },
  default: {
    shadowColor: "#503232",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4
  }
});
