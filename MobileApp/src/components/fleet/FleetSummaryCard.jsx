import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FleetSummaryCard({ label, value, icon }) {
  return (
    <View
      className="bg-white border border-[#E8EDF3] rounded-[24px] p-5 mr-4 w-[150px] justify-between"
      style={{
        shadowColor: "#111827",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.015,
        shadowRadius: 10,
        elevation: 1,
      }}
    >
      <View className="flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-[#111827]">{value}</Text>
        <View className="w-8 h-8 rounded-full bg-[#F1F5F9] items-center justify-center">
          <Ionicons name={icon} size={16} color="#6B7280" />
        </View>
      </View>
      <Text className="text-[11px] font-semibold text-[#6B7280] mt-4" numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}
