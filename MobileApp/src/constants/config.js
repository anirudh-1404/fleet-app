import { Platform } from "react-native";
import Constants from "expo-constants";

export const getBackendHost = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Derive host IP from Expo dev server manifests across various Expo SDK versions
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost;

  if (hostUri) {
    const hostIp = hostUri.split(":")[0];
    if (hostIp && hostIp !== "localhost" && hostIp !== "127.0.0.1") {
      return `http://${hostIp}:8000`;
    }
  }

  // Fallback to linkingUri / experienceUrl if present (e.g., exp://192.168.0.141:8081)
  const expUrl = Constants.linkingUri || Constants.experienceUrl;
  if (expUrl && typeof expUrl === "string") {
    const match = expUrl.match(/:\/\/([^:/]+)/);
    if (match && match[1] && match[1] !== "localhost" && match[1] !== "127.0.0.1") {
      return `http://${match[1]}:8000`;
    }
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000";
  }

  return "http://localhost:8000";
};

export const SERVER_URL = getBackendHost();
export const API_BASE_URL = `${SERVER_URL}/api`;

