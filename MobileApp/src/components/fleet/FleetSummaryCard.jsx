import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FleetSummaryCard({ label, value, icon }) {
  return (
    <View
      className="bg-white border border-[#E2E8F0] rounded-[22px] p-4 mr-3.5 w-[145px] justify-between"
      style={{
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.025,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-2xl font-extrabold text-[#0F172A] tracking-tight">{value}</Text>
        <View className="w-8 h-8 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] items-center justify-center">
          <Ionicons name={icon} size={16} color="#475569" />
        </View>
      </View>
      <Text className="text-xs font-semibold text-[#64748B]" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
