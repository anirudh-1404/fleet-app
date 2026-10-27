import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StatusBadge from "./StatusBadge";

export default function VehicleSummaryCard({ name, registration, fleetNumber, status }) {
  return (
    <View
      className="bg-white border border-[#E8EDF3] rounded-[24px] p-5 flex-row items-center"
      style={{
        shadowColor: "#111827",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.015,
        shadowRadius: 10,
        elevation: 1,
      }}
    >
      {/* Vehicle Photo Placeholder */}
      <View className="w-14 h-14 rounded-[16px] bg-[#EEF4FF] items-center justify-center mr-4 border border-[#E8EDF3]/30">
        <Ionicons name="car-outline" size={28} color="#059669" />
      </View>
      <View className="flex-1">
        <View className="flex-row justify-between items-center mr-1">
          <Text className="text-base font-bold text-[#111827]">{name}</Text>
          <StatusBadge status={status} />
        </View>
        <Text className="text-xs text-[#6B7280] mt-1">
          Rego: {registration} <Text className="text-[#CBD5E1]">•</Text> Fleet: {fleetNumber}
        </Text>
      </View>
    </View>
  );
}
