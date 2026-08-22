import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TimelineCard({
  title,
  timestamp,
  icon = "checkmark-circle-outline",
  statusColorClass = "text-[#16A34A]",
  isLast = false
}) {
  return (
    <View className={`flex-row items-start py-4 ${!isLast ? "border-b border-[#E8EDF3]" : ""}`}>
      <View className="w-8 h-8 rounded-full bg-[#F8FAFC] border border-[#E8EDF3] items-center justify-center mr-3 mt-0.5">
        <Ionicons name={icon} size={16} color="#6B7280" />
      </View>
      <View className="flex-1">
        <Text className={`text-sm font-bold ${statusColorClass}`}>{title}</Text>
        <Text className="text-xs text-[#6B7280] mt-0.5">{timestamp}</Text>
      </View>
    </View>
  );
}
