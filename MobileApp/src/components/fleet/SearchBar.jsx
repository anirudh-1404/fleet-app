import React from "react";
import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SearchBar({ value, onChangeText }) {
  return (
    <View className="flex-row items-center bg-white border border-[#E8EDF3] rounded-[24px] px-4 h-[54px]">
      <View className="w-8 h-8 rounded-full bg-[#F1F5F9] items-center justify-center mr-3">
        <Ionicons name="search-outline" size={16} color="#6B7280" />
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search vehicle, driver or registration"
        placeholderTextColor="#6B7280"
        className="flex-1 text-sm text-[#111827] h-full"
        style={{ paddingVertical: 0 }}
      />
    </View>
  );
}
