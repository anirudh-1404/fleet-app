import React from "react";
import { View, Text } from "react-native";

export default function DetailRow({
  label,
  value,
  valueColor = "text-[#111827]",
  isBold = true,
  hasDivider = true,
  badge
}) {
  return (
    <View className={`flex-row justify-between items-center py-2.5 ${hasDivider ? "border-b border-[#F8FAFC]" : ""}`}>
      <Text className="text-xs font-semibold text-[#6B7280] flex-1 mr-2">{label}</Text>
      {badge ? (
        badge
      ) : (
        <Text className={`text-xs ${isBold ? "font-bold" : "font-medium"} ${valueColor} text-right flex-1`}>
          {value || "--"}
        </Text>
      )}
    </View>
  );
}
