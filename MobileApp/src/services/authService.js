import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const authService = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token, role, user } = response.data;

    if (token) {
      await AsyncStorage.setItem("fleet_user_token", token);
      await AsyncStorage.setItem("fleet_user_data", JSON.stringify(user));
    }

    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem("fleet_user_token");
    await AsyncStorage.removeItem("fleet_user_data");
  },

  getStoredUser: async () => {
    const json = await AsyncStorage.getItem("fleet_user_data");
    const token = await AsyncStorage.getItem("fleet_user_token");
    return {
      user: json ? JSON.parse(json) : null,
      token,
    };
  },
};
