import React, { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      setIsLoading(true);
      const { user: storedUser, token: storedToken } = await authService.getStoredUser();
      if (storedToken && storedUser) {
        setUser(storedUser);
        setToken(storedToken);
        setRole(storedUser.role);
        // Validate with backend in background
        try {
          const freshUser = await authService.getMe();
          if (freshUser) {
            setUser(freshUser);
            setRole(freshUser.role);
          }
        } catch (e) {
          if (e.response && e.response.status === 401) {
            console.warn("Auth token expired (401), clearing stored session");
            await authService.logout();
            setUser(null);
            setToken(null);
            setRole(null);
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

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      setToken(data.token);
      setRole(data.role);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setToken(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isLoading,
        login,
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
