import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function QuickActionCard({ title, description, icon, onPress }) {
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
            {description}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );
}
