import React, { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../services/authService";

import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      setIsLoading(true);
      const { user: storedUser, token: storedToken } = await authService.getStoredUser();
      const savedActiveRole = await AsyncStorage.getItem("fleet_active_role");

      if (storedToken && storedUser) {
        const userModules = storedUser.modules && storedUser.modules.length > 0
          ? storedUser.modules
          : [storedUser.role];
        setModules(userModules);

        const effectiveRole = (savedActiveRole && userModules.includes(savedActiveRole))
          ? savedActiveRole
          : (storedUser.role || userModules[0]);

        setUser(storedUser);
        setToken(storedToken);
        setRole(effectiveRole);

        // Validate with backend in background
        try {
          const freshUser = await authService.getMe();
          if (freshUser) {
            const freshModules = freshUser.modules && freshUser.modules.length > 0
              ? freshUser.modules
              : [freshUser.role];
            setUser(freshUser);
            setModules(freshModules);
            if (!freshModules.includes(effectiveRole)) {
              setRole(freshUser.role || freshModules[0]);
            }
          }
        } catch (e) {
          if (e.response && e.response.status === 401) {
            console.warn("Auth token expired (401), clearing stored session");
            await authService.logout();
            await AsyncStorage.removeItem("fleet_active_role");
            setUser(null);
            setToken(null);
            setRole(null);
            setModules([]);
          } else {
            console.warn("Could not reach backend to revalidate token, keeping cached auth session:", e.message);
          }
        }
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [hasSignedOut, setHasSignedOut] = useState(false);

  const setAuthSession = async (userData, tokenString, activeRole, userModules) => {
    const mods = userModules && userModules.length > 0 ? userModules : [activeRole || userData?.role];
    const roleToSet = activeRole || userData?.role || mods[0];

    setHasSignedOut(false);
    setUser(userData);
    setToken(tokenString);
    setRole(roleToSet);
    setModules(mods);

    if (tokenString) {
      await AsyncStorage.setItem("fleet_user_token", tokenString);
      await AsyncStorage.setItem("fleet_user_data", JSON.stringify(userData));
      await AsyncStorage.setItem("fleet_active_role", roleToSet);
    }
  };

  const switchModule = async (newRole) => {
    setRole(newRole);
    await AsyncStorage.setItem("fleet_active_role", newRole);
  };

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    if (data.token) {
      const userMods = data.modules && data.modules.length > 0 ? data.modules : [data.role];
      await setAuthSession(data.user, data.token, data.role, userMods);
    }
    return data;
  };

  const verifyLoginOtp = async (email, otp) => {
    const data = await authService.verifyLoginOtp(email, otp);
    if (data.token) {
      const userMods = data.modules && data.modules.length > 0 ? data.modules : [data.role];
      await setAuthSession(data.user, data.token, data.role, userMods);
    }
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
      await AsyncStorage.removeItem("fleet_active_role");
      setHasSignedOut(true);
      setUser(null);
      setToken(null);
      setRole(null);
      setModules([]);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        modules,
        isLoading,
        hasSignedOut,
        resetSignOutFlag: () => setHasSignedOut(false),
        login,
        verifyLoginOtp,
        setAuthSession,
        switchModule,
        logout,
        refreshUser: loadStoredAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
