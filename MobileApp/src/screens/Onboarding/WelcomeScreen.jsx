import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ROUTES from "../../constants/routes";

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <StatusBar style="dark" />
      <View className="flex-1 px-7 py-8 justify-between items-center">
        {/* Empty top spacing for visual balance */}
        <View />

        {/* Center Hero Branding */}
        <View className="items-center w-full px-4">
          {/* Logo Badge */}
          <View
            className="w-24 h-24 rounded-[32px] bg-[#2563EB] items-center justify-center mb-6"
            style={{
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <Ionicons name="car-sport" size={46} color="#FFFFFF" />
          </View>

          {/* App Title & Welcome Header */}
          <Text className="text-4xl font-extrabold text-[#0F172A] tracking-tight text-center">
            Welcome to Fleev
          </Text>

          <Text className="text-base text-[#64748B] text-center leading-7 mt-3 px-6">
            Smart fleet management & vehicle operations platform for modern transport teams.
          </Text>
        </View>

        {/* Bottom Action Section */}
        <View className="w-full flex-col gap-3.5 mb-4">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate(ROUTES.PURCHASE)}
            className="h-14 w-full rounded-[22px] bg-[#2563EB] items-center justify-center flex-row"
            style={{
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <Text className="text-white text-base font-extrabold mr-2">
              Continue
            </Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate(ROUTES.LOGIN)}
            className="items-center py-2"
          >
            <Text className="text-sm font-medium text-[#64748B]">
              Already have an account?{" "}
              <Text className="font-extrabold text-[#2563EB]">Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
