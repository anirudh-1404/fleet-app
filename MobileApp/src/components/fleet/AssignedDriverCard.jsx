import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StatusBadge from "./StatusBadge";

export default function AssignedDriverCard({ name, licence, phone, status, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="bg-white border border-[#E8EDF3] rounded-[24px] p-5 flex-row items-center justify-between"
      style={{
        shadowColor: "#111827",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.015,
        shadowRadius: 10,
        elevation: 1,
      }}
    >
      <View className="flex-row items-center flex-1 mr-4">
        {/* Photo Placeholder */}
        <View className="w-12 h-12 rounded-full bg-[#F1F5F9] items-center justify-center mr-4 border border-[#E8EDF3]/30">
          <Ionicons name="person-outline" size={24} color="#6B7280" />
        </View>
        <View className="flex-1">
          <View className="flex-row justify-between items-center mr-2">
            <Text className="text-base font-bold text-[#111827]">{name}</Text>
            <StatusBadge status={status} />
          </View>
          <View className="flex-col gap-0.5 mt-1">
            <Text className="text-xs text-[#6B7280]">Licence: {licence}</Text>
            <Text className="text-xs text-[#6B7280]">{phone}</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#6B7280" />
    </TouchableOpacity>
  );
}
