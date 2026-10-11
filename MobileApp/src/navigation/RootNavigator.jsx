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

// Nested Stacks
import ManagerNavigator from "./ManagerNavigator";
import DriverNavigator from "./DriverNavigator";
import RentalNavigator from "./RentalNavigator";
import WorkshopNavigator from "./WorkshopNavigator";
import WorkshopEmployeeNavigator from "./WorkshopEmployeeNavigator";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const getInitialRoute = () => {
    if (!user || !role) return ROUTES.WELCOME;
    if (role === "workshop_manager") return "WorkshopStack";
    if (role === "workshop_employee") return "WorkshopEmployeeStack";
    if (role === "manager") return "ManagerStack";
    if (role === "rental_owner") return "RentalStack";
    if (role === "driver") return "DriverStack";
    return ROUTES.WELCOME;
  };

  return (
    <Stack.Navigator
      key={user ? `auth_${user.id || user._id || role}` : "guest"}
      screenOptions={{ headerShown: false }}
      initialRouteName={getInitialRoute()}
    >
      <Stack.Screen name={ROUTES.WELCOME} component={WelcomeScreen} />
      <Stack.Screen name={ROUTES.PURCHASE} component={PurchaseScreen} />
      <Stack.Screen name={ROUTES.CHECKOUT} component={CheckoutScreen} />
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
      <Stack.Screen name="WorkshopStack" component={WorkshopNavigator} />
      <Stack.Screen name="WorkshopEmployeeStack" component={WorkshopEmployeeNavigator} />
      <Stack.Screen name="ManagerStack" component={ManagerNavigator} />
      <Stack.Screen name="RentalStack" component={RentalNavigator} />
      <Stack.Screen name="DriverStack" component={DriverNavigator} />
    </Stack.Navigator>
  );
}
