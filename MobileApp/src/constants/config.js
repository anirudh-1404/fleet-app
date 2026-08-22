import { Platform } from "react-native";
import Constants from "expo-constants";

export const getBackendHost = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Derive host IP from Expo's dev server hostUri (e.g. "192.168.1.15:8081" -> "192.168.1.15")
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(":")[0];
    if (hostIp && hostIp !== "localhost" && hostIp !== "127.0.0.1") {
      return `http://${hostIp}:8000`;
    }
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000";
  }

  return "http://localhost:8000";
};

export const SERVER_URL = getBackendHost();
export const API_BASE_URL = `${SERVER_URL}/api`;
