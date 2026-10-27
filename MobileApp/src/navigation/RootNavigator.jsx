import React from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ROUTES from "@constants/routes";
import { useAuth } from "../context/AuthContext";

// Screens
import WelcomeScreen from "@screens/Onboarding/WelcomeScreen";
import PurchaseScreen from "@screens/Onboarding/PurchaseScreen";
import CheckoutScreen from "@screens/Onboarding/CheckoutScreen";
import LoginScreen from "@screens/Auth/LoginScreen";
import ForgotPasswordScreen from "@screens/Auth/ForgotPasswordScreen";
import OtpVerificationScreen from "@screens/Auth/OtpVerificationScreen";

import ModuleSelectionScreen from "@screens/Auth/ModuleSelectionScreen";

// Nested Stacks
import ManagerNavigator from "./ManagerNavigator";
import DriverNavigator from "./DriverNavigator";
import RentalNavigator from "./RentalNavigator";
import WorkshopNavigator from "./WorkshopNavigator";
import WorkshopEmployeeNavigator from "./WorkshopEmployeeNavigator";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, token, role, modules, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  const isAuthenticated = Boolean(user && token);

  const getAuthenticatedInitialRoute = () => {
    // If user has multiple modules, open ModuleSelection on fresh login
    if (modules && modules.length > 1 && !role) {
      return ROUTES.MODULE_SELECTION;
    }
    if (role === "workshop_manager") return "WorkshopStack";
    if (role === "workshop_employee") return "WorkshopEmployeeStack";
    if (role === "manager") return "ManagerStack";
    if (role === "rental_owner") return "RentalStack";
    if (role === "driver") return "DriverStack";
    if (modules && modules.length > 1) return ROUTES.MODULE_SELECTION;
    return "ManagerStack";
  };

  return (
    <Stack.Navigator
      key={isAuthenticated ? `auth_${user?._id || user?.id}_${role}` : "guest"}
      screenOptions={{ headerShown: false }}
      initialRouteName={isAuthenticated ? getAuthenticatedInitialRoute() : ROUTES.WELCOME}
    >
      {isAuthenticated ? (
        // Authenticated Stack
        <>
          <Stack.Screen name={ROUTES.MODULE_SELECTION} component={ModuleSelectionScreen} />
          <Stack.Screen name="ManagerStack" component={ManagerNavigator} />
          <Stack.Screen name="WorkshopStack" component={WorkshopNavigator} />
          <Stack.Screen name="WorkshopEmployeeStack" component={WorkshopEmployeeNavigator} />
          <Stack.Screen name="RentalStack" component={RentalNavigator} />
          <Stack.Screen name="DriverStack" component={DriverNavigator} />
        </>
      ) : (
        // Guest / Onboarding Stack
        <>
          <Stack.Screen name={ROUTES.WELCOME} component={WelcomeScreen} />
          <Stack.Screen name={ROUTES.PURCHASE} component={PurchaseScreen} />
          <Stack.Screen name={ROUTES.CHECKOUT} component={CheckoutScreen} />
          <Stack.Screen name={ROUTES.VERIFY_OTP} component={OtpVerificationScreen} />
          <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
          <Stack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

