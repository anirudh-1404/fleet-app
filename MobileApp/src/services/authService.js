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

  verifyLoginOtp: async (email, otp) => {
    const response = await api.post("/auth/verify-login-otp", { email, otp });
    const { token, role, user } = response.data;

    if (token) {
      await AsyncStorage.setItem("fleet_user_token", token);
      await AsyncStorage.setItem("fleet_user_data", JSON.stringify(user));
    }

    return response.data;
  },

  register: async (name, email, password, phone, role = "manager") => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      phone,
      role,
    });
    return response.data;
  },

  sendOtp: async (email, type = "register", module) => {
    const response = await api.post("/auth/send-otp", { email, type, module });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await api.post("/auth/verify-otp", { email, otp });
    return response.data;
  },

  forgotPasswordSendOtp: async (email) => {
    const response = await api.post("/auth/forgot-password/send-otp", { email });
    return response.data;
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await api.post("/auth/forgot-password/reset", {
      email,
      otp,
      newPassword,
    });
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
