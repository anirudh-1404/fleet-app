import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ROUTES from "@constants/routes";
import WelcomeScreen from "@screens/Onboarding/WelcomeScreen";
import PurchaseScreen from "@screens/Onboarding/PurchaseScreen";
import CheckoutScreen from "@screens/Onboarding/CheckoutScreen";
import LoginScreen from "@screens/Auth/LoginScreen";
import ForgotPasswordScreen from "@screens/Auth/ForgotPasswordScreen";
import OtpVerificationScreen from "@screens/Auth/OtpVerificationScreen";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName={ROUTES.WELCOME} screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.WELCOME} component={WelcomeScreen} />
      <Stack.Screen name={ROUTES.PURCHASE} component={PurchaseScreen} />
      <Stack.Screen name={ROUTES.CHECKOUT} component={CheckoutScreen} />
      <Stack.Screen name={ROUTES.VERIFY_OTP} component={OtpVerificationScreen} />
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}
