import React from "react";
import { View, Text } from "react-native";

export default function DriverAvatar({ name, size = 44 }) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  return (
    <View
      className="rounded-full bg-[#EEF4FF] items-center justify-center border border-[#E8EDF3]"
      style={{ width: size, height: size }}
    >
      <Text className="text-xs font-bold text-[#2563EB] tracking-wider">{initials}</Text>
    </View>
  );
}
