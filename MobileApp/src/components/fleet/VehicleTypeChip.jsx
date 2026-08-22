import React from "react";
import { TouchableOpacity, Text } from "react-native";

export default function VehicleTypeChip({ label, isActive, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`rounded-full border mr-2.5 ${
        isActive
          ? "bg-[#2563EB] border-[#2563EB]"
          : "bg-white border-[#E8EDF3]"
      }`}
      style={{
        paddingHorizontal: 18,
        paddingVertical: 10,
      }}
    >
      <Text
        className={`text-xs font-semibold ${
          isActive ? "text-white" : "text-[#6B7280]"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
