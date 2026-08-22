import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ReviewSection({ title, isExpanded, onToggle, children }) {
  return (
    <View
      className="bg-white border border-[#E8EDF3] rounded-[24px] mb-4 overflow-hidden"
      style={{
        shadowColor: "#111827",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.015,
        shadowRadius: 10,
        elevation: 1,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onToggle}
        className="flex-row justify-between items-center p-5 bg-white"
      >
        <Text className="text-base font-bold text-[#111827]">{title}</Text>
        <Ionicons
          name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"}
          size={18}
          color="#6B7280"
        />
      </TouchableOpacity>
      {isExpanded && (
        <View className="px-5 pb-3 pt-1 border-t border-[#E8EDF3] bg-white">
          {children}
        </View>
      )}
    </View>
  );
}
