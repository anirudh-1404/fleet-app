import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function EmptyState({
  title = "No Vehicles Found",
  subtitle = "Add your first vehicle to start managing your fleet.",
  actionText = "Add Vehicle",
  icon = "car-outline",
  onActionPress
}) {
  return (
    <View className="items-center justify-center py-12 px-6 bg-white border border-[#E8EDF3] rounded-[24px]"
      style={{
        shadowColor: "#111827",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.015,
        shadowRadius: 10,
        elevation: 1,
      }}
    >
      <View className="w-16 h-16 rounded-full bg-[#EEF4FF] items-center justify-center mb-4">
        <Ionicons name={icon} size={32} color="#059669" />
      </View>
      <Text className="text-base font-bold text-[#111827] text-center">
        {title}
      </Text>
      <Text className="text-sm text-[#6B7280] text-center mt-2 mb-6 max-w-[280px] leading-5">
        {subtitle}
      </Text>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onActionPress}
        className="bg-[#059669] rounded-[24px] px-6 py-3"
      >
        <Text className="text-white text-sm font-semibold">{actionText}</Text>
      </TouchableOpacity>
    </View>
  );
}
