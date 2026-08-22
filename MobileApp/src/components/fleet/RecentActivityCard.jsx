import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function RecentActivityCard({ title, subtitle, icon, isLast, statusColorClass = "text-[#16A34A]" }) {
  const parts = subtitle.split(" • ");
  const hasStatus = parts.length > 1;

  return (
    <View className={`flex-row items-center py-4 ${!isLast ? "border-b border-[#E8EDF3]" : ""}`}>
      <View className="w-10 h-10 rounded-full bg-[#F1F5F9] items-center justify-center">
        <Ionicons name={icon} size={18} color="#111827" />
      </View>
      <View className="flex-1 ml-4">
        <Text className="text-sm font-semibold text-[#111827]">{title}</Text>
        <Text className="text-xs text-[#6B7280] mt-0.5">
          {hasStatus ? (
            <>
              <Text className={`${statusColorClass} font-semibold`}>{parts[0]}</Text>
              {" • "}{parts[1]}
            </>
          ) : (
            subtitle
          )}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#6B7280" />
    </View>
  );
}
