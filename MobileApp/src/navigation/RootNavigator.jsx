import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ROUTES from "@constants/routes";

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
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={ROUTES.WELCOME}>
      <Stack.Screen name={ROUTES.WELCOME} component={WelcomeScreen} />
      <Stack.Screen name={ROUTES.PURCHASE} component={PurchaseScreen} />
      <Stack.Screen name={ROUTES.CHECKOUT} component={CheckoutScreen} />
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
      <Stack.Screen name="ManagerStack" component={ManagerNavigator} />
      <Stack.Screen name="DriverStack" component={DriverNavigator} />
      <Stack.Screen name="RentalStack" component={RentalNavigator} />
      <Stack.Screen name="WorkshopStack" component={WorkshopNavigator} />
      <Stack.Screen name="WorkshopEmployeeStack" component={WorkshopEmployeeNavigator} />
    </Stack.Navigator>
  );
}
