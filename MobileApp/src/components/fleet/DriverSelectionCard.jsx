import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function DriverSelectionCard({
  driver,
  isSelected,
  onPress
}) {
  const isAssignedToOther = driver.vehicle && driver.vehicle !== "Not Assigned";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`border rounded-[24px] p-5 mb-4 flex-row items-center justify-between ${
        isSelected
          ? "bg-[#ECFDF5] border-[#059669]"
          : "bg-white border-[#E8EDF3]"
      }`}
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
          <Ionicons name="person-outline" size={22} color="#6B7280" />
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between items-center mr-2">
            <Text className="text-base font-bold text-[#111827]">{driver.name}</Text>
            {/* Availability Badge */}
            <View className={`px-2.5 py-0.5 rounded-full ${
              isAssignedToOther ? "bg-[#FFFBEB]" : "bg-[#ECFDF5]"
            }`}>
              <Text className={`text-[10px] font-bold ${
                isAssignedToOther ? "text-[#D97706]" : "text-[#16A34A]"
              }`}>
                {isAssignedToOther ? `Assigned (${driver.vehicle})` : "Available"}
              </Text>
            </View>
          </View>

          <View className="flex-col gap-0.5 mt-1.5">
            <Text className="text-xs text-[#6B7280]">Licence: {driver.licence}</Text>
            <Text className="text-xs text-[#6B7280]">{driver.phone}</Text>
          </View>
        </View>
      </View>

      {/* Checkmark selection Indicator */}
      <View className="w-6 h-6 items-center justify-center">
        {isSelected ? (
          <Ionicons name="checkmark-circle" size={24} color="#059669" />
        ) : (
          <View className="w-5 h-5 rounded-full border border-[#CBD5E1]" style={{ borderWidth: 2 }} />
        )}
      </View>
    </TouchableOpacity>
  );
}
