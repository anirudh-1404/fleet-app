import React from "react";
import { Text, View } from "react-native";

export default function SectionHeader({ title, className = "" }) {
  return (
    <View className={`mb-4 ${className}`}>
      <Text className="text-base font-semibold text-[#111827]">{title}</Text>
    </View>
  );
}
