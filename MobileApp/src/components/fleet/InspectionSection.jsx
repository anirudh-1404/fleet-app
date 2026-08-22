import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InspectionSection({ title, isExpanded, onToggle, isCompleted, children }) {
  return (
    <View
      className="bg-white border border-[#E8EDF3] rounded-[24px] mb-5 overflow-hidden"
      style={{
        shadowColor: "#111827",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.015,
        shadowRadius: 10,
        elevation: 1,
      }}
    >
      {/* Clickable Header */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onToggle}
        className="flex-row justify-between items-center p-5 bg-white"
      >
        <View className="flex-row items-center flex-1 mr-4">
          <Text className="text-base font-bold text-[#111827]">{title}</Text>
          {isCompleted && (
            <View className="flex-row items-center ml-2.5 bg-[#ECFDF5] px-2 py-0.5 rounded-full">
              <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
              <Text className="text-[9px] font-bold text-[#16A34A] uppercase ml-1">Done</Text>
            </View>
          )}
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"}
          size={18}
          color="#6B7280"
        />
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <View className="px-5 pb-5 pt-1 border-t border-[#E8EDF3]">
          {children}
        </View>
      )}
    </View>
  );
}
