import Constants from "expo-constants";

const fromExtra = (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl;

export const API_BASE_URL = fromExtra ?? "http://116.124.128.70";
