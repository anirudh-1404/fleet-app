import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function InvoiceScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <View className="px-6 pt-4 flex-row items-center mb-5">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-white border border-[#E8EDF3] items-center justify-center mr-3"
          style={{
            shadowColor: "#111827",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.015,
            shadowRadius: 10,
            elevation: 1,
          }}
        >
          <Ionicons name="arrow-back-outline" size={20} color="#111827" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-[#111827]">Invoices</Text>
          <Text className="text-sm text-[#6B7280] mt-0.5">Billing & Receipts</Text>
        </View>
      </View>

      {/* Coming Soon Screen Center */}
      <View className="flex-1 justify-center items-center px-8 pb-12">
        <View
          className="w-20 h-20 rounded-[28px] bg-[#F5F3FF] border border-[#DDD6FE] items-center justify-center mb-5"
          style={{
            shadowColor: "#7C3AED",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 3,
          }}
        >
          <Ionicons name="receipt-outline" size={38} color="#7C3AED" />
        </View>

        <View className="px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 mb-3">
          <Text className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            Coming Soon 🚀
          </Text>
        </View>

        <Text className="text-2xl font-bold text-[#0F172A] text-center mb-2">
          Invoices & Billing Management
        </Text>

        <Text className="text-sm text-[#64748B] text-center leading-6 mb-8 px-4">
          Automated invoice generation, vehicle expense tracking, and vendor receipt management will be available in an upcoming update.
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          className="px-6 py-3.5 rounded-full bg-[#2563EB] items-center justify-center"
        >
          <Text className="text-white text-xs font-bold">Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
