import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ROUTES from "../../constants/routes";

export default function PurchaseScreen() {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState("fleet");

  const handleProceedToCheckout = () => {
    navigation.navigate(ROUTES.CHECKOUT, { plan: selectedPlan });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#16092B]">
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: Platform.OS === "ios" ? 12 : 20,
          paddingBottom: 32,
          flexGrow: 1,
          justifyContent: "space-between",
        }}
      >
        <View>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mb-5"
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Title & Subtitle */}
          <Text className="text-3xl font-bold text-white tracking-tight">
            Select Plan
          </Text>
          <Text className="text-sm text-purple-200/70 mt-1 mb-6">
            Choose the module for your transport organization.
          </Text>

          {/* CARD 1: Fleet Management (Active) */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => setSelectedPlan("fleet")}
            className={`rounded-[24px] p-5 mb-4 border ${
              selectedPlan === "fleet"
                ? "bg-[#2D165B] border-[#9333EA]"
                : "bg-[#220E45] border-white/10"
            }`}
          >
            {/* Title & Checkmark */}
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1 pr-3">
                <Text className="text-lg font-bold text-white">
                  Fleet Management
                </Text>
                <Text className="text-xs text-purple-200/70 mt-0.5">
                  Full Operational Fleet Control
                </Text>
              </View>

              <View className="w-6 h-6 rounded-full bg-[#9333EA] items-center justify-center mt-0.5">
                <Ionicons name="checkmark" size={14} color="white" />
              </View>
            </View>

            {/* Price */}
            <View className="flex-row items-baseline mb-3">
              <Text className="text-3xl font-extrabold text-white">$149</Text>
              <Text className="text-xs text-purple-200/70 ml-1.5 font-medium">/ month</Text>
            </View>

            <View className="h-px bg-white/10 mb-3" />

            {/* Simple Bullets */}
            <View className="flex-col gap-2">
              <Text className="text-xs text-purple-100 font-medium">
                • Unlimited fleet vehicles & registration tracking
              </Text>
              <Text className="text-xs text-purple-100 font-medium">
                • Digital driver inspections & odometer logs
              </Text>
              <Text className="text-xs text-purple-100 font-medium">
                • Fuel entries, invoices & service alerts
              </Text>
              <Text className="text-xs text-purple-100 font-medium">
                • Real-time manager operations dashboard
              </Text>
            </View>
          </TouchableOpacity>

          {/* CARD 2: Vehicle Rental System (Coming Soon) */}
          <View className="rounded-[24px] p-5 bg-[#220E45]/40 border border-white/5 opacity-60">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base font-bold text-slate-300">
                Vehicle Rental System
              </Text>
              <View className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30">
                <Text className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                  Coming Soon
                </Text>
              </View>
            </View>

            <Text className="text-xs text-slate-400 leading-5">
              Commercial rental booking management, customer contracts, and automated invoicing.
            </Text>
          </View>
        </View>

        {/* Bottom Action Section */}
        <View className="mt-6 flex-col gap-3">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleProceedToCheckout}
            className="h-14 rounded-[20px] bg-[#9333EA] items-center justify-center flex-row shadow-md"
          >
            <Text className="text-white text-base font-bold mr-2">
              Continue to Account Setup
            </Text>
            <Ionicons name="arrow-forward" size={18} color="white" />
          </TouchableOpacity>

          {/* Driver Login Link */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate(ROUTES.LOGIN)}
            className="items-center py-2"
          >
            <Text className="text-xs text-purple-200/80 font-medium">
              Are you a driver?{" "}
              <Text className="font-bold text-white underline">Login as Driver</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
