import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@constants/config";

export { API_BASE_URL };

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 45000,
});

// Attach Auth Bearer token to every request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("fleet_user_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Error reading auth token from storage", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on unauthorized response
      await AsyncStorage.removeItem("fleet_user_token");
      await AsyncStorage.removeItem("fleet_user_data");
    } else if (error.code === "ECONNABORTED" || (error.message && error.message.includes("timeout"))) {
      console.warn("[API Timeout] Backend is waking up from idle state. Extending wait window.");
      error.message = "Server is warming up. Please tap again to proceed.";
    } else if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
      console.warn(
        `[API Network Error] Could not reach backend at ${API_BASE_URL}. Ensure backend server is running and device is on the same network.`
      );
    }
    return Promise.reject(error);
  }
);

export default api;
