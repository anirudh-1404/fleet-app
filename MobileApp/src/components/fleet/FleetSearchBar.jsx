import React from "react";
import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FleetSearchBar({ value, onChangeText }) {
  return (
    <View className="flex-row items-center bg-white border border-[#E8EDF3] rounded-[24px] px-4 h-[54px]">
      <View className="w-8 h-8 rounded-full bg-[#F1F5F9] items-center justify-center mr-3">
        <Ionicons name="search-outline" size={16} color="#6B7280" />
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search by registration, make, model or driver"
        placeholderTextColor="#6B7280"
        className="flex-1 text-[#111827]"
        style={{
          fontSize: 14,
          height: 54,
          paddingTop: 0,
          paddingBottom: 0,
          paddingVertical: 0,
          marginVertical: 0,
          textAlignVertical: "center",
          includeFontPadding: false,
        }}
      />
    </View>
  );
}
