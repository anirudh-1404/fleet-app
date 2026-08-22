import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FleetActionCard({ title, subtitle, icon, isFeatured, onPress }) {
  if (isFeatured) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        className="w-full bg-white border border-[#E8EDF3] rounded-[24px] p-5 flex-row items-center justify-between min-h-[96px]"
        style={{
          shadowColor: "#111827",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.015,
          shadowRadius: 10,
          elevation: 1,
        }}
      >
        <View className="flex-row items-center flex-1 mr-4">
          <View className="w-12 h-12 rounded-full bg-[#EEF4FF] items-center justify-center mr-4">
            <Ionicons name={icon} size={24} color="#2563EB" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-[#111827]">{title}</Text>
            <Text className="text-xs text-[#6B7280] mt-0.5">{subtitle}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#6B7280" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-1 bg-white border border-[#E8EDF3] rounded-[24px] p-5 justify-between min-h-[145px]"
      style={{
        shadowColor: "#111827",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.015,
        shadowRadius: 10,
        elevation: 1,
      }}
    >
      <View className="w-10 h-10 rounded-full bg-[#EEF4FF] items-center justify-center">
        <Ionicons name={icon} size={20} color="#2563EB" />
      </View>
      <View className="flex-row justify-between items-end mt-5">
        <View className="flex-1 mr-2">
          <Text className="text-sm font-semibold text-[#111827]">{title}</Text>
          <Text className="text-[11px] text-[#6B7280] mt-0.5" numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );
}
