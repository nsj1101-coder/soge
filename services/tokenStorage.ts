import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "soge.authToken";

export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setStoredToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const clearStoredToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};
